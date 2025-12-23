import { ok } from 'neverthrow';
import * as FileIo from '../../lib/file-io/FileIo';
import type { ResolvedPath } from '../../value/ResolvedPath';

/** @internal */
export function prepareCook(temporaryDir: ResolvedPath) {
  return FileIo.remove(temporaryDir).orElse(() => ok());
}
