/* eslint-disable @typescript-eslint/no-unused-vars */

import { okAsync } from 'neverthrow';
import type { ResolvedPath } from '../../../value/ResolvedPath';
import type { LoadedProject } from '../../project-loader';
import type { ContentsLoader } from './ContentsLoader';

/** @internal */
export const loadFixedLayoutContents: ContentsLoader = function (loadedProject: LoadedProject, saveTo: ResolvedPath) {
  return okAsync([loadedProject, []]);
};
