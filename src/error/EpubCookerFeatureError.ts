import { AbstractEpubCookerError } from './AbstractEpubCookerError';

export abstract class EpubCookerFeatureError extends AbstractEpubCookerError {
  public abstract readonly errorName: string;

  constructor(public readonly cause: unknown) {
    super();
  }
}
