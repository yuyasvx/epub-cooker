import { AbstractAppError } from "./AbstractAppError";

export class AppError extends AbstractAppError {
  constructor(
    readonly code: string,
    readonly cause?: unknown,
  ) {
    super();
  }
}

export class ProjectFileNotFoundError extends AbstractAppError {
  readonly code = "PROJECT_NOT_FOUND";
}

export class ProjectInvalidError extends AbstractAppError {
  readonly code = "PROJECT_INVALID";
}
