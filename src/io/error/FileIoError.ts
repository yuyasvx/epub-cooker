import { Case } from "../../util/Case";
import { NodeErrorType } from "../../domain/enums/NodeJsErrorType";
import { AppError } from "../../error/AppError";

/**
 * @internal
 */
export class FileIoError extends AppError {
  static from(path: string, code: Case<typeof NodeErrorType>, cause?: unknown): FileIoError {
    switch (code) {
      case NodeErrorType.NO_SUCH_FILE_OR_DIRECTORY:
        return new FileNotFoundError(path, cause);
      case NodeErrorType.PERMISSION_DENIED:
        return new FileSystemPermissionError(path, cause);
      case NodeErrorType.NO_SPACE_LEFT:
        return new FileStorageNoSpaceError(path, cause);
      case NodeErrorType.DEVICE_OR_RESOURCE_IS_BUSY:
        return new FileResorceUnavailableError(path, cause);
      case NodeErrorType.READ_ONLY:
        return new FileSystemReadOnlyError(path, cause);
      case NodeErrorType.FILE_EXISTS:
        return new FileAlreadyExistsError(path, cause);
      default:
        return new UnknownFileIoError(path, code, cause);
    }
  }

  protected constructor(
    readonly path: string,
    readonly cause?: unknown,
  ) {
    super(cause);
  }
}

/**
 * @internal
 */
export class FileNotFoundError extends FileIoError {
  static _tagName = "FileNotFoundError" as const;
  readonly _tag = FileNotFoundError._tagName;
}

/**
 * @internal
 */
export class FileSystemPermissionError extends FileIoError {
  static _tagName = "FileSystemPermissionError" as const;
  readonly _tag = FileSystemPermissionError._tagName;

  constructor(
    readonly path: string,
    readonly cause?: unknown,
  ) {
    super(path, cause);
  }
}

/**
 * @internal
 */
export class FileStorageNoSpaceError extends FileIoError {
  static _tagName = "FileStorageNoSpaceError" as const;
  readonly _tag = FileStorageNoSpaceError._tagName;

  constructor(
    readonly path: string,
    readonly cause?: unknown,
  ) {
    super(path, cause);
  }
}

/**
 * @internal
 */
export class FileResorceUnavailableError extends FileIoError {
  static _tagName = "FileResorceUnavailableError" as const;
  readonly _tag = FileResorceUnavailableError._tagName;

  constructor(
    readonly path: string,
    readonly cause?: unknown,
  ) {
    super(path, cause);
  }
}

/**
 * @internal
 */
export class FileSystemReadOnlyError extends FileIoError {
  static _tagName = "FileSystemReadOnlyError" as const;
  readonly _tag = FileSystemReadOnlyError._tagName;

  constructor(
    readonly path: string,
    readonly cause?: unknown,
  ) {
    super(path, cause);
  }
}

/**
 * @internal
 */
export class FileAlreadyExistsError extends FileIoError {
  static _tagName = "FileAlreadyExistsError" as const;
  readonly _tag = FileAlreadyExistsError._tagName;

  constructor(
    readonly path: string,
    readonly cause?: unknown,
  ) {
    super(path, cause);
  }
}

/**
 * @internal
 */
export class UnknownFileIoError extends FileIoError {
  static _tagName = "UnknownFileIoError" as const;
  readonly _tag = UnknownFileIoError._tagName;

  constructor(
    readonly path: string,
    readonly code: string,
    readonly cause?: unknown,
  ) {
    super(path, cause);
  }
}
