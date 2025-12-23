import nodePath from 'node:path';
import z4 from 'zod/v4';
import { type ResolvedPath, resolvePath } from './ResolvedPath';

const itemPathSchema = z4.string().brand('itemPath');

/**
 * @internal
 * あるディレクトリからの相対パスを示したもの（どのディレクトリからなのかはわからない）
 */
export type ItemPath = z4.infer<typeof itemPathSchema>;

/** @internal */
export function ItemPath(path: string): ItemPath {
  return itemPathSchema.parse(path);
}

/** @internal */
ItemPath.createFromRelative = function (contentsDir: ResolvedPath, file: ResolvedPath) {
  const nContentsDir = nodePath.posix.normalize(contentsDir);
  const nFile = nodePath.posix.normalize(file);

  return ItemPath(nodePath.posix.relative(nContentsDir, nFile));
};

ItemPath.getDestination = function (itemPath: ItemPath, baseDir: ResolvedPath) {
  return resolvePath(baseDir, itemPath);
};
