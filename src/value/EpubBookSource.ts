import { PageSpreadPositionType } from '../enums/PageSpreadPositionType';
import { SourceHandlingType } from '../enums/SourceHandlingType';
import type { ResolvedPath } from './ResolvedPath';

export type EpubBookSource = Readonly<{
  sourceHandlingType: SourceHandlingType;
  ignorePatterns: string[];
  ignoreUnknownFileType: boolean;
  ignoreSystemFile: boolean;
  tocPath?: string;
  cssPath?: string;
  contentsDir: ResolvedPath;
  coverImagePath?: string;
  pages: EpubBookSourcePageOption[];
}>;

export type EpubBookSourcePageOption = Readonly<{
  pagePath: ResolvedPath;
  spreadType: PageSpreadPositionType;
}>;

export function EpubBookSource(
  value: Partial<Omit<EpubBookSource, 'contentsDir'>>,
  contentsDir: ResolvedPath,
): EpubBookSource {
  const defaultValue: EpubBookSource = {
    contentsDir,
    sourceHandlingType: SourceHandlingType.none,
    ignorePatterns: [],
    ignoreUnknownFileType: true,
    ignoreSystemFile: true,
    pages: [],
  };

  return {
    ...defaultValue,
    ...(value.sourceHandlingType != null && { sourceHandlingType: value.sourceHandlingType }),
    ...(value.ignorePatterns != null && { ignorePatterns: value.ignorePatterns }),
    ...(value.ignoreUnknownFileType != null && { ignoreUnknownFileType: value.ignoreUnknownFileType }),
    ...(value.ignoreSystemFile != null && { ignoreSystemFile: value.ignoreSystemFile }),
    ...(value.tocPath != null && { tocPath: value.tocPath }),
    ...(value.cssPath != null && { cssPath: value.cssPath }),
    ...(value.coverImagePath != null && { coverImagePath: value.coverImagePath }),
    ...(value.pages != null && { pages: value.pages }),
  };
}

export function EpubBookSourcePageOption(
  pagePath: ResolvedPath,
  spreadType: PageSpreadPositionType = PageSpreadPositionType.NONE,
): EpubBookSourcePageOption {
  return {
    pagePath,
    spreadType,
  };
}
