import * as path from 'node:path';
import z4 from 'zod/v4';

export const _resolvedPathSchema = z4.string().brand('resolvedPath');

// TODO Windows環境ではうまく動かないはず。

export type ResolvedPath = z4.infer<typeof _resolvedPathSchema>;

export function resolvePath(...paths: string[]): ResolvedPath {
  return _resolvedPathSchema.parse(path.resolve(...paths));
}
