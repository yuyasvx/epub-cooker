import type { ResultAsync } from 'neverthrow';
import path from 'node:path';
import { EpubCookerError } from '../../../error/EpubCookerError';
import type { InputFileDetail } from '../../../value/InputFileDetail';
import type { ItemPath } from '../../../value/ItemPath';
import type { ResolvedPath } from '../../../value/ResolvedPath';
import type { LoadedProject } from '../../project-loader';

/** @internal */
export type ItemProcessor = (
  input: InputFileDetail,
  loadedProject: LoadedProject,
  saveDir: ResolvedPath,
  projectCssPath?: string,
) => ResultAsync<ItemPath, EpubCookerError>;

/** @internal */
export class IllegalFileTypeError extends EpubCookerError {
  constructor(
    readonly fileType: string | undefined,
    readonly allowedTypes: string[],
  ) {
    super('IllegalFileTypeError', undefined);
  }
}

/** @internal */
export function resolveProjectCssPath(projectCssPath: string, itemPath: ItemPath) {
  return path.relative(path.join(itemPath, '../'), projectCssPath);
}
