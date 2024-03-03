import { resolve } from "path";
import { rename, rm } from "fs/promises";
import { singleton } from "tsyringe";
import { WORKING_DIERCTORY_NAME } from "./CookService";

@singleton()
export class FinalizeService {
  /**
   * 後処理の実施。製本に失敗しても動く
   * @param workingDirectoryPath
   */
  public async finalize(directory: string, debug = false, noPack = false) {
    if (noPack) {
      await rename(resolve(directory, WORKING_DIERCTORY_NAME), resolve(directory, "_contents"));
      return;
    }
    if (!debug) {
      await rm(resolve(directory, WORKING_DIERCTORY_NAME), { recursive: true });
    }
  }
}
