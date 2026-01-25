export abstract class AbstractEpubCookerError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export interface ErrorCodable {
  errorName: string;
}
