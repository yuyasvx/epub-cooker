import { PageLayoutType } from '../enums/PageLayoutType';
import { PageProgressionDirectionType } from '../enums/PageProgressionDirectionType';
import { PageSizeType } from '../enums/PageSizeType';

export type AbstractEpubBookConfiguration = Readonly<{
  progressionDirection: PageProgressionDirectionType;
  specifiedFont: boolean;
  layoutType: PageLayoutType;
}>;

export type FixedLayoutEpubBookConfiguration = AbstractEpubBookConfiguration &
  Readonly<{
    layoutType: (typeof PageLayoutType)['fixed'];
    pageSize: (typeof PageSizeType)['auto'] | { width: number; height: number };
  }>;

export type ReflowLayoutEpubBookConfiguration = AbstractEpubBookConfiguration &
  Readonly<{
    layoutType: (typeof PageLayoutType)['reflow'];
  }>;

export function EpubBookConfiguration(
  progressionDirection: PageProgressionDirectionType = PageProgressionDirectionType.ltr,
  specifiedFont: boolean = false,
  layoutType: PageLayoutType = PageLayoutType.reflow,
  pageSize: (typeof PageSizeType)['auto'] | { width: number; height: number } = PageSizeType.auto,
): ReflowLayoutEpubBookConfiguration | FixedLayoutEpubBookConfiguration {
  if (layoutType === PageLayoutType.fixed) {
    return {
      progressionDirection,
      specifiedFont,
      layoutType,
      pageSize,
    } satisfies FixedLayoutEpubBookConfiguration;
  }

  return {
    progressionDirection,
    specifiedFont,
    layoutType,
  } satisfies ReflowLayoutEpubBookConfiguration;
}
