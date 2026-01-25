import chalk from 'chalk';
import { format } from 'date-fns';
import * as LoaderProgressBar from '../../app/print/LoaderProgressBar';
import { printDoneMessage } from '../../app/print/PrintDoneMessage';
import { printProjectOverviewTable } from '../../app/print/PrintProjectOverviewTable';
import { printWarnMessage } from '../../app/print/PrintWarnMessage';
import { archiveDirectory } from '../../feature/archiver';
import { epubCookerEvent, EpubCookerEventCode } from '../../feature/event-emitter';
import { _getEventEmitter } from '../../feature/event-emitter/InitEvent';
import { loadContentsItem } from '../../feature/item-loader';
import { saveMarkupStructure } from '../../feature/metadata-generator';
import { loadProject } from '../../feature/project-loader';
import * as FileIo from '../../lib/file-io/FileIo';
import { tryThrows } from '../../lib/util/EffectUtil';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
import { handleError } from './HandleError';
import { prepareCook } from './PrepareCook';

/**
 * @internal
 * @param projectDir
 * @returns
 */
export function cook(projectDir: ResolvedPath, noPack = false) {
  const workingDir = resolvePath(projectDir, '.working');
  prepareEvents();

  return prepareCook(workingDir)
    .andThen(() => loadProject(projectDir))
    .andThen(({ inputFiles, project }) => loadContentsItem(project, inputFiles, resolvePath(workingDir, 'OPS')))
    .andThen(([project, items]) =>
      saveMarkupStructure(workingDir, project.metadata, project.config, project.additionalMetadata, items),
    )
    .andThen(({ bookMetadata }) => archiveDirectory(workingDir, projectDir, bookMetadata, !noPack))
    .andThen(() => finalizeProcessedFiles(workingDir, noPack))
    .andTee(() => finalize())
    .orTee((e) => {
      handleError(e);
      finalize();
    });
}

function finalizeProcessedFiles(workingDir: ResolvedPath, keepWorkingContents = false) {
  if (keepWorkingContents) {
    const destination = resolvePath(workingDir, '..', `working-contents-${format(new Date(), 'yyyyMMdd-HHmmss')}`);
    _getEventEmitter().emit(EpubCookerEventCode.FINISHED_WITHOUT_ARCHIVE, destination);
    return FileIo.move(workingDir, destination);
  }
  return FileIo.remove(workingDir);
}

function finalize() {
  return tryThrows<never>()(() => {
    epubCookerEvent.offAll();
  });
}

function prepareEvents() {
  epubCookerEvent.on(EpubCookerEventCode.PROJECT_LOADED, ({ bookMetadata, bookSource, inputFiles }) => {
    printDoneMessage('プロジェクトを読み込みました');
    printProjectOverviewTable(bookMetadata, bookSource, inputFiles);
  });

  epubCookerEvent.on(EpubCookerEventCode.BEGIN_ITEM_LOADER, ({ inputFiles }) => {
    LoaderProgressBar.reset(inputFiles);
  });

  epubCookerEvent.on(EpubCookerEventCode.ITEM_LOADER_NEXT_ITEM, (input) => {
    LoaderProgressBar.update(0, input);
  });

  epubCookerEvent.on(EpubCookerEventCode.ITEM_LOADED, () => {
    LoaderProgressBar.update(1);
  });

  epubCookerEvent.on(EpubCookerEventCode.END_ITEM_LOADER, () => {
    LoaderProgressBar.stop();
    printDoneMessage('読み込み完了');
  });

  epubCookerEvent.on(EpubCookerEventCode.NO_TOC, () => {
    LoaderProgressBar.stop();
    printWarnMessage('このEPUBプロジェクトには目次が定義されていません');
    LoaderProgressBar.resume();
  });

  epubCookerEvent.on(EpubCookerEventCode.FINISHED, (destination) => {
    printDoneMessage('製本完了');
    console.log(chalk.hex('#00cde0')(`🎉 EPUBの生成が完了しました！`));
    console.log(chalk.gray(destination));
  });

  epubCookerEvent.on(EpubCookerEventCode.FINISHED_WITHOUT_ARCHIVE, (destination) => {
    printDoneMessage('処理終了');
    console.log('EPUBファイルのコンテンツの変換結果を下記に出力しました');
    console.log(chalk.gray(destination));
  });

  epubCookerEvent.on(EpubCookerEventCode.PAGE_NOT_FOUND, (pagePath) => {
    LoaderProgressBar.stop();
    printWarnMessage(
      `処理対象のページとして指定されているページのうち、次は見つかりませんでした: ${chalk.gray(pagePath)}`,
    );
    LoaderProgressBar.resume();
  });
}
