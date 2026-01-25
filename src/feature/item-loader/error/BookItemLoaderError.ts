import { EpubCookerFeatureError } from '../../../error/EpubCookerFeatureError';

export class BookItemLoaderError extends EpubCookerFeatureError {
  public readonly errorName = 'BookItemLoaderError';

  private constructor(
    public readonly type: BookItemLoaderErrorType,
    public readonly detail: BookItemLoaderErrorTypeDetailMap[BookItemLoaderErrorType],
    public readonly cause: unknown,
  ) {
    super(cause);
  }

  static from<T extends BookItemLoaderErrorType>(type: T, detail: BookItemLoaderErrorTypeDetailMap[T], cause: unknown) {
    return new BookItemLoaderError(type, detail, cause);
  }

  getDetail<T extends BookItemLoaderErrorType>() {
    return this.detail as BookItemLoaderErrorTypeDetailMap[T];
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
