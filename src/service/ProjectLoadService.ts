import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { singleton } from "tsyringe";
import YAML from "yaml";
import { EpubProject, createFromParsedYaml } from "../domain/value/EpubProject";

@singleton()
export class ProjectLoadService {
  private readonly FILE_NAME = "project";
  private readonly EXTENSIONS = ["yml", "yaml"];

  /**
   * ディレクトリを指定してプロジェクトを読み込み
   * @param resolvedPath ディレクトリのパス(resolveで解決させておくこと)
   */
  public async loadFromDirectory(resolvedPath: string): Promise<Readonly<EpubProject>> {
    const projectFileName = await this.decideFileName(resolvedPath);
    if (projectFileName == null) {
      throw new Error("PROJECT_NOT_FOUND");
    }
    const rawText = (await readFile(resolve(resolvedPath, projectFileName))).toString();
    const yml = YAML.parse(rawText);
    return createFromParsedYaml(yml);
  }

  protected async decideFileName(resolvedPath: string) {
    const files = await readdir(resolvedPath);

    for (const f of files) {
      const fileNameTuple = f.toLowerCase().split(".");
      // [project][yml]以外許しません
      if (fileNameTuple.length !== 2) {
        continue;
      }

      // [project]というファイル名チェック。大文字小文字むし
      if (fileNameTuple[0].toLowerCase() !== this.FILE_NAME) {
        continue;
      }

      const ext = fileNameTuple[1].toLowerCase();
      if (ext === this.EXTENSIONS[0] || ext === this.EXTENSIONS[1]) {
        return f;
      }
    }
  }
}
