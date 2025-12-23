export const SourceHandlingType = {
  markdown: 'markdown',
  photo: 'photo',
  none: 'none',
} as const;

export type SourceHandlingType = (typeof SourceHandlingType)[keyof typeof SourceHandlingType];
