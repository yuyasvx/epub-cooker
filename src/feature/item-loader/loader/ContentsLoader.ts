import type { ResultAsync } from 'neverthrow';
import type { EpubProject } from '../../../value/EpubProject';
import type { InputFileDetail } from '../../../value/InputFileDetail';
import type { ResolvedPath } from '../../../value/ResolvedPath';
import type { ProcessedItem } from './value/ProcessedItem';

/** @internal */
export type ContentsLoader<E> = (
  project: EpubProject,
  inputFiles: InputFileDetail[],
  saveTo: ResolvedPath,
) => ResultAsync<[EpubProject, ProcessedItem[]], E>;
