import { AbstractError } from './AbstractError';

export class ValueGenerationError extends AbstractError {
  constructor(
    private valueName?: string,
    public readonly cause?: unknown,
  ) {
    super(`failed to generate value:${valueName}`);
  }
}
