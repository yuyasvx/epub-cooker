import { resolve as resolvePath } from "path";
import { mkdir, readdir, writeFile } from "fs/promises";
import { EpubContext } from "../domain/data/EpubContext";
import { EpubProject } from "../domain/value/EpubProject";
import { ContainerXml } from "../xml-resource/ContainerXml";
import { IBooksDisplayOptionsXml } from "../xml-resource/IBooksDisplayOptionsXml";
import { PackageOpfXml } from "../xml-resource/PackageOpfXml";
import { XmlResource } from "../xml-resource/XmlResource";

export class ResourceWriteService {
  /**
   * プロジェクト定義やコンテキストから、Epubの構成に必要なXMLファイルを保存します。
   *
   * @param context コンテキスト
   * @param project プロジェクト定義
   */
  public async saveResource(context: EpubContext, project: EpubProject) {
    // TODO Save Resources です
    const containerXml = new ContainerXml();
    const displayOptionsXml = new IBooksDisplayOptionsXml();
    displayOptionsXml.setSpecifiedFonts(project.useSpecifiedFonts);

    const packageOpf = PackageOpfXml.of(project, context.identifier);
    packageOpf.items = context.loadedItems;
    packageOpf.spineItems = context.spineItems;
    // 処理の最後に生成時刻更新
    packageOpf.updateModifiedDateTime();

    await Promise.all([
      this.save(context.workingDirecotry, containerXml),
      this.save(context.workingDirecotry, displayOptionsXml),
      this.save(context.workingDirecotry, packageOpf),
    ]);
  }

  /**
   * XMLリソースを本当のXMLの文書に変換してファイルとして保存します。
   *
   * 例：directory=/path/to/directory、リソースのpath=hoge/fuga.xmlの場合、
   * /path/to/directory/hoge/fuga.xmlにファイルの保存を試みます。
   *
   * @param directory 保存先のベースとなるディレクトリを指定します。
   * @param resource XMLリソース
   * @param skipCheck trueにすると保存先のディレクトリ存在チェックをスキップします。
   */
  protected async save(directory: string, resource: XmlResource, skipCheck = false) {
    const destination = resolvePath(directory, resource.path);
    this.saveTextFile(resource.toXml(), destination, skipCheck);
  }

  /**
   * 任意のテキストファイルを保存します。
   *
   * @param rawText テキストデータ
   * @param fullPath 保存先のフルパス
   * @param skipCheck trueにすると保存先のディレクトリ存在チェックをスキップします。
   */
  public async saveTextFile(rawText: string, fullPath: string, skipCheck = false) {
    if (!skipCheck && !(await this.checkExistence(fullPath))) {
      await mkdir(resolvePath(fullPath, "../"), { recursive: true });
    }
    writeFile(fullPath, rawText);
  }

  /**
   * ファイルの保存場所を作成します。
   * @param destination ファイルのフルパス(例 /Users/hogehoge/fuga.txt)。ファイル名まで指定しておくこと。
   */
  public async createDestinationDirectory(destination: string) {
    if (!(await this.checkExistence(destination))) {
      mkdir(resolvePath(destination, "../"), { recursive: true });
    }
  }

  /**
   * ファイルの保存場所があるか確認します。
   * @param destination ファイルのフルパス(例 /Users/hogehoge/fuga.txt)。ファイル名まで指定しておくこと。
   * @returns あればtrue, 無ければfalse
   * @throws アクセス不可などの何かしらのトラブル発生の場合はエラーをスローします
   */
  protected async checkExistence(destination: string) {
    try {
      await readdir(resolvePath(destination, "../"));
      return true;
    } catch (e) {
      if ((e as Record<string, unknown>).code === "ENOENT") {
        return false;
      }
      throw e;
    }
  }
}
