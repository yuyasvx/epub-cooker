export const ProcessedItemType = {
  PAGE: 'page',
  ASSET: 'asset',
  COVER_IMAGE: 'cover-image',
  TOC_PAGE: 'toc-page',
} as const;

export type ProcessedItemType = (typeof ProcessedItemType)[keyof typeof ProcessedItemType];
