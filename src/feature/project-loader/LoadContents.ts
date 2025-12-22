import mm from 'micromatch';
import { err, ok, ResultAsync } from 'neverthrow';
import { type FileIoError, FileNotFoundError } from '../../lib/file-io/error/FileIoError';
import * as FileIo from '../../lib/file-io/FileIo';
import { rejecting, rejects } from '../../lib/util/EffectUtil';
import type { EpubProjectV2 } from '../../value/EpubProject';
import { ItemPath } from '../../value/ItemPath';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';

function listAllFiles(dir: ResolvedPath) {
  return rejects<FileIoError>().run(async () => {
    const files: ResolvedPath[] = [];
    const dirents = await rejecting(FileIo.getListDetails(dir));

    for (const entry of dirents) {
      const fullPath = resolvePath(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await rejecting(listAllFiles(fullPath))));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    return files;
  });
}

/**
 * @internal
 * @param projectDir
 * @param project
 * @returns
 */
export function loadContents(projectDir: ResolvedPath, project: EpubProjectV2) {
  // コンテンツディレクトリは当社複数個指定可能だった謎設計だったのを1ディレクトリだけ指定可能に変えたので、
  // Resultの配列にする必要もなくなったんだけど、将来的に拡張するかもしれないからこのままにする
  const resolvedContentsDir = [project.source.contents].map((p) => resolvePath(projectDir, p));
  const results = resolvedContentsDir.map((dir) => listAllFiles(dir));
  // TODO プロジェクト定義とコンテンツディレクトリが同一だったらどうなっちゃうか

  return (
    ResultAsync.combine(results)
      .map((results) => results.flat())
      .map((files) =>
        ignoreFiles(
          files,
          [...getDefaultIgnorePatterns(project), ...project.source['ignore-patterns']],
          projectDir,
          project,
        ),
      )
      // TODO ResolvedPath[]ではなく、ファイルタイプとかも含めてオブジェクトとして返す
      .orElse((e) => {
        if (e instanceof FileNotFoundError) {
          // ファイルが見つからなかったイベントを出しても良い
          return ok([] as ResolvedPath[]);
        }
        return err(e);
      })
  );
}

export function getDefaultIgnorePatterns(project: EpubProjectV2) {
  if (project.source['ignore-system-file']) {
    return ['**/.*', '**/.DS_Store', '**/Thumbs.db', '**/desktop.ini'];
  }
  return [];
}

function ignoreFiles(
  fullPaths: ResolvedPath[],
  ignorePatterns: string[],
  projectDir: ResolvedPath,
  project: EpubProjectV2,
) {
  return fullPaths.filter((fullPath) => {
    const itemPath = ItemPath.createFromRelative(resolvePath(projectDir, project.source.contents), fullPath);
    return !mm.isMatch(itemPath, ignorePatterns);
  });
}
