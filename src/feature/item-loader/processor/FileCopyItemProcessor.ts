import type { FileIoError } from '../../../lib/file-io/error/FileIoError';
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
export const runFileCopyItemProcessor: ItemProcessor<void, FileIoError> = (file, contentsDir, saveDir) => {
  const itemPath = ItemPath.createFromRelative(contentsDir, file.filePath);
  return FileIo.copyOne(file.filePath, ItemPath.getDestination(itemPath, saveDir)).map(() => itemPath);
};
