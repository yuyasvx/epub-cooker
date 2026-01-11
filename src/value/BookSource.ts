import { PageSpreadPositionType } from '../enums/PageSpreadPositionType';
import { SourceHandlingType } from '../enums/SourceHandlingType';
import type { ResolvedPath } from './ResolvedPath';

export type BookSource = Readonly<{
  sourceHandlingType: SourceHandlingType;
  ignorePatterns: string[];
  ignoreUnknownFileType: boolean;
  ignoreSystemFile: boolean;
  tocPath?: string;
  cssPath?: string;
  contentsDir: ResolvedPath;
  coverImagePath?: string;
  pages: BookPageDetail[];
}>;

export type BookPageDetail = Readonly<{
  pagePath: ResolvedPath;
  spreadType: PageSpreadPositionType;
}>;

export function BookSource(value: Partial<Omit<BookSource, 'contentsDir'>>, contentsDir: ResolvedPath): BookSource {
  const defaultValue: BookSource = {
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

export function BookPageDetail(
  pagePath: ResolvedPath,
  spreadType: PageSpreadPositionType = PageSpreadPositionType.NONE,
): BookPageDetail {
  return {
    pagePath,
    spreadType,
  };
}
