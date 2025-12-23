import type { EpubProjectV2 } from '../../../value/EpubProject';
import type { ResolvedPath } from '../../../value/ResolvedPath';

export type LoadedProject = Readonly<{
  projectDefinition: EpubProjectV2;
  loadedFiles: ResolvedPath[];
  projectDir: ResolvedPath;
  contentsDir: ResolvedPath;
}>;
