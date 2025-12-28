import mime from 'mime-types';
import { pipe, unwrap } from '../lib/util/EffectUtil';
import type { EpubProjectV2 } from './EpubProject';
import { ItemPath } from './ItemPath';
import type { ResolvedPath } from './ResolvedPath';

/** @internal */
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

type TInputFileDetail = ReturnType<typeof InputFileDetail>;

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputFileDetail extends TInputFileDetail {}

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
