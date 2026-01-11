/* eslint-disable @typescript-eslint/no-unused-vars */

import { okAsync } from 'neverthrow';
import type { ContentsLoader } from './ContentsLoader';

/** @internal */
export const loadFixedLayoutContents: ContentsLoader = function (project, inputFiles, saveTo) {
  return okAsync([project, []]);
};
