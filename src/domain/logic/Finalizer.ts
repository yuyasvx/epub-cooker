import { resolve } from "path";
import { BookContext } from "../../domain/data/BookContext";
import * as fileIo from "../../io/FileIo";
import { runThrowing } from "../../util/EffectUtil";

/**
 * 後処理の実施。製本に失敗しても動く
 * @param workingDirectoryPath
 */
export async function finalize(context: BookContext, debug = false, noPack = false) {
  if (noPack) {
    await runThrowing(fileIo.move(context.workingDirectory, resolve(context.projectDirectory, "_contents")));
    return;
  }
  if (!debug) {
    await runThrowing(fileIo.removeDir(context.workingDirectory));
  }
}
