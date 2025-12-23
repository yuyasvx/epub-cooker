import { AbstractError } from './AbstractError';

export class EpubCookerError extends AbstractError {
  constructor(
    public readonly errorName: string,
    public readonly cause: unknown,
  ) {
    super();
  }
}
