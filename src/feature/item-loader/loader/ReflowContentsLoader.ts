import { okAsync, ResultAsync } from 'neverthrow';
import { SourceHandlingType } from '../../../enums/SourceHandlingType';
import { pipe, throwing, unwrap } from '../../../lib/util/EffectUtil';
import type { EpubProjectV2 } from '../../../value/EpubProject';
import type { InputFileDetail } from '../../../value/InputFileDetail';
import type { ItemPath } from '../../../value/ItemPath';
import { type ResolvedPath, resolvePath } from '../../../value/ResolvedPath';
import { EpubCookerEventType } from '../../event-emitter';
import { _getEventEmitter } from '../../event-emitter/InitEvent';
import type { LoadedProject } from '../../project-loader';
import { runAutoEmptyTocItemProcessor } from '../processor/AutoEmptyTocProcessor';
import { runFileCopyItemProcessor } from '../processor/FileCopyItemProcessor';
import { runHtmlItemProcessor } from '../processor/HtmlItemProcessor';
import { runMarkdownItemProcessor } from '../processor/MarkdownItemProcessor';
import { runMarkdownTocItemProcessor } from '../processor/MarkdownTocItemProcessor';
import type { ContentsLoader } from './ContentsLoader';
import { ProcessedItemType } from './enums/ProcessedItemType';
import { ProcessedItem } from './value/ProcessedItem';

/** @internal */
export const loadReflowContents: ContentsLoader = function (loadedProject: LoadedProject, saveTo: ResolvedPath) {
  const { contentsDir, inputFiles, projectDefinition } = loadedProject;
  const inputsAsPageContent = filterPageItemContexts(inputFiles, projectDefinition, contentsDir);
  const inputsAsAsset = inputFiles.filter((input) => !isPageContent(input, projectDefinition.source.using));

  return ResultAsync.combine([
    ...inputsAsPageContent.map((input) =>
      runItemProcessorAsPageContent(input, contentsDir, saveTo, projectDefinition.source['css-path']).map(
        // TODO projectDefinition.source['css-path']を直接当てている これは安全ではないので辞めたい
        (itemPath) => createPageProcessedItem(itemPath, input),
      ),
    ),
    ...inputsAsAsset.map((input) =>
      runFileCopyItemProcessor(input, contentsDir, saveTo).map((itemPath) => createAssetProcessedItem(itemPath, input)),
    ),
  ])
    .andThen((items) => validateToc(items, saveTo))
    .map((items) => [loadedProject, items] as const);
};

function filterPageItemContexts(itemContexts: InputFileDetail[], project: EpubProjectV2, contentsDir: ResolvedPath) {
  const allPageItemContexts = itemContexts.filter((i) => isPageContent(i, project.source.using));
  return customizePageList(allPageItemContexts, project.source.pages, contentsDir);
}

/**
 * プロジェクト定義の指定されたページファイルがあれば、そのページのみを製本の対象にします。
 *
 * ページの並び順も指定されたページファイルに合わせます
 *
 * @param inputFileDetails 読み込み予定のアイテム情報
 * @param pagePaths
 * @param contentsDir
 * @returns
 */
function customizePageList(
  inputFileDetails: InputFileDetail[],
  pagePaths: string[] | undefined,
  contentsDir: ResolvedPath,
): InputFileDetail[] {
  if (pagePaths == null) {
    return inputFileDetails;
  }
  const itemMap = new Map<ResolvedPath, InputFileDetail>();
  for (const item of inputFileDetails) {
    itemMap.set(item.filePath, item);
  }

  const tocItems = inputFileDetails.filter((i) => i.toc);
  const filteredPages = pagePaths
    .map((p) => {
      const resolvedPath = resolvePath(contentsDir, p);
      const i = itemMap.get(resolvedPath);
      if (i == null) {
        _getEventEmitter().emit(EpubCookerEventType.PAGE_NOT_FOUND, p);
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

function isPageContent({ isHtml, isMarkdown, isXhtml }: InputFileDetail, using: SourceHandlingType) {
  if (using === SourceHandlingType.markdown) {
    return isMarkdown || isHtml || isXhtml;
  }
  if (using === SourceHandlingType.none) {
    return isHtml || isXhtml;
  }
  return false;
}

function runItemProcessorAsPageContent(
  input: InputFileDetail,
  contentsDir: ResolvedPath,
  saveTo: ResolvedPath,
  projectCssPath?: string,
) {
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
  );

  return processor(input, contentsDir, saveTo, projectCssPath);
}

function createPageProcessedItem(itemPath: ItemPath, itemContext: InputFileDetail) {
  // TODO ファイルサイズ取得はできていない　loadedFilesの改良が終わったらやる
  if (itemContext.toc) {
    return ProcessedItem(ProcessedItemType.TOC_PAGE, itemPath, 0, itemContext.fileType);
  }
  return ProcessedItem(ProcessedItemType.PAGE, itemPath, 0, itemContext.fileType);
}

function createAssetProcessedItem(itemPath: ItemPath, itemContext: InputFileDetail) {
  // TODO ファイルサイズ取得はできていない　loadedFilesの改良が終わったらやる
  if (itemContext.coverImage) {
    return ProcessedItem(ProcessedItemType.COVER_IMAGE, itemPath, 0, itemContext.fileType);
  }
  return ProcessedItem(ProcessedItemType.ASSET, itemPath, 0, itemContext.fileType);
}

function validateToc(items: ProcessedItem[], saveTo: ResolvedPath) {
  if (!items.some((itm) => itm.itemType === ProcessedItemType.TOC_PAGE)) {
    _getEventEmitter().emit(EpubCookerEventType.NO_TOC);

    return runAutoEmptyTocItemProcessor(saveTo).map((itemPath) => [
      ...items,
      ProcessedItem(ProcessedItemType.TOC_PAGE, itemPath, 0, 'application/xhtml+xml'),
    ]);
  }
  return okAsync(items);
}
