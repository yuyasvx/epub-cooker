import { DomainRegulationError } from "./DomainRegulationError";

export type EpubProjecErrors =
  | InvalidRawDataError
  | InvalidVersionError
  | InvalidIdentifierError
  | InvalidAdditionalMetadataError
  | InvalidBookMetadataError;

export class InvalidRawDataError extends DomainRegulationError {
  readonly _tag = "InvalidRawDataError";
  constructor() {
    super("INVALID_RAW_DATA");
  }
}

export class InvalidVersionError extends DomainRegulationError {
  readonly _tag = "InvalidVersionError";
  constructor() {
    super("INVALID_VERSION");
  }
}

export class InvalidIdentifierError extends DomainRegulationError {
  constructor() {
    super("INVALID_IDENTIFIER");
  }
}

export class InvalidAdditionalMetadataError extends DomainRegulationError {
  constructor() {
    super("INVALID_ADDITIONAL_METADATA");
  }
}

export class InvalidBookMetadataError extends DomainRegulationError {
  constructor(readonly type?: string) {
    super(`INVALID_BOOK_METADATA, ${type}`);
  }
}
