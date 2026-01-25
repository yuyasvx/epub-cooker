import mime from 'mime-types';
import { PageSpreadPositionType } from '../enums/PageSpreadPositionType';
import { SourceHandlingType } from '../enums/SourceHandlingType';
import { pipe, unwrap } from '../lib/util/EffectUtil';
import type { BookPageDetail, BookSource } from './BookSource';
import { ItemPath } from './ItemPath';
import type { ResolvedPath } from './ResolvedPath';

export function InputFileDetail(
  filePath: ResolvedPath,
  { contentsDir, coverImagePath, tocPath }: BookSource,
  pageDetail?: BookPageDetail,
): InputFileDetail {
  const fileType = unwrap(pipe(mime.lookup(filePath)).map((m) => (m === false ? 'application/octet-stream' : m)));

  const isMarkdown = fileType === 'text/markdown';
  const isHtml = fileType === 'text/html';
  const isXhtml = fileType === 'application/xhtml+xml';
  const coverImage = isCoverimage(filePath, coverImagePath, contentsDir);
  const toc = isToc(filePath, tocPath, contentsDir);

  return {
    filePath,
    fileType,
    isMarkdown,
    isHtml,
    isXhtml,
    coverImage,
    toc,
    spreadType: pageDetail?.spreadType ?? PageSpreadPositionType.NONE, // TODO ページではないinputFileは表示位置の概念がないので必須オプションにすること自体が不適切
  };
}

export interface InputFileDetail {
  readonly filePath: ResolvedPath;
  readonly fileType: string;
  readonly isMarkdown: boolean;
  readonly isHtml: boolean;
  readonly isXhtml: boolean;
  readonly coverImage: boolean;
  readonly toc: boolean;
  readonly spreadType: PageSpreadPositionType;
}

/** @internal */
export function isPageContent({ isHtml, isMarkdown, isXhtml }: InputFileDetail, using: SourceHandlingType) {
  if (using === SourceHandlingType.markdown) {
    return isMarkdown || isHtml || isXhtml;
  }
  if (using === SourceHandlingType.none) {
    return isHtml || isXhtml;
  }
  return false;
}

function isCoverimage(filePath: ResolvedPath, coverImagePath: string | undefined, contentsDir: ResolvedPath) {
  const itemPath = ItemPath.createFromRelative(contentsDir, filePath);
  if (coverImagePath == null) {
    return false;
  }
  return itemPath === coverImagePath;
}

function isToc(filePath: ResolvedPath, tocPagePath: string | undefined, contentsDir: ResolvedPath) {
  const itemPath = ItemPath.createFromRelative(contentsDir, filePath);
  if (tocPagePath == null) {
    return false;
  }
  return itemPath === tocPagePath;
}
