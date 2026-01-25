import { AbstractEpubCookerError } from '../../../error/AbstractEpubCookerError';

/**
 * @internal
 */
export class ProjectNotFoundError extends AbstractEpubCookerError {
  constructor(readonly projectDir: string) {
    super();
  }
}
