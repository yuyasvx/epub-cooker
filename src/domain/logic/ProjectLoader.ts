import { resolve } from "path";
import { flatMap } from "effect/Effect";
import { ProjectFileNotFoundError } from "../../error/AppError";
import * as epubProjectIo from "../../io/EpubProjectIo";
import * as fileIo from "../../io/FileIo";
import { runNullable, throwsAsync } from "../../util/EffectUtil";

const FILE_NAME = "project" as const;
const EXTENSIONS = ["yml", "yaml"] as const;

/**
 * 与えられたディレクトリからプロジェクト定義を読み込みます。
 *
 * @param resolvedPath project.ymlが存在するディレクトリの完全なパス
 * @returns プロジェクト定義
 */
export const loadProjectFile = (resolvedPath: string) =>
  throwsAsync<string, ProjectFileNotFoundError>(async () => {
    const projectFileName = await decideFileName(resolvedPath);
    if (projectFileName == null) {
      throw new ProjectFileNotFoundError(resolvedPath);
    }
    return projectFileName;
  }).pipe(flatMap((fileName) => epubProjectIo.getFile(resolve(resolvedPath, fileName))));

async function decideFileName(resolvedPath: string) {
  const files = (await runNullable(fileIo.getList(resolvedPath))) ?? [];

  for (const f of files) {
    const fileNameTuple = f.toLowerCase().split(".");
    // [project][yml]以外許しません
    if (fileNameTuple.length !== 2) {
      continue;
    }

    // [project]というファイル名チェック。大文字小文字むし
    if (fileNameTuple[0].toLowerCase() !== FILE_NAME) {
      continue;
    }

    const ext = fileNameTuple[1].toLowerCase();
    if (ext === EXTENSIONS[0] || ext === EXTENSIONS[1]) {
      return f;
    }
  }
}
