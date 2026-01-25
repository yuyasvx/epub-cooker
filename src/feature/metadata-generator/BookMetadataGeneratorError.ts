import { EpubCookerFeatureError } from '../../error/EpubCookerFeatureError';

export class BookMetadataGeneratorError extends EpubCookerFeatureError {
  public readonly errorName = 'BookMetadataGeneratorError';

  constructor(
    public readonly filePath: string,
    public readonly cause: unknown,
  ) {
    super(cause);
  }
}
