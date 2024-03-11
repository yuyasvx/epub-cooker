import { resolve } from "path";
import { BookContext } from "../domain/data/EpubContext";
import { move, remove } from "../writer/FileWriter";

/**
 * 後処理の実施。製本に失敗しても動く
 * @param workingDirectoryPath
 */
export async function finalize(context: BookContext, debug = false, noPack = false) {
  if (noPack) {
    await move(context.workingDirectory, resolve(context.projectDirectory, "_contents"));
    return;
  }
  if (!debug) {
    await remove(context.workingDirectory);
  }
}
