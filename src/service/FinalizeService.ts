import { singleton } from "tsyringe";
import { CookService } from "./CookService";

@singleton()
export class FinalizeService {
  constructor(private cookService: CookService) {}
  /**
   * 後処理の実施。製本に失敗しても動く
   * @param workingDirectoryPath
   */
  public finalize(workingDirectoryPath: string) {
    this.cookService.removeWorkingDirectory(workingDirectoryPath);
  }
}
