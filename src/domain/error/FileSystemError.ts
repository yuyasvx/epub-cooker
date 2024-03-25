import { Case } from "../enums/Case";
import { NodeErrorType } from "../enums/NodeJsErrorType";
import { AbstractAppError } from "./AbstractAppError";

export class FileSystemError extends AbstractAppError {
  constructor(readonly cause: Record<string, unknown>) {
    super();
  }

  get errorType(): Case<typeof NodeErrorType> {
    return this.cause.code as Case<typeof NodeErrorType>;
  }
}
