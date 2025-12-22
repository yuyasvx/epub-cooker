import { NodeErrorType } from '../../../enums/NodeJsErrorType';
import { AbstractError } from '../../../error/AbstractError';

/**
 * @internal
 */
export class FileIoError extends AbstractError {
  protected constructor(
    readonly path: string,
    readonly cause?: unknown,
  ) {
    super();
  }

  static from(path: string, code: NodeErrorType, cause?: unknown): FileIoError {
    switch (code) {
      case NodeErrorType.NO_SUCH_FILE_OR_DIRECTORY:
        return new FileNotFoundError(path, cause);
      case NodeErrorType.PERMISSION_DENIED:
        return new FileSystemPermissionError(path, cause);
      case NodeErrorType.NO_SPACE_LEFT:
        return new FileStorageNoSpaceError(path, cause);
      case NodeErrorType.DEVICE_OR_RESOURCE_IS_BUSY:
        return new ResourceUnavailableError(path, cause);
      case NodeErrorType.READ_ONLY:
        return new FileSystemReadOnlyError(path, cause);
      case NodeErrorType.FILE_EXISTS:
        return new FileAlreadyExistsError(path, cause);
      case NodeErrorType.NOT_A_DIRECTORY:
        return new NotDirectoryError(path, cause);
      default:
        return new UnknownFileIoError(path, code, cause);
    }
  }
}

/**
 * @internal
 */
export class FileNotFoundError extends FileIoError {}

/**
 * @internal
 */
export class FileSystemPermissionError extends FileIoError {
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
export class ResourceUnavailableError extends FileIoError {
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
export class NotDirectoryError extends FileIoError {
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
  constructor(
    readonly path: string,
    readonly code: string,
    readonly cause?: unknown,
  ) {
    super(path, cause);
  }
}
