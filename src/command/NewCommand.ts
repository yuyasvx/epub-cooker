import { singleton } from "tsyringe";
import { AppCommand } from "../domain/prototype/Command";

@singleton()
export class NewCommand implements AppCommand {
  readonly name = "new";

  public async run() {
    console.log("このディレクトリにプロジェクト定義(YAML形式)の雛形を作成しました。");

    // console.log("プロジェクト定義は既に存在するようです。 epub-cooker cook コマンドを実行するとepubを製本できます。")
  }
}
