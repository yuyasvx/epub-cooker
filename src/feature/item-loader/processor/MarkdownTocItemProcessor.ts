import path from 'node:path';
import type { FileIoError } from '../../../lib/file-io/error/FileIoError';
import * as FileIo from '../../../lib/file-io/FileIo';
import type { MarkdownParser } from '../../../lib/markdown-parser/MarkdownParser';
import { tryThrows } from '../../../lib/util/EffectUtil';
import { changeFileExtension, removeExtension } from '../../../lib/util/FileExtensionUtil';
import { convertToEpubXhtml } from '../../../lib/xhtml-converter/HtmlUtil';
import { ItemPath } from '../../../value/ItemPath';
import { resolvePath } from '../../../value/ResolvedPath';
import { IllegalFileTypeError, type ItemProcessor, resolveProjectCssPath } from './ItemProcessor';

const supportedFileTypes = ['text/markdown'];

/**
 * @internal
 */
export const runMarkdownTocItemProcessor: ItemProcessor<MarkdownParser, IllegalFileTypeError | FileIoError> = (
  { filePath, fileType },
  contentsDir,
  saveDir,
  projectCssPath,
  parser,
) =>
  tryThrows<IllegalFileTypeError>()(() => {
    if (fileType == null || !supportedFileTypes.includes(fileType)) {
      throw new IllegalFileTypeError(filePath, fileType, supportedFileTypes);
    }
  })
    .asyncAndThen(() =>
      FileIo.getFile(filePath)
        .map((b) => b.toString())
        .map((str) => parser.parseMarkdown(str, filePath)),
    )
    .map(
      (parsed) =>
        ({
          ...parsed,
          htmlText: addNavElement(parsed.htmlText),
          title: parsed.title ?? removeExtension(path.relative(contentsDir, filePath)),
        }) as const,
    )
    .map(({ cssPath, htmlText, title }) => {
      const itemPath = ItemPath.createFromRelative(contentsDir, changeFileExtension(filePath, 'xhtml'));
      const cssPaths: string[] = [];

      if (projectCssPath != null) {
        cssPaths.push(resolveProjectCssPath(projectCssPath, itemPath));
      }

      if (cssPath != null) {
        cssPaths.push(cssPath);
      }

      return {
        serializedXhtml: convertToEpubXhtml(htmlText, title),
        itemPath,
      } as const;
    })
    .andThen(({ itemPath, serializedXhtml }) =>
      FileIo.save(resolvePath(saveDir, itemPath), serializedXhtml).map(() => itemPath),
    );

function addNavElement(htmlText: string) {
  return `<nav epub:type="toc" id="toc">${htmlText}</nav>`;
}
