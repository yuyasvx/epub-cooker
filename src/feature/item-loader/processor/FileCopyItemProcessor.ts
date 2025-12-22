import { EpubCookerError } from '../../../error/EpubCookerError';
import * as FileIo from '../../../lib/file-io/FileIo';
import { ItemPath } from '../../../value/ItemPath';
import type { ItemProcessor } from './ItemProcessor';

/**
 * @internal
 * @param file
 * @param contentsDir
 * @param saveDir
 * @returns
 */
export const runFileCopyItemProcessor: ItemProcessor = (file, contentsDir, saveDir) => {
  const itemPath = ItemPath.createFromRelative(contentsDir, file);
  return FileIo.copyOne(file, ItemPath.getDestination(itemPath, saveDir))
    .map(() => itemPath)
    .mapErr((e) => new EpubCookerError('FileCopyItemProcessorError', e));
};
