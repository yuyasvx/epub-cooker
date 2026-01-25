import { EpubCookerFeatureError } from '../../../error/EpubCookerFeatureError';

export class BookProjectLoaderError extends EpubCookerFeatureError {
  public readonly errorName = 'BookProjectLoaderError';

  private constructor(
    public readonly type: BookProjectLoaderErrorType,
    public readonly detail: BookProjectLoaderErrorTypeDetailMap[BookProjectLoaderErrorType],
    public readonly cause: unknown,
  ) {
    super(cause);
  }

  static from<T extends BookProjectLoaderErrorType>(
    type: T,
    detail: BookProjectLoaderErrorTypeDetailMap[T],
    cause: unknown,
  ) {
    return new BookProjectLoaderError(type, detail, cause);
  }

  getDetail<T extends BookProjectLoaderErrorType>() {
    return this.detail as BookProjectLoaderErrorTypeDetailMap[T];
  }
}

export const BookProjectLoaderErrorType = {
  FileIo: 'FileIo',
  ProjectNotFound: 'ProjectNotFound',
  BookProjectSchemaParse: 'BookProjectSchemaParse',
  BookIdentification: 'BookIdentification',
  IllegalBookSourceHandlingType: 'IllegalBookSourceHandlingType',
  EmptyInputItems: 'EmptyInputItems',
} as const;

export type BookProjectLoaderErrorType = (typeof BookProjectLoaderErrorType)[keyof typeof BookProjectLoaderErrorType];

type BookProjectLoaderErrorTypeDetailMap = {
  [BookProjectLoaderErrorType.FileIo]: { filePath: string };
  [BookProjectLoaderErrorType.ProjectNotFound]: { prjectDir: string };
  [BookProjectLoaderErrorType.BookProjectSchemaParse]: { keys: string[] };
  [BookProjectLoaderErrorType.BookIdentification]: void;
  [BookProjectLoaderErrorType.IllegalBookSourceHandlingType]: { layoutType: string; using: string };
  [BookProjectLoaderErrorType.EmptyInputItems]: { prjectDir: string };
};
