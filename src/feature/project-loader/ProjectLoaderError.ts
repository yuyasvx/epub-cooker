import { AbstractError } from '../../error/AbstractError';
import { EpubCookerError } from '../../error/EpubCookerError';

export class EpubLoadProjectError extends EpubCookerError {}

/**
 * @internal
 */
export class ProjectNotFoundError extends AbstractError {
  constructor(readonly projectDir: string) {
    super();
  }
}
