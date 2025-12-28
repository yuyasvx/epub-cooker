import mime from 'mime-types';
import path from 'node:path';
import { EpubCookerError } from '../../../error/EpubCookerError';
import * as FileIo from '../../../lib/file-io/FileIo';
import { parseMarkdown } from '../../../lib/markdown-parser/MarkdownParser';
import { pipe, tryThrows, unwrap } from '../../../lib/util/EffectUtil';
import { changeFileExtension, removeExtension } from '../../../lib/util/FileExtensionUtil';
import { convertToEpubXhtml } from '../../../lib/xhtml-converter/HtmlUtil';
import { ItemPath } from '../../../value/ItemPath';
import { resolvePath } from '../../../value/ResolvedPath';
import { IllegalFileTypeError, type ItemProcessor } from './ItemProcessor';

const supportedFileTypes = ['text/markdown'];

/**
 * @internal
 */
export const runMarkdownTocItemProcessor: ItemProcessor = (file, contentsDir, saveDir) =>
  tryThrows<IllegalFileTypeError>()(() => {
    const fileType = unwrap(pipe(mime.lookup(file)).map((m) => (m === false ? undefined : m)));

    if (fileType == null || !supportedFileTypes.includes(fileType)) {
      throw new IllegalFileTypeError(fileType, supportedFileTypes);
    }
  })
    .asyncAndThen(() =>
      FileIo.getFile(file)
        .map((b) => b.toString())
        .map(parseMarkdown),
    )
    .map(
      (parsed) =>
        ({
          ...parsed,
          htmlText: addNavElement(parsed.htmlText),
          title: parsed.title ?? removeExtension(path.relative(contentsDir, file)),
        }) as const,
    )
    .map(({ htmlText, title }) => {
      const itemPath = ItemPath.createFromRelative(contentsDir, changeFileExtension(file, 'xhtml'));

      return {
        serializedXhtml: convertToEpubXhtml(htmlText, title),
        itemPath,
      } as const;
    })
    .andThen(({ itemPath, serializedXhtml }) =>
      FileIo.save(resolvePath(saveDir, itemPath), serializedXhtml).map(() => itemPath),
    )
    .mapErr((e) => new EpubCookerError('MarkdownItemProcessor', e));

function addNavElement(htmlText: string) {
  return `<nav epub:type="toc" id="toc">${htmlText}</nav>`;
}
