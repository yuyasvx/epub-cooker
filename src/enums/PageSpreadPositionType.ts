export const PageSpreadPositionType = {
  LEFT: 'left',
  RIGHT: 'right',
  NONE: 'none',
} as const;

export type PageSpreadPositionType = (typeof PageSpreadPositionType)[keyof typeof PageSpreadPositionType];
