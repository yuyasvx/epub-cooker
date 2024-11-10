import { resolve as resolvePath } from "path";
import { XmlResource } from "../domain/data/xml-resource/XmlResource";
import * as fileIo from "./FileIo";

/**
 * XMLリソースを本当のXMLテキストに変換してファイルとして保存します。
 *
 * - XMLリソース自体に定義されている相対パスとファイル名・基準となるディレクトリから保存先を決めます。
 *   - 例：directory=/path/to/directory、リソースのpath=hoge/fuga.xmlの場合、
 *     /path/to/directory/hoge/fuga.xmlにファイルの保存を試みます。
 *
 * @param directory 保存先ディレクトリ
 * @param resource XMLリソース
 * @returns
 */
export const save = (directory: string, resource: XmlResource) =>
  fileIo.save(resolvePath(directory, resource.path), resource.toXml());
