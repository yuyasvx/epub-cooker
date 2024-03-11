import { BookContext, EpubContext } from "../../domain/data/EpubContext";
import { CollectedItem } from "../../domain/value/CollectedItem";
import { ManifestItem } from "../../domain/value/ManifestItem";

export interface ItemProcessor {
  /**
   * 収集したアイテムを「処理」します。
   *
   * - 処理とは、単純にファイルを作業ディレクトリにコピーしたり、ファイルを別の形式に変換して保存することを指します。
   * - 処理が終わったアイテムはManifestItemとして返します。つまり、ManifestItemを受け取った＝処理ができたということになります。
   *
   * @param item 収集したアイテム
   * @param context コンテキスト
   */
  process(item: CollectedItem, context: BookContext): Promise<ManifestItem>;
}
