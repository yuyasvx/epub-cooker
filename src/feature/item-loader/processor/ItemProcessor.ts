import type { ResultAsync } from 'neverthrow';
import path from 'node:path';
import { AbstractEpubCookerError } from '../../../error/AbstractEpubCookerError';
import type { EpubCookerFeatureError } from '../../../error/EpubCookerFeatureError';
import type { InputFileDetail } from '../../../value/InputFileDetail';
import type { ItemPath } from '../../../value/ItemPath';
import type { ResolvedPath } from '../../../value/ResolvedPath';

/** @internal */
export type ItemProcessor<T = void, E = EpubCookerFeatureError> = (
  input: InputFileDetail,
  contentsDir: ResolvedPath,
  saveDir: ResolvedPath,
  projectCssPath: string | void,
  processorEngine: T,
) => ResultAsync<ItemPath, E>;

/** @internal */
export class IllegalFileTypeError extends AbstractEpubCookerError {
  constructor(
    public readonly filePath: string,
    public readonly fileType: string | undefined,
    public readonly allowedTypes: string[],
  ) {
    super();
  }
}

/** @internal */
export function resolveProjectCssPath(projectCssPath: string, itemPath: ItemPath) {
  return path.relative(path.join(itemPath, '../'), projectCssPath);
}
