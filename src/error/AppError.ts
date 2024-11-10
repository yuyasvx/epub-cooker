import { AbstractError } from "./AbstractError";

export class AppError extends AbstractError {
  constructor(readonly cause?: unknown) {
    super();
  }
}

export class ProjectFileNotFoundError extends AppError {
  static _tagName = "ProjectFileNotFoundError" as const;

  readonly _tag = ProjectFileNotFoundError._tagName;

  constructor(readonly path: string) {
    super();
  }
}
