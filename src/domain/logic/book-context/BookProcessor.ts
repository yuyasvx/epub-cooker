import { Effect } from "effect";
import { BookContext, BookContextData } from "../../../domain/data/BookContext";
import { PackageOpfXml } from "../../../domain/data/xml-resource/PackageOpfXml";
import { EpubProject } from "../../../domain/value/EpubProject";
import { ManifestItem } from "../../../domain/value/ManifestItem";
import { AbstractError } from "../../../error/AbstractError";
import * as xmlResourceIo from "../../../io/XmlResourceIo";
import { runThrowing, throwsAsync } from "../../../util/EffectUtil";
import { processSpine } from "../SpineProcessor";
import { documentItemCollector } from "../item-collector/DocumentItemCollector";
import { ItemCollector } from "../item-collector/ItemCollector";
import { documentItemProcessor } from "../item-processor/DocumentItemProcessor";
import { ItemProcessor } from "../item-processor/ItemProcessor";
import { processArtwork } from "./ArtworkProcessor";
import { processToc } from "./TocProcessor";

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
export const start = (context: BookContextData, project: EpubProject): Effect.Effect<BookContextData, AbstractError> =>
  throwsAsync(async () => {
    context.loadedItems = await loadItems(context, project, getCollector(project), getProcessor(project));
    context.loadedItems = await processToc(context, project.tocPath);
    context.spineItems = processSpine(context.loadedItems, project.visibleTocFile);
    context.loadedItems = processArtwork(context, project.coverImagePath);

    const opf = createOpf(context, project);
    await Promise.all([
      runThrowing(xmlResourceIo.save(context.workingDirectory, context.getContainerXml())),
      runThrowing(xmlResourceIo.save(context.workingDirectory, context.getDisplayOptionsXml())),
      runThrowing(xmlResourceIo.save(context.workingDirectory, opf)),
    ]);
    return context;
  });

function getCollector(project: EpubProject): ItemCollector {
  // ItemCollector, ItemProcessorは今後の拡張性を考えて一旦抽象化している。今はDocumentモードしか存在しないので何も分岐がない
  return documentItemCollector;
}

function getProcessor(project: EpubProject): ItemProcessor {
  // ItemCollector, ItemProcessorは今後の拡張性を考えて一旦抽象化している。今はDocumentモードしか存在しないので何も分岐がない
  return documentItemProcessor;
}

/**
 * プロジェクト定義で指定されたディレクトリのファイルを読み込み、作業ディレクトリへのコピーやXHTML変換を行います。
 *
 * @param context コンテキスト
 * @param project プロジェクト定義
 * @returns 読み込んだアイテム
 */
export async function loadItems(
  context: BookContext,
  project: EpubProject,
  itemCollector: ItemCollector,
  itemProcessor: ItemProcessor,
) {
  const items = await itemCollector.collect(context, project);

  const manifestItems: ManifestItem[] = [];
  for (const item of items) {
    const i = await itemProcessor.process(item, context, project);
    manifestItems.push(i);
  }

  return manifestItems;
}

export function createOpf(context: BookContext, project: EpubProject) {
  const packageOpf = PackageOpfXml.of(project, context.identifier);
  packageOpf.items = context.loadedItems;
  packageOpf.spineItems = context.spineItems;
  // 処理の最後に生成時刻更新
  packageOpf.updateModifiedDateTime();
  return packageOpf;
}
