import { singleton } from "tsyringe";
import { AppCommand } from "../domain/prototype/Command";
import { ArchiveService } from "../service/ArchiveService";
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
    private archiveService: ArchiveService,
  ) {}

  /**
   * プロジェクト定義を読み込んで、Epubの製本を実行します。
   *
   * --dir が指定されていれば、そのディレクトリのプロジェクト定義を読み込みます。
   * 指定されていない場合は、実行時のカレントディレクトリのプロジェクト定義を探します。
   */
  public async run() {
    const projectDirectory = this.commandOption.getDir() || process.cwd();
    const proj = await this.projectLoadService.loadFromDirectory(projectDirectory);

    console.log(`${proj.bookMetadata.title} の製本を開始します。`);

    try {
      const context = await this.cookService.cook(projectDirectory, proj);

      if (this.commandOption.isNoPack()) {
        console.log("データの読み込みとファイルのコピーが終了しました。");
        return;
      }
      await this.archiveService.makeEpubArchive(
        context.workingDirectory,
        context.projectDirectory,
        context.bookFileName,
      );
    } finally {
      this.finalizeService.finalize(
        projectDirectory,
        this.commandOption.isDebugEnabled(),
        this.commandOption.isNoPack(),
      );
    }
  }
}
