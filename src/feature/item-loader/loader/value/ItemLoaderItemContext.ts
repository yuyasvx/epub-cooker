import mime from 'mime-types';
import { pipe, unwrap } from '../../../../lib/util/EffectUtil';
import type { EpubProjectV2 } from '../../../../value/EpubProject';
import { ItemPath } from '../../../../value/ItemPath';
import type { ResolvedPath } from '../../../../value/ResolvedPath';

/** @internal */
export function ItemLoaderItemContext(filePath: ResolvedPath, project: EpubProjectV2, contentsDir: ResolvedPath) {
  const fileType = unwrap(pipe(mime.lookup(filePath)).map((m) => (m === false ? undefined : m)));

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

type TItemLoaderItemContext = ReturnType<typeof ItemLoaderItemContext>;

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ItemLoaderItemContext extends TItemLoaderItemContext {}

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
