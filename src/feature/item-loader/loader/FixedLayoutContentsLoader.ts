/* eslint-disable @typescript-eslint/no-unused-vars */

import { okAsync } from 'neverthrow';
import type { ContentsLoader } from './ContentsLoader';

/** @internal */
export const loadFixedLayoutContents: ContentsLoader<never> = function (project, inputFiles, saveTo) {
  return okAsync([project, []]);
};
