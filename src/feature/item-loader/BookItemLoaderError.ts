import { EpubCookerFeatureError } from '../../error/EpubCookerFeatureError';

export class BookItemLoaderError<T extends BookItemLoaderErrorType> extends EpubCookerFeatureError {
  public readonly errorName = 'BookItemLoaderError';
  constructor(
    public readonly type: T,
    public readonly detail: BookItemLoaderErrorTypeDetailMap[T],
    public readonly cause: unknown,
  ) {
    super(cause);
  }
}

export const BookItemLoaderErrorType = {
  FileIo: 'fileIo',
  IllegalFileType: 'illegalFileType',
} as const;

export type BookItemLoaderErrorType = (typeof BookItemLoaderErrorType)[keyof typeof BookItemLoaderErrorType];

type BookItemLoaderErrorTypeDetailMap = {
  [BookItemLoaderErrorType.FileIo]: { filePath: string };
  [BookItemLoaderErrorType.IllegalFileType]: { fileType?: string; allowedTypes: string[] };
};
