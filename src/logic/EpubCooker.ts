import { resolve } from "path";
import { EpubContext } from "../domain/data/EpubContext";
import { EpubProject } from "../domain/value/EpubProject";
import { copyBookData } from "./BookDataTransporter";
import { identify } from "./Identifier";

export const WORKING_DIERCTORY_NAME = ".working";

/**
 * ブックデータを読み込み、作業ディレクトリへのファイルのコピーを行います。
 *
 * @param directory プロジェクトディレクトリ
 * @param project 読み込んだプロジェクト定義
 * @returns
 */
export async function cook(directory: string, project: EpubProject) {
  const context = await createContext(directory, project);
  context.loadedItems = await copyBookData(context, project);
  //   await this.tocService.validate(context, project);
  //   // TODO ItemSortTypeをベタ指定
  //   context.spineItems = this.spineService.sortItems(context.loadedItems, ItemSortType.STRING, project.visibleTocFile);
  //   await this.artworkService.validate(context, project);
  //   await this.resourceWriteService.saveResources(context, project);
  return context;
}

/**
 * コンテキストを作成します。
 *
 * EPUB作成のために読み込んだデータや必要な情報は、一旦コンテキストというミュータブルな
 * 入れ物の中に保存します。各処理は、このコンテキストを受け取ったり、コンテキストにデータを書き込んだりして
 * 処理を進めていきます。
 *
 * @param directory プロジェクトディレクトリ
 * @param project 読み込んだプロジェクト定義
 * @returns コンテキスト
 */
export async function createContext(directory: string, project: EpubProject) {
  const ctx: EpubContext = {
    projectDirectory: directory,
    workingDirectory: resolve(directory, WORKING_DIERCTORY_NAME),
    identifier: await identify(directory, project),
    loadedItems: [],
    spineItems: [],
    bookFileName: project.bookMetadata.title,
  };

  return ctx;
}
