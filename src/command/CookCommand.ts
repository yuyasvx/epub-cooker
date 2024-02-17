import { singleton } from "tsyringe";
import { AppCommand } from "../domain/prototype/Command";
import { CookService } from "../service/CookService";
import { FinalizeService } from "../service/FinalizeService";
import { ProjectLoadService } from "../service/ProjectLoadService";
import { CommandOption } from "./CommandOptions";

@singleton()
export class CookCommand implements AppCommand {
  readonly name = "cook";

  constructor(
    private projectLoadService: ProjectLoadService,
    private cookService: CookService,
    private finalizeService: FinalizeService,
    private commandOption: CommandOption,
  ) {}

  /**
   * プロジェクト定義を読み込んで、Epubの製本を実行します。
   *
   * --dir が指定されていれば、そのディレクトリのプロジェクト定義を読み込みます。
   * 指定されていない場合は、実行時のカレントディレクトリのプロジェクト定義を探します。
   */
  public async run() {
    const projectDirectory = this.commandOption.getDir() || process.cwd();
    let projectLoaded = false;

    try {
      const proj = await this.projectLoadService.loadFromDirectory(projectDirectory);
      projectLoaded = true;
      console.log(`${proj.bookMetadata.title} の製本を開始します。`);
      await this.cookService.cook(projectDirectory, proj);
    } catch (error) {
      console.log("プロジェクトの読み込みに失敗しました");
      // TODO プロジェクトの読み込みに成功しても、後続処理が失敗したら多分ここに飛ぶ
    } finally {
      if (projectLoaded) {
        this.finalizeService.finalize(projectDirectory);
      }
    }
  }
}
