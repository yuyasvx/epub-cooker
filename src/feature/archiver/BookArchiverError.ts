import { EpubCookerFeatureError } from '../../error/EpubCookerFeatureError';
import type { ResolvedPath } from '../../value/ResolvedPath';

export class BookArchiverError extends EpubCookerFeatureError {
  public readonly errorName = 'BookArchiverError';
  constructor(
    public readonly workingDir: ResolvedPath,
    public readonly destination: ResolvedPath,
    public readonly cause: unknown,
  ) {
    super(cause);
  }
}
