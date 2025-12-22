export const EpubCookerEventCode = {
  PROJECT_LOADED: 'project-loaded',
  NO_TOC: 'no-toc',
  FINISHED: 'finished',
} as const;

export type EpubCookerEventCode = (typeof EpubCookerEventCode)[keyof typeof EpubCookerEventCode];
