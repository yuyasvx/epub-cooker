import { Dirent } from "fs";
import { join, resolve } from "path";
import { readdir } from "fs/promises";
import mime from "mime-types";
import { isIncluded } from "../../util/FileExclude";
import { ManifestItem } from "../value/ManifestItem";

export class DocumentItemLoader {
  private _items: ManifestItem[] = [];

  get items(): Readonly<ManifestItem[]> {
    return this._items;
  }

  private constructor() {}

  /**
   * Documentモードでアイテムの読み込みを始めます。
   *
   * @param rootDirectory 起点となるディレクトリ（project.ymlがあるディレクトリを想定）
   * @param fileTypes 読み込み対象となるファイル形式。undefinedの場合、全部読み込む
   * @param includedRules 最優先で読み込み対象となるファイル・ディレクトリのglobパターン
   * @param excludedRules 読み込み対象外となるファイル・ディレクトリのglobパターン
   * @returns loaderのインスタンス
   */
  public static async start(
    rootDirectory: string,
    fileTypes: string[] | undefined,
    includedRules: string[],
    excludedRules: string[],
  ) {
    const loader = new DocumentItemLoader();
    const dirents = await readdir(rootDirectory, { withFileTypes: true });
    for (const d of dirents) {
      await loader.collectItem(rootDirectory, "", d, fileTypes, includedRules, excludedRules);
    }
    return loader;
  }

  protected async collectItem(
    rootDirectory: string,
    directory: string,
    dirent: Dirent,
    fileTypes: string[] | undefined,
    includedRules: string[],
    excludedRules: string[],
  ): Promise<void> {
    if (!dirent.isDirectory() && isIncluded(directory, dirent.name, fileTypes, includedRules, excludedRules)) {
      this._items.push({
        href: join(directory, dirent.name),
        // id: crypto.createHash("sha1").update(join(directory, dirent.name)).digest("hex"),
        id: Buffer.from(join(directory, dirent.name)).toString("base64").replaceAll("=", "_"),
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
