import type { PageLayoutType } from '../enums/PageLayoutType';
import type { SourceHandlingType } from '../enums/SourceHandlingType';
import { EpubCookerError } from './EpubCookerError';

export class IllegalSourceHandlingTypeError extends EpubCookerError {
  constructor(
    readonly layoutType: PageLayoutType,
    readonly using: SourceHandlingType,
  ) {
    super('IllegalSourceHandlingTypeError', undefined);
  }
}
