import mime from 'mime-types';
import { SourceHandlingType } from '../enums/SourceHandlingType';
import { pipe, unwrap } from '../lib/util/EffectUtil';
import type { EpubProjectV2 } from './EpubProject';
import { ItemPath } from './ItemPath';
import type { ResolvedPath } from './ResolvedPath';

export function InputFileDetail(filePath: ResolvedPath, project: EpubProjectV2, contentsDir: ResolvedPath) {
  const fileType = unwrap(pipe(mime.lookup(filePath)).map((m) => (m === false ? 'application/octet-stream' : m)));

  const isMarkdown = fileType === 'text/markdown';
  const isHtml = fileType === 'text/html';
  const isXhtml = fileType === 'application/xhtml+xml';
  const coverImage = isCoverimage(filePath, project.source['cover-image-path'], contentsDir);
  const toc = isToc(filePath, project.source['toc-page-path'], contentsDir);

  return {
    filePath,
    fileType,
    isMarkdown,
    isHtml,
    isXhtml,
    coverImage,
    toc,
  };
}

export type InputFileDetail = ReturnType<typeof InputFileDetail>;

/** internal */
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
