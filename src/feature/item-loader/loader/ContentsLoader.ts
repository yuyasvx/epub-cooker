import type { ResultAsync } from 'neverthrow';
import type { EpubCookerError } from '../../../error/EpubCookerError';
import type { ResolvedPath } from '../../../value/ResolvedPath';
import type { LoadedProject } from '../../project-loader';
import type { ProcessedItem } from './value/ProcessedItem';

/** @internal */
export type ContentsLoader = (
  loadedProject: LoadedProject,
  saveTo: ResolvedPath,
) => ResultAsync<[LoadedProject, ProcessedItem[]], EpubCookerError>;
