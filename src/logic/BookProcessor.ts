import { resolve } from "path";
import { BookContext } from "../domain/data/EpubContext";
import { ItemSortType } from "../domain/enums/ItemSortType";
import { EpubProject } from "../domain/value/EpubProject";
import { ManifestItem } from "../domain/value/ManifestItem";
import { processArtwork } from "./ArtworkProcessor";
import { identify } from "./Identifier";
import { saveResources } from "./ResourceWriter";
import { processSpine } from "./SpineProcessor";
import { processToc } from "./TocProcessor";
import { documentItemCollector } from "./item-collector/DocumentItemCollector";
import { ItemCollector } from "./item-collector/ItemCollector";
import { documentItemProcessor } from "./item-processor/DocumentItemProcessor";
import { ItemProcessor } from "./item-processor/ItemProcessor";

export const WORKING_DIERCTORY_NAME = ".working";

/**
 * コンテキストを作成します。
 *
 * EPUB作成のために読み込んだデータや必要な情報・プロジェクト定義は、一旦コンテキストというミュータブルな
 * 入れ物の中に保存します。各処理は、このコンテキストを受け取ったり、コンテキストにデータを書き込んだりして
 * 処理を進めていきます。
 *
 * @param directory プロジェクトディレクトリ
 * @param project 読み込んだプロジェクト定義
 * @returns コンテキスト
 */
export async function createContext(directory: string, project: EpubProject) {
  const ctx: BookContext = {
    project,
    projectDirectory: directory,
    workingDirectory: resolve(directory, WORKING_DIERCTORY_NAME),

    // project.ymlの置き場所が/path/to/project、データの置き場所がitem-path/の場合、
    // sourceDirectoryは/path/to/project/item-pathになる
    dataSourceDirectory: resolve(directory, project.sourcePath),

    identifier: await identify(directory, project),
    loadedItems: [],
    spineItems: [],
    bookFileName: project.bookMetadata.title,
  };

  return ctx;
}

/**
 * 製本処理を開始します。なお、ZIP化はやりません。
 *
 * - ブックデータの読み込み・変換・作業ディレクトリへの保存
 * - 目次ファイルの存在チェック
 * - アートワークの確認
 * - package.opfなどの各種XMLファイルを作業ディレクトリに保存　など
 *
 * @param projectDirectory プロジェクトディレクトリ
 * @param project 読み込んだプロジェクト定義
 * @returns コンテキスト
 */
export async function start(context: BookContext) {
  context.loadedItems = await doProcess(context);
  await processToc(context);
  // TODO ItemSortTypeをベタ指定
  context.spineItems = processSpine(context.loadedItems, ItemSortType.STRING, context.project.visibleTocFile);
  processArtwork(context);
  await saveResources(context);
  return context;
}

/**
 * プロジェクト定義で指定されたディレクトリのファイルを読み込み、作業ディレクトリへのコピーやXHTML変換を行います。
 *
 * @param context コンテキスト
 * @param project プロジェクト定義
 * @returns 読み込んだアイテム
 */
export async function doProcess(context: BookContext) {
  // ItemCollector, ItemProcessorは今後の拡張性を考えて一旦抽象化している。今はDocumentモードしか存在しないので何も分岐がない
  const itemCollector: ItemCollector = documentItemCollector;
  const itemProcessor: ItemProcessor = documentItemProcessor;

  const items = await itemCollector.collect(context);

  const manifestItems: ManifestItem[] = [];
  for (const item of items) {
    const i = await itemProcessor.process(item, context);
    manifestItems.push(i);
  }

  return manifestItems;
}
