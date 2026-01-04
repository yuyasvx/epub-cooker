import type { PageSpreadPositionType } from '../../../enums/PageSpreadPositionType';
import type { EpubProjectV2 } from '../../../value/EpubProject';
import type { InputFileDetail } from '../../../value/InputFileDetail';
import type { ResolvedPath } from '../../../value/ResolvedPath';

export type LoadedProject = Readonly<{
  projectDefinition: EpubProjectV2;
  inputFiles: InputFileDetail[];
  projectDir: ResolvedPath;
  contentsDir: ResolvedPath;
}>;

export type LoadedPageOption = Readonly<{
  filePath: ResolvedPath;
  spreadType: PageSpreadPositionType;
}>;
