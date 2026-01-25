import { okAsync, ResultAsync } from 'neverthrow';
import { PageSpreadPositionType } from '../../../enums/PageSpreadPositionType';
import type { FileIoError } from '../../../lib/file-io/error/FileIoError';
import { MarkdownParser } from '../../../lib/markdown-parser/MarkdownParser';
import { pipe, throwing, unwrap } from '../../../lib/util/EffectUtil';
import type { BookPageDetail, BookSource } from '../../../value/BookSource';
import { type InputFileDetail, isPageContent } from '../../../value/InputFileDetail';
import type { ItemPath } from '../../../value/ItemPath';
import type { ResolvedPath } from '../../../value/ResolvedPath';
import { EpubCookerEventType } from '../../event-emitter';
import { _getEventEmitter } from '../../event-emitter/InitEvent';
import { runAutoEmptyTocItemProcessor } from '../processor/AutoEmptyTocProcessor';
import { runFileCopyItemProcessor } from '../processor/FileCopyItemProcessor';
import { runHtmlItemProcessor } from '../processor/HtmlItemProcessor';
import type { IllegalFileTypeError, ItemProcessor } from '../processor/ItemProcessor';
import { runMarkdownItemProcessor } from '../processor/MarkdownItemProcessor';
import { runMarkdownTocItemProcessor } from '../processor/MarkdownTocItemProcessor';
import type { ContentsLoader } from './ContentsLoader';
import { ProcessedItemType } from './enums/ProcessedItemType';
import { ProcessedItem } from './value/ProcessedItem';

/** @internal */
export const loadReflowContents: ContentsLoader<FileIoError | IllegalFileTypeError> = function (
  project,
  inputFiles,
  saveTo,
) {
  const { source } = project;
  const { contentsDir, cssPath, sourceHandlingType } = source;

  const inputsAsPageContent = filterPageItemContexts(inputFiles, source);
  const inputsAsAsset = inputFiles.filter((input) => !isPageContent(input, sourceHandlingType));
  const parser = new MarkdownParser(inputFiles);

  return ResultAsync.combine([
    ...inputsAsPageContent.map((input) =>
      runItemProcessorAsPageContent(input, contentsDir, saveTo, cssPath, parser).map(
        // TODO projectDefinition.source['css-path']を直接当てている これは安全ではないので辞めたい
        (itemPath) => createPageProcessedItem(itemPath, input),
      ),
    ),
    ...inputsAsAsset.map((input) => {
      _getEventEmitter().emit(EpubCookerEventType.ITEM_LOADER_NEXT_ITEM, input);
      return runFileCopyItemProcessor(input, contentsDir, saveTo)
        .map((itemPath) => createAssetProcessedItem(itemPath, input))
        .andTee(() => {
          _getEventEmitter().emit(EpubCookerEventType.ITEM_LOADED);
        });
    }),
  ])
    .andThen((items) => validateToc(items, saveTo, parser))
    .map((items) => [project, items] as const);
};

function filterPageItemContexts(itemContexts: InputFileDetail[], bookSource: BookSource) {
  const allPageItemContexts = itemContexts.filter((i) => isPageContent(i, bookSource.sourceHandlingType));
  return customizePageList(allPageItemContexts, bookSource.pages);
}

/**
 * プロジェクト定義の指定されたページファイルがあれば、そのページのみを製本の対象にします。
 *
 * ページの並び順も指定されたページファイルに合わせます
 *
 * @param inputFileDetails 読み込み予定のアイテム情報
 * @param pages
 * @param contentsDir
 * @returns
 */
function customizePageList(inputFileDetails: InputFileDetail[], pages: BookPageDetail[]): InputFileDetail[] {
  if (pages.length === 0) {
    return inputFileDetails;
  }
  const itemMap = new Map<ResolvedPath, InputFileDetail>();
  for (const item of inputFileDetails) {
    itemMap.set(item.filePath, item);
  }

  const tocItems = inputFileDetails.filter((i) => i.toc);
  const filteredPages = pages
    .map((p) => {
      const i = itemMap.get(p.pagePath);
      if (i == null) {
        _getEventEmitter().emit(EpubCookerEventType.PAGE_NOT_FOUND, p.pagePath);
      }
      return i;
    })
    .filter((i): i is InputFileDetail => i != null);

  //念の為重複を消して返却
  return unwrap(
    pipe([...tocItems, ...filteredPages].map((itm) => itm.filePath))
      .map((items) => [...new Set(items)])
      .map((items) => items.map((itemPath) => itemMap.get(itemPath)!)),
  );
}

function runItemProcessorAsPageContent(
  input: InputFileDetail,
  contentsDir: ResolvedPath,
  saveTo: ResolvedPath,
  projectCssPath: string | void,
  parser: MarkdownParser,
) {
  _getEventEmitter().emit(EpubCookerEventType.ITEM_LOADER_NEXT_ITEM, input);
  const { isHtml, isMarkdown, isXhtml, toc } = input;
  // TODO IF式を使いたいだけでこれはオーバーなやり方なきが。。
  const processor = throwing(
    pipe(null).map(() => {
      if (isMarkdown && !toc) {
        return runMarkdownItemProcessor;
      }
      if (isMarkdown && toc) {
        return runMarkdownTocItemProcessor;
      }
      if (isHtml || isXhtml) {
        return runHtmlItemProcessor;
      }
      return runFileCopyItemProcessor;
    }),
  ) as ItemProcessor<MarkdownParser, FileIoError | IllegalFileTypeError>;

  return processor(input, contentsDir, saveTo, projectCssPath, parser).andTee(() => {
    _getEventEmitter().emit(EpubCookerEventType.ITEM_LOADED);
  });
}

function createPageProcessedItem(itemPath: ItemPath, input: InputFileDetail) {
  // TODO ファイルサイズ取得はできていない　loadedFilesの改良が終わったらやる
  if (input.toc) {
    return ProcessedItem(ProcessedItemType.TOC_PAGE, itemPath, 0, input.spreadType);
  }
  return ProcessedItem(ProcessedItemType.PAGE, itemPath, 0, input.spreadType);
}

function createAssetProcessedItem(itemPath: ItemPath, input: InputFileDetail) {
  // TODO ファイルサイズ取得はできていない　loadedFilesの改良が終わったらやる
  if (input.coverImage) {
    return ProcessedItem(ProcessedItemType.COVER_IMAGE, itemPath, 0, input.spreadType);
  }
  return ProcessedItem(ProcessedItemType.ASSET, itemPath, 0, input.spreadType);
}

function validateToc(items: ProcessedItem[], saveTo: ResolvedPath, parser: MarkdownParser) {
  if (!items.some((itm) => itm.itemType === ProcessedItemType.TOC_PAGE)) {
    _getEventEmitter().emit(EpubCookerEventType.NO_TOC);

    return runAutoEmptyTocItemProcessor(saveTo, parser).map((itemPath) => [
      ...items,
      ProcessedItem(ProcessedItemType.TOC_PAGE, itemPath, 0, PageSpreadPositionType.NONE),
    ]);
  }
  return okAsync(items);
}
