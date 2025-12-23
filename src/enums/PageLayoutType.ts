export const PageLayoutType = {
  reflow: 'reflow',
  fixed: 'fixed',
} as const;

export type PageLayoutType = (typeof PageLayoutType)[keyof typeof PageLayoutType];
