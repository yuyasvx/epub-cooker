export const PageSizeType = {
  auto: 'auto',
} as const;

export type PageSizeType = (typeof PageSizeType)[keyof typeof PageSizeType];
