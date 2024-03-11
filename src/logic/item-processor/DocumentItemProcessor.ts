import { join, resolve } from "path";
import { copyFile } from "fs/promises";
import { BookContext } from "../../domain/data/EpubContext";
import { CollectedItem } from "../../domain/value/CollectedItem";
import { ManifestItem } from "../../domain/value/ManifestItem";
import { generateId } from "../../util/ManifestIdGenerator";
import { convertHtml, convertMarkdown } from "../DocumentPageConverter";
import { createDestinationDirectory } from "../ResourceWriter";
import { ItemProcessor } from "./ItemProcessor";

const OPS_DIRECTORY_NAME = "OPS";

export const documentItemProcessor: ItemProcessor = {
  /**
   * アイテムを処理します。
   *
   * - Markdown自動変換が有効な場合は、MarkdownをXHTMLに変換・保存を行います
   * - HTMLファイルはEPUB用のXHTMLに変換・保存を行います
   * - それ以外のファイルはコピーだけを行います
   *
   * @param item 収集したアイテム
   * @param context コンテキスト
   * @returns ManifestItem
   */
  async process(item: CollectedItem, context: BookContext): Promise<ManifestItem> {
    //コピー先は .working/OPS ディレクトリ
    const destination = resolve(context.workingDirectory, OPS_DIRECTORY_NAME);

    // const href = join(item.path, item.name);
    await createDestinationDirectory(join(destination, item.href));

    if (context.project.parseMarkdown && item.mediaType === "text/markdown") {
      return await convertMarkdown(item, context.dataSourceDirectory, destination, context.project.cssPath);
    }
    if (item.mediaType === "text/html") {
      return await convertHtml(item, context.dataSourceDirectory, destination, context.project.cssPath);
    }
    return await copyOne(item, context.dataSourceDirectory, destination);
  },
};

/**
 * 1アイテムに対し、単純なファイルのコピーを行います
 * @param item アイテム
 * @param fromDirectory コピー元
 * @param toDirectory コピー先
 * @returns 非同期
 */
async function copyOne(item: CollectedItem, fromDirectory: string, toDirectory: string) {
  try {
    await copyFile(resolve(fromDirectory, item.href), resolve(toDirectory, item.href));
    return {
      href: item.href,
      id: generateId(item),
      mediaType: item.mediaType,
    };
  } catch (error) {
    console.error(error);
    console.trace();
    throw error;
  }
}
