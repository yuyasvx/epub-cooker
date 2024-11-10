/**
 * @internal
 */
export abstract class AbstractError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
