import { singleton } from "tsyringe";

@singleton()
export class FinalizeService {
  /**
   * 後処理の実施。製本に失敗しても動く
   * @param workingDirectoryPath
   */
  public finalize(workingDirectoryPath: string) {
    // .working ディレクトリをまるっと消す
  }
}
