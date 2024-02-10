import { resolve as resolvePath } from "path";
import { mkdir, readdir, writeFile } from "fs/promises";
import { XmlResource } from "../xml-resource/XmlResource";

export class ResourceWriteService {
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
  public async save(directory: string, resource: XmlResource, skipCheck = false) {
    const destination = resolvePath(directory, resource.path);
    if (!skipCheck && !(await this.checkExistence(destination))) {
      await mkdir(resolvePath(destination, "../"), { recursive: true });
    }
    writeFile(destination, resource.toXml());
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
