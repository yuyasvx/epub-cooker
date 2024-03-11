import { Dirent } from "fs";
import { join, resolve } from "path";
import { readdir } from "fs/promises";
import mime from "mime-types";
import { BookContext } from "../../domain/data/EpubContext";
import { CollectedItem } from "../../domain/value/CollectedItem";
import { isIncluded } from "../../util/FileExclude";
import { ItemCollector } from "./ItemCollector";

const SUPPORTED_DOCUMENTS = [
  "image/jpeg",
  "image/gif",
  "image/png",
  "image/webp",
  "audio/mp4",
  "video/mp4",
  "video/x-m4v",
  "audio/mpeg",
  "audio/wave",
  "audio/x-flac",
  "text/css",
  "application/javascript",
  "application/xhtml+xml",
  "text/html",
  "font/ttf",
  "font/otf",
  "font/woff",
];

export const documentItemCollector: ItemCollector = {
  /**
   * documentモードとしてコピー対象のアイテムを収集します。
   *
   * @param sourceDirectory 対象ディレクトリ
   * @param project プロジェクト定義
   * @returns 収集したアイテムのリスト
   */
  async collect(context: BookContext) {
    const dataSourceDir = context.dataSourceDirectory;
    const project = context.project;
    // FIXME 面倒なので一旦除外条件が自動の場合だけ、読み込むファイル形式を限定させ、マニュアル指定が入っている場合は何も限定させないことにしている
    let fileTypes = project.exclude === "auto" ? SUPPORTED_DOCUMENTS : undefined;
    if (fileTypes != null && project.parseMarkdown) {
      fileTypes = [...fileTypes, "text/markdown"];
    }
    const includedRules = project.include;
    const excludedRules = project.exclude === "auto" ? [] : project.exclude;

    const collector = new Collector();
    const dirents = await readdir(dataSourceDir, { withFileTypes: true });
    for (const d of dirents) {
      await collector.collectItem(dataSourceDir, "", d, fileTypes, includedRules, excludedRules);
    }
    return collector.items;
  },
};

class Collector {
  private _items: CollectedItem[] = [];

  get items(): Readonly<CollectedItem[]> {
    return this._items;
  }

  public async collectItem(
    rootDirectory: string,
    directory: string,
    dirent: Dirent,
    fileTypes: string[] | undefined,
    includedRules: string[],
    excludedRules: string[],
  ): Promise<void> {
    if (!dirent.isDirectory() && isIncluded(directory, dirent.name, fileTypes, includedRules, excludedRules)) {
      this._items.push({
        name: dirent.name,
        path: directory,
        href: join(directory, dirent.name),
        // id: Buffer.from(join(directory, dirent.name)).toString("base64").replaceAll("=", "_"),
        mediaType: mime.lookup(dirent.name) as string,
      });
    }

    if (dirent.isDirectory() && isIncluded(directory, dirent.name, undefined, includedRules, excludedRules)) {
      const newDirectoryName = join(directory, dirent.name);
      const newDirents = await readdir(resolve(rootDirectory, newDirectoryName), { withFileTypes: true });
      for (const d of newDirents) {
        await this.collectItem(rootDirectory, newDirectoryName, d, fileTypes, includedRules, excludedRules);
      }
    }
  }
}
