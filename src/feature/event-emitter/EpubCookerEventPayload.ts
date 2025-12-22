import type { EpubProjectV2 } from '../../value/EpubProject';
import type { LoadedProject } from '../project-loader';
import type { EpubCookerEventCode } from './enums/EpubCookerEventCode';

export type EpubCookerEventPayload = {
  [EpubCookerEventCode.PROJECT_LOADED]: LoadedProject;
  [EpubCookerEventCode.NO_TOC]: void;
  [EpubCookerEventCode.FINISHED]: EpubProjectV2;
};
