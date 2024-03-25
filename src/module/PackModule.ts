import { join } from "path";
import { NodeErrorType } from "../domain/enums/NodeJsErrorType";
import { archiveDirectory } from "../logic/EpubArchiver";
import { isOk } from "../util/TryAsResult";
import { getDir, getStat } from "../writer/FileIo";

export async function pack(inputPath: string, outputPath: string) {
  if (await isDirectory(outputPath)) {
    return archiveDirectory(inputPath, outputPath, "book.epub");
  }
  const fileStat = (await getStat(outputPath)).getOrUndefined();

  if (fileStat != null) {
    console.log("ファイルがすでに存在する");
    return;
  }

  // .epubが含まれている場合は、それを一旦除外する
  const savePath = outputPath.endsWith(".epub") ? outputPath.substring(0, outputPath.length - 5) : outputPath;
  const separatedPaths = savePath.split("/");
  await archiveDirectory(inputPath, join(savePath, "../"), separatedPaths[separatedPaths.length - 1]);
}

async function isDirectory(pathStr: string) {
  const directory = true;
  const result = await getDir(pathStr);

  if (isOk(result)) {
    return true;
  }

  if (result.get().errorType === NodeErrorType.NO_SUCH_FILE_OR_DIRECTORY) {
    return false;
  }

  result.unwrap();
  return directory;
}
