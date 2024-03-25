import { resolve as resolvePath } from "path";
import { readFile, readdir, rename, rm, stat } from "fs/promises";
import { NodeErrorType } from "../domain/enums/NodeJsErrorType";
import { AppError } from "../domain/error/AppError";
import { FileSystemError } from "../domain/error/FileSystemError";
import { asyncTryAsResult } from "../util/TryAsResult";

/**
 * ディレクトリのファイル一覧を取得します。
 *
 * @param pathStr ディレクトリのパス
 * @returns 結果。正常取得できたらファイル情報の配列、できない場合はエラー
 */
export async function getDir(pathStr: string) {
  return (await asyncTryAsResult(() => readdir(pathStr, { withFileTypes: true }))).mapError(handleOrThrow);
}

/**
 * ディレクトリ/ファイルの情報を取得します。
 *
 * @param pathStr ディレクトリまたはファイルのパス
 * @returns 結果。正常取得できたらファイル情報、できない場合はエラー
 */
export async function getStat(pathStr: string) {
  return (await asyncTryAsResult(() => stat(pathStr))).mapError(handleOrThrow);
}

export async function getFile(pathStr: string) {
  return (await asyncTryAsResult(() => readFile(pathStr))).mapError(handleOrThrow);
}

/**
 * ディレクトリ/ファイルの削除を行います。
 * @param target ディレクトリまたはファイルのパス
 * @returns 結果。正常終了した場合はOK、できない場合はエラー
 */
export async function remove(target: string) {
  return (await asyncTryAsResult(() => rm(target, { recursive: true }))).mapError(handleOrThrow);
}

export async function move(from: string, to: string) {
  return (await asyncTryAsResult(() => rename(from, to))).mapError(handleOrThrow);
}

/**
 * ファイルの保存場所があるか確認します。
 * @param destination ファイルのフルパス(例 /Users/hogehoge/fuga.txt)。ファイル名まで指定しておくこと。
 * @returns あればtrue, 無ければfalse
 * @throws アクセス不可などの何かしらのトラブル発生の場合はエラーをスローします
 */
export async function checkDirectory(destination: string) {
  return (await asyncTryAsResult(() => readdir(resolvePath(destination, "../")))).fold(
    () => true,
    (err) => {
      if ((err as Record<string, unknown>).code === NodeErrorType.NO_SUCH_FILE_OR_DIRECTORY) {
        return false;
      }
      throw err;
    },
  );
}

function handleOrThrow(e: unknown) {
  // 想定できるエラーはハンドリングして、できないエラーは上位の処理に投げる
  if ((e as Record<string, unknown>).code != null) {
    return new FileSystemError(e as Record<string, unknown>);
  }
  throw new AppError("UNEXPECTED_ERROR", e);
}
