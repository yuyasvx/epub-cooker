import type { EpubProjectV2 } from '../../value/EpubProject';
import type { InputFileDetail } from '../../value/InputFileDetail';
import type { ResolvedPath } from '../../value/ResolvedPath';
import type { LoadedProject } from '../project-loader';
import type { EpubCookerEventCode } from './enums/EpubCookerEventCode';

export type EpubCookerEventPayload = {
  [EpubCookerEventCode.PROJECT_LOADED]: LoadedProject;
  [EpubCookerEventCode.NO_TOC]: void;
  [EpubCookerEventCode.FINISHED]: [EpubProjectV2, ResolvedPath];
  [EpubCookerEventCode.PAGE_NOT_FOUND]: string;
  [EpubCookerEventCode.FINISHED_WITHOUT_ARCHIVE]: ResolvedPath;
  [EpubCookerEventCode.BEGIN_ITEM_LOADER]: LoadedProject;
  [EpubCookerEventCode.END_ITEM_LOADER]: void;
  [EpubCookerEventCode.ITEM_LOADER_NEXT_ITEM]: InputFileDetail;
};
