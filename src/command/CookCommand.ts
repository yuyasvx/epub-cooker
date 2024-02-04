import { resolve } from "node:path";
import { Option } from "commander";
import { inject, singleton } from "tsyringe";
import { AppCommand } from "../domain/prototype/Command";
import { DirectoryService } from "../service/DirectoryService";
import { FinalizeService } from "../service/FinalizeService";
import { MarkdownParseService } from "../service/MarkdownParseService";
import { ProjectLoadService } from "../service/ProjectLoadService";
import { CommandOption } from "./CommandOptions";

@singleton()
export class CookCommandPrototype implements AppCommand {
  readonly name = "cook0";

  constructor(
    private directroyService: DirectoryService,
    private markdownParseService: MarkdownParseService,
    private projectLoadService: ProjectLoadService,
    private commandOption: CommandOption,
  ) {}

  public async run() {
    const targetDirectory = "/Users/yuyas/Pictures/Multi Screen Capture/SCRUM/md/book";
    const files = await this.directroyService
      .getDirectory(targetDirectory)
      .then((fileNames) => fileNames.filter((n) => n.endsWith(".md")));

    // console.log(files);
    // console.log(await this.markdownParseService.parse(resolve(targetDirectory, "04_c10-2.md")));

    const proj = await this.projectLoadService.loadFromDirectory(
      resolve("/Users/yuyas/Pictures/Multi Screen Capture/SCRUM/md"),
    );
    this.commandOption.getDir();
    // console.log(proj);
  }
}

@singleton()
export class CookCommand implements AppCommand {
  readonly name = "cook";

  constructor(
    private projectLoadService: ProjectLoadService,
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
    const workingDirectory = this.commandOption.getDir() || process.cwd();
    let projectLoaded = false;

    try {
      const proj = await this.projectLoadService.loadFromDirectory(workingDirectory);
      projectLoaded = true;
      console.log(`${proj.bookMetadata.title} の製本を開始します。`);
    } catch (error) {
      console.log("プロジェクトの読み込みに失敗しました");
      // TODO プロジェクトの読み込みに成功しても、後続処理が失敗したら多分ここに飛ぶ
    } finally {
      if (projectLoaded) {
        this.finalizeService.finalize(workingDirectory);
      }
    }
  }
}
