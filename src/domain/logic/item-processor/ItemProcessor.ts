import { BookContext } from "../../../domain/data/BookContext";
import { CollectedItem } from "../../../domain/value/CollectedItem";
import { EpubProject } from "../../../domain/value/EpubProject";
import { ManifestItem } from "../../../domain/value/ManifestItem";

export interface ItemProcessor {
  /**
   * 収集したアイテムを「処理」します。
   *
   * - 処理とは、単純にファイルをコピーしたり、ファイルを別の形式に変換して保存することを指します。この処理でのファイルのコピー・保存先は作業ディレクトリです。
   * - 処理が終わったアイテムはManifestItemとして返します。つまり、ManifestItemを受け取った＝処理ができたということになります。
   *
   * @param item 収集したアイテム
   * @param context コンテキスト
   */
  process(item: CollectedItem, context: BookContext, project: EpubProject): Promise<ManifestItem>;
}
