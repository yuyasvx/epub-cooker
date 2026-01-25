import { EpubCookerFeatureError } from '../../error/EpubCookerFeatureError';
import type { ResolvedPath } from '../../value/ResolvedPath';

export class BookIdentificationError extends EpubCookerFeatureError {
  public readonly errorName = 'BookIdentificationError';

  constructor(
    public readonly destination: ResolvedPath,
    public readonly cause: unknown,
  ) {
    super(cause);
  }
}
