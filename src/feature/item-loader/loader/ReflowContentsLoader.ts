import { okAsync, ResultAsync } from 'neverthrow';
import { SourceHandlingType } from '../../../enums/SourceHandlingType';
import { pipe, throwing, unwrap } from '../../../lib/util/EffectUtil';
import type { ItemPath } from '../../../value/ItemPath';
import { type ResolvedPath, resolvePath } from '../../../value/ResolvedPath';
import { EpubCookerEventType } from '../../event-emitter';
import { _getEventEmitter } from '../../event-emitter/InitEvent';
import type { LoadedProject } from '../../project-loader';
import { runAutoEmptyTocItemProcessor } from '../processor/AutoEmptyTocProcessor';
import { runFileCopyItemProcessor } from '../processor/FileCopyItemProcessor';
import { runHtmlItemProcessor } from '../processor/HtmlItemProcessor';
import { runMarkdownItemProcessor } from '../processor/MarkdownItemProcessor';
import type { ContentsLoader } from './ContentsLoader';
import { ProcessedItemType } from './enums/ProcessedItemType';
import { ItemLoaderItemContext } from './value/ItemLoaderItemContext';
import { ProcessedItem } from './value/ProcessedItem';

/** @internal */
export const loadReflowContents: ContentsLoader = function (loadedProject: LoadedProject, saveTo: ResolvedPath) {
  const { contentsDir, loadedFiles, projectDefinition } = loadedProject;
  const itemContexts = loadedFiles.map((item) => ItemLoaderItemContext(item, projectDefinition, contentsDir));

  const pageItemContexts = unwrap(
    pipe(itemContexts)
      .map((c) => c.filter((ctx) => isPageContent(ctx, projectDefinition.source.using)))
      .map((c) => customizePageList(c, projectDefinition.source.pages, contentsDir)),
  );
  const assetItemContexts = itemContexts.filter((ctx) => !isPageContent(ctx, projectDefinition.source.using));

  return ResultAsync.combine([
    ...pageItemContexts.map((ctx) =>
      runItemProcessorAsPageContent(ctx, contentsDir, saveTo, projectDefinition.source['css-path']).map(
        // TODO projectDefinition.source['css-path']を直接当てている これは安全ではないので辞めたい
        (itemPath) => createPageProcessedItem(itemPath, ctx),
      ),
    ),
    ...assetItemContexts.map((ctx) =>
      runFileCopyItemProcessor(ctx.filePath, contentsDir, saveTo).map((itemPath) =>
        createAssetProcessedItem(itemPath, ctx),
      ),
    ),
  ])
    .andThen((items) => validateToc(items, saveTo))
    .map((items) => [loadedProject, items] as const);
};

/**
 * プロジェクト定義の指定されたページファイルがあれば、そのページのみを製本の対象にします。
 *
 * ページの並び順も指定されたページファイルに合わせます
 *
 * @param itemContexts 読み込み予定のアイテム情報
 * @param pagePaths
 * @param contentsDir
 * @returns
 */
function customizePageList(
  itemContexts: ItemLoaderItemContext[],
  pagePaths: string[] | undefined,
  contentsDir: ResolvedPath,
): ItemLoaderItemContext[] {
  if (pagePaths == null) {
    return itemContexts;
  }
  return pagePaths
    .map((p) => {
      const resolvedPath = resolvePath(contentsDir, p);
      const ctx = itemContexts.find((item) => item.filePath === resolvedPath);
      if (ctx == null) {
        _getEventEmitter().emit(EpubCookerEventType.PAGE_NOT_FOUND, p);
      }
      return ctx;
    })
    .filter((ctx): ctx is ItemLoaderItemContext => ctx != null);
}

function isPageContent({ isHtml, isMarkdown, isXhtml }: ItemLoaderItemContext, using: SourceHandlingType) {
  if (using === SourceHandlingType.markdown) {
    return isMarkdown || isHtml || isXhtml;
  }
  if (using === SourceHandlingType.none) {
    return isHtml || isXhtml;
  }
  return false;
}

function runItemProcessorAsPageContent(
  { filePath, isHtml, isMarkdown, isXhtml }: ItemLoaderItemContext,
  contentsDir: ResolvedPath,
  saveTo: ResolvedPath,
  projectCssPath?: string,
) {
  // TODO IF式を使いたいだけでこれはオーバーなやり方なきが。。
  const processor = throwing(
    pipe(null).map(() => {
      if (isMarkdown) {
        return runMarkdownItemProcessor;
      }
      if (isHtml || isXhtml) {
        return runHtmlItemProcessor;
      }
      return runFileCopyItemProcessor;
    }),
  );

  return processor(filePath, contentsDir, saveTo, projectCssPath);
}

function createPageProcessedItem(itemPath: ItemPath, itemContext: ItemLoaderItemContext) {
  // TODO ファイルサイズ取得はできていない　loadedFilesの改良が終わったらやる
  if (itemContext.toc) {
    return ProcessedItem(ProcessedItemType.TOC_PAGE, itemPath, 0);
  }
  return ProcessedItem(ProcessedItemType.PAGE, itemPath, 0);
}

function createAssetProcessedItem(itemPath: ItemPath, itemContext: ItemLoaderItemContext) {
  // TODO ファイルサイズ取得はできていない　loadedFilesの改良が終わったらやる
  if (itemContext.coverImage) {
    return ProcessedItem(ProcessedItemType.COVER_IMAGE, itemPath, 0);
  }
  return ProcessedItem(ProcessedItemType.ASSET, itemPath, 0);
}

function validateToc(items: ProcessedItem[], saveTo: ResolvedPath) {
  if (!items.some((itm) => itm.itemType === ProcessedItemType.TOC_PAGE)) {
    _getEventEmitter().emit(EpubCookerEventType.NO_TOC);

    return runAutoEmptyTocItemProcessor(saveTo).map((itemPath) => [
      ...items,
      ProcessedItem(ProcessedItemType.TOC_PAGE, itemPath, 0),
    ]);
  }
  return okAsync(items);
}
