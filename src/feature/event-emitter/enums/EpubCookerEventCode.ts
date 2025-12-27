export const EpubCookerEventCode = {
  PROJECT_LOADED: 'project-loaded',
  NO_TOC: 'no-toc',
  FINISHED: 'finished',
  FINISHED_WITHOUT_ARCHIVE: 'finished-without-archive',
  PAGE_NOT_FOUND: 'page-not-found',
} as const;

export type EpubCookerEventCode = (typeof EpubCookerEventCode)[keyof typeof EpubCookerEventCode];
