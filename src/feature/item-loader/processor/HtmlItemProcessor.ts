import { EpubCookerError } from '../../../error/EpubCookerError';
import * as FileIo from '../../../lib/file-io/FileIo';
import { tryThrows } from '../../../lib/util/EffectUtil';
import { changeFileExtension } from '../../../lib/util/FileExtensionUtil';
import { convertToEpubXhtml } from '../../../lib/xhtml-converter/HtmlUtil';
import { ItemPath } from '../../../value/ItemPath';
import { IllegalFileTypeError, type ItemProcessor, resolveProjectCssPath } from './ItemProcessor';

const supportedFileTypes = ['text/html', 'application/xhtml+xml'];

/**
 * @internal
 */
export const runHtmlItemProcessor: ItemProcessor = ({ filePath, fileType }, { contentsDir }, saveDir, projectCssPath) =>
  tryThrows<IllegalFileTypeError>()(() => {
    if (fileType == null || !supportedFileTypes.includes(fileType)) {
      throw new IllegalFileTypeError(fileType, supportedFileTypes);
    }
  })
    .asyncAndThen(() => FileIo.getFile(filePath).map((b) => b.toString()))
    .map((sourceText) => {
      const itemPath = ItemPath.createFromRelative(contentsDir, changeFileExtension(filePath, 'xhtml'));
      const cssPaths: string[] = [];
      if (projectCssPath != null) {
        cssPaths.push(resolveProjectCssPath(projectCssPath, itemPath));
      }

      return {
        serializedXhtml: convertToEpubXhtml(sourceText, undefined, cssPaths),
        itemPath,
      } as const;
    })
    .andThen(({ itemPath, serializedXhtml }) =>
      FileIo.save(ItemPath.getDestination(itemPath, saveDir), serializedXhtml).map(() => itemPath),
    )
    .mapErr((e) => new EpubCookerError('MarkdownItemProcessor', e));
