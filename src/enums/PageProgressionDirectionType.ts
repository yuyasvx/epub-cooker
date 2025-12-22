export const PageProgressionDirectionType = {
  ltr: 'ltr',
  rtl: 'rtl',
} as const;

export type PageProgressionDirectionType =
  (typeof PageProgressionDirectionType)[keyof typeof PageProgressionDirectionType];
