import type { EpubBookMetadata } from '../../value/EpubBookMetadata';
import type { EpubBookSource } from '../../value/EpubBookSource';
import type { InputFileDetail } from '../../value/InputFileDetail';
import type { ResolvedPath } from '../../value/ResolvedPath';
import type { EpubCookerEventCode } from './enums/EpubCookerEventCode';

export type EpubCookerEventPayload = {
  [EpubCookerEventCode.PROJECT_LOADED]: {
    inputFiles: InputFileDetail[];
    bookMetadata: EpubBookMetadata;
    bookSource: EpubBookSource;
  };
  [EpubCookerEventCode.NO_TOC]: void;
  [EpubCookerEventCode.FINISHED]: ResolvedPath;
  [EpubCookerEventCode.PAGE_NOT_FOUND]: string;
  [EpubCookerEventCode.FINISHED_WITHOUT_ARCHIVE]: ResolvedPath;
  [EpubCookerEventCode.BEGIN_ITEM_LOADER]: { inputFiles: InputFileDetail[] };
  [EpubCookerEventCode.END_ITEM_LOADER]: void;
  [EpubCookerEventCode.ITEM_LOADER_NEXT_ITEM]: InputFileDetail;
  [EpubCookerEventCode.ITEM_LOADED]: void;
};
