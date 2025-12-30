export const EpubCookerEventCode = {
  PROJECT_LOADED: 'project-loaded',
  BEGIN_ITEM_LOADER: 'begin-item-load',
  ITEM_LOADER_NEXT_ITEM: 'item-loader-next-item',
  ITEM_LOADED: 'item-loaded',
  END_ITEM_LOADER: 'end-item-load',
  NO_TOC: 'no-toc',
  FINISHED: 'finished',
  FINISHED_WITHOUT_ARCHIVE: 'finished-without-archive',
  PAGE_NOT_FOUND: 'page-not-found',
} as const;

export type EpubCookerEventCode = (typeof EpubCookerEventCode)[keyof typeof EpubCookerEventCode];
