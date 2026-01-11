import path from 'node:path';
import { EpubCookerError } from '../../../error/EpubCookerError';
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
export const runMarkdownItemProcessor: ItemProcessor<MarkdownParser> = (
  { filePath, fileType },
  contentsDir,
  saveDir,
  projectCssPath,
  parser,
) =>
  tryThrows<IllegalFileTypeError>()(() => {
    if (fileType == null || !supportedFileTypes.includes(fileType)) {
      throw new IllegalFileTypeError(fileType, supportedFileTypes);
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
        serializedXhtml: convertToEpubXhtml(htmlText, title, cssPaths),
        itemPath,
      } as const;
    })
    .andThen(({ itemPath, serializedXhtml }) =>
      FileIo.save(resolvePath(saveDir, itemPath), serializedXhtml).map(() => itemPath),
    )
    .mapErr((e) => new EpubCookerError('MarkdownItemProcessor', e));
