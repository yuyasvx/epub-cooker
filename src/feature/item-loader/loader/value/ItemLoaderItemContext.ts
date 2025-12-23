import mime from 'mime-types';
import { pipe, throwing } from '../../../../lib/util/EffectUtil';
import type { EpubProjectV2 } from '../../../../value/EpubProject';
import { ItemPath } from '../../../../value/ItemPath';
import type { ResolvedPath } from '../../../../value/ResolvedPath';

/** @internal */
export function ItemLoaderItemContext(filePath: ResolvedPath, project: EpubProjectV2, contentsDir: ResolvedPath) {
  const fileType = throwing(pipe(mime.lookup(filePath)).map((m) => (m === false ? undefined : m)));

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

/** @internal */
export type ItemLoaderItemContext = ReturnType<typeof ItemLoaderItemContext>;

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
