import { resolve } from "path";
import { readFile, readdir } from "fs/promises";
import { EpubProject } from "../domain/value/EpubProject";
import { asyncTryOrNothing } from "../util/TryOrNothing";
import { parse } from "./ProjectParser";

const FILE_NAME = "project" as const;
const EXTENSIONS = ["yml", "yaml"] as const;

/**
 * 与えられたディレクトリからプロジェクト定義を読み込みます。
 *
 * @param resolvedPath project.ymlが存在するディレクトリの完全なパス
 * @returns プロジェクト定義
 */
export async function loadProjectFile(resolvedPath: string): Promise<EpubProject> {
  const projectFileName = await decideFileName(resolvedPath);
  if (projectFileName == null) {
    throw new Error("PROJECT_NOT_FOUND");
  }
  try {
    const rawText = (await readFile(resolve(resolvedPath, projectFileName))).toString();
    return parse(rawText);
  } catch (error) {
    throw new Error("FAILED_TO_LOAD_PROJECT");
  }
}

async function decideFileName(resolvedPath: string) {
  const files = (await asyncTryOrNothing(() => readdir(resolvedPath))) || [];

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
