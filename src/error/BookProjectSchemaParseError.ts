import type { ZodError } from 'zod/v4';
import { EpubCookerFeatureError } from './EpubCookerFeatureError';

export class BookProjectSchemaParseError extends EpubCookerFeatureError {
  public readonly errorName = 'BookProjectSchemaParseError';
  public readonly details: ZodError['issues'];

  constructor(public readonly cause: ZodError) {
    super(cause);
    this.details = cause.issues;
  }
}
