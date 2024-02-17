import { join } from "path";
import micromatch from "micromatch";
import mime from "mime-types";

/**
 * 与えられたファイルおよびディレクトリがコピー対象かどうか判定します。
 *
 * @param directory そのファイルが属するディレクトリ（直下の場合は空文字で）
 * @param name ファイル名(拡張子含む)・ディレクトリ名
 * @param includedFileTypes 対象とするファイル形式(MIME) これがUndefinedの場合は、ファイル形式での判別をしません
 * @param includedRules 最優先で対象とするGlobパターン
 * @param excludedRules  除外対象とするGlobパターン
 * @returns
 */
export function isIncluded(
  directory: string,
  name: string,
  includedFileTypes: string[] | undefined,
  includedRules: string[],
  excludedRules: string[],
) {
  const fullName = join(directory, name);

  if (micromatch.isMatch(fullName, includedRules)) {
    // console.log("対象条件マッチ");
    return true;
  }
  if (micromatch.isMatch(fullName, excludedRules)) {
    // console.log("除外条件マッチ");
    return false;
  }
  if (name.startsWith(".")) {
    // console.log("不可視");
    return false;
  }

  if (includedFileTypes == null) {
    // console.log("ファイル形式で絞り込みません");
    return true;
  }

  const detectedMimeType = mime.lookup(name);
  if (detectedMimeType === false) {
    // console.log("ファイル形式判別失敗");
    return false;
  }

  // console.log("ファイル形式がサポートしてるかどうかの判別");
  return includedFileTypes.includes(detectedMimeType);
}
