import { AbstractEpubCookerError } from '../../error/AbstractEpubCookerError';
import { EpubCookerFeatureError } from '../../error/EpubCookerFeatureError';

export class BookProjectLoaderError<T extends BookProjectLoaderErrorType> extends EpubCookerFeatureError {
  public readonly errorName = 'BookProjectLoaderError';

  constructor(
    public readonly type: T,
    public readonly detail: BookProjectLoaderErrorTypeDetailMap[T],
    public readonly cause: unknown,
  ) {
    super(cause);
  }
}

export const BookProjectLoaderErrorType = {
  FileIo: 'FileIo',
  ProjectNotFound: 'ProjectNotFound',
  BookProjectSchemaParse: 'BookProjectSchemaParse',
  BookIdentification: 'BookIdentification',
  IllegalBookSourceHandlingType: 'IllegalBookSourceHandlingType',
} as const;

export type BookProjectLoaderErrorType = (typeof BookProjectLoaderErrorType)[keyof typeof BookProjectLoaderErrorType];

/**
 * @internal
 */
export class ProjectNotFoundError extends AbstractEpubCookerError {
  constructor(readonly projectDir: string) {
    super();
  }
}

type BookProjectLoaderErrorTypeDetailMap = {
  [BookProjectLoaderErrorType.FileIo]: { filePath: string };
  [BookProjectLoaderErrorType.ProjectNotFound]: { prjectDir: string };
  [BookProjectLoaderErrorType.BookProjectSchemaParse]: { keys: string[] };
  [BookProjectLoaderErrorType.BookIdentification]: void;
  [BookProjectLoaderErrorType.IllegalBookSourceHandlingType]: { layoutType: string; using: string };
};
