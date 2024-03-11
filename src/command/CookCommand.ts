import { singleton } from "tsyringe";
import { AppCommand } from "../domain/prototype/Command";
import { cook } from "../module/CookModule";
import { CommandOption } from "./CommandOptions";

@singleton()
export class CookCommand implements AppCommand {
  readonly name = "cook";

  constructor(private commandOption: CommandOption) {}

  /**
   * プロジェクト定義を読み込んで、Epubの製本を実行します。
   *
   * --dir が指定されていれば、そのディレクトリのプロジェクト定義を読み込みます。
   * 指定されていない場合は、実行時のカレントディレクトリのプロジェクト定義を探します。
   */
  public async run() {
    const projectDirectory = this.commandOption.getDir() || process.cwd();
    await cook(projectDirectory, this.commandOption.isNoPack(), this.commandOption.isDebugEnabled());
  }
}
