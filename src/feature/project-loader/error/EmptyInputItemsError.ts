import { AbstractEpubCookerError } from '../../../error/AbstractEpubCookerError';

/**
 * @internal
 */
export class EmptyInputItemsError extends AbstractEpubCookerError {
  constructor(readonly projectDir: string) {
    super();
  }
}
