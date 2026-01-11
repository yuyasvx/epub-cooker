import { PageLayoutType } from '../enums/PageLayoutType';
import { PageProgressionDirectionType } from '../enums/PageProgressionDirectionType';
import { PageSizeType } from '../enums/PageSizeType';

export type AbstractBookConfiguration = Readonly<{
  progressionDirection: PageProgressionDirectionType;
  specifiedFont: boolean;
  layoutType: PageLayoutType;
}>;

export type FixedLayoutBookConfiguration = AbstractBookConfiguration &
  Readonly<{
    layoutType: (typeof PageLayoutType)['fixed'];
    pageSize: (typeof PageSizeType)['auto'] | { width: number; height: number };
  }>;

export type ReflowLayoutBookConfiguration = AbstractBookConfiguration &
  Readonly<{
    layoutType: (typeof PageLayoutType)['reflow'];
  }>;

export function BookConfiguration(
  progressionDirection: PageProgressionDirectionType = PageProgressionDirectionType.ltr,
  specifiedFont: boolean = false,
  layoutType: PageLayoutType = PageLayoutType.reflow,
  pageSize: (typeof PageSizeType)['auto'] | { width: number; height: number } = PageSizeType.auto,
): ReflowLayoutBookConfiguration | FixedLayoutBookConfiguration {
  if (layoutType === PageLayoutType.fixed) {
    return {
      progressionDirection,
      specifiedFont,
      layoutType,
      pageSize,
    } satisfies FixedLayoutBookConfiguration;
  }

  return {
    progressionDirection,
    specifiedFont,
    layoutType,
  } satisfies ReflowLayoutBookConfiguration;
}
