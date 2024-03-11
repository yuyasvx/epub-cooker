import { resolve as resolvePath } from "path";
import { readdir, rename, rm } from "fs/promises";

export async function remove(target: string) {
  try {
    await rm(target, { recursive: true });
  } catch (error) {
    console.trace();
    throw error;
  }
}

export async function move(from: string, to: string) {
  try {
    await rename(from, to);
  } catch (error) {
    console.trace();
    throw error;
  }
}

/**
 * ファイルの保存場所があるか確認します。
 * @param destination ファイルのフルパス(例 /Users/hogehoge/fuga.txt)。ファイル名まで指定しておくこと。
 * @returns あればtrue, 無ければfalse
 * @throws アクセス不可などの何かしらのトラブル発生の場合はエラーをスローします
 */
export async function checkDirectory(destination: string) {
  try {
    await readdir(resolvePath(destination, "../"));
    return true;
  } catch (e) {
    if ((e as Record<string, unknown>).code === "ENOENT") {
      return false;
    }
    throw e;
  }
}
