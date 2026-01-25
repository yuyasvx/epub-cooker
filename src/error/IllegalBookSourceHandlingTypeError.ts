import type { PageLayoutType } from '../enums/PageLayoutType';
import type { SourceHandlingType } from '../enums/SourceHandlingType';
import { AbstractEpubCookerError } from './AbstractEpubCookerError';

export class IllegalBookSourceHandlingTypeError extends AbstractEpubCookerError {
  constructor(
    readonly layoutType: PageLayoutType,
    readonly using: SourceHandlingType,
  ) {
    super();
  }
}
