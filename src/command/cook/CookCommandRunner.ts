import chalk from 'chalk';
import { format } from 'date-fns';
import * as LoaderProgressBar from '../../app/print/LoaderProgressBar';
import { printDoneMessage } from '../../app/print/PrintDoneMessage';
import { printProjectOverviewTable } from '../../app/print/PrintProjectOverviewTable';
import { printWarnMessage } from '../../app/print/PrintWarnMessage';
import { archiveDirectory } from '../../feature/archiver';
import { decideIdentifier } from '../../feature/book-identification';
import { epubCookerEvent, EpubCookerEventType } from '../../feature/event-emitter';
import { _getEventEmitter } from '../../feature/event-emitter/InitEvent';
import { loadContentsItem } from '../../feature/item-loader';
import { saveMarkupStructure } from '../../feature/metadata-generator';
import { type LoadedProject, loadProject } from '../../feature/project-loader';
import * as FileIo from '../../lib/file-io/FileIo';
import { tryThrows } from '../../lib/util/EffectUtil';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
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
    .andThen(({ contentsDir, inputFiles, projectDefinition }) =>
      decideIdentifier(projectDefinition, projectDir).map(
        (p) => ({ projectDefinition: p, inputFiles, projectDir, contentsDir }) satisfies LoadedProject,
      ),
    )
    .andThen((loaded) => loadContentsItem(loaded, resolvePath(workingDir, 'OPS')))
    .andThen(([loaded, items]) => saveMarkupStructure(workingDir, loaded.projectDefinition, items))
    .andThen((project) => archiveDirectory(workingDir, projectDir, project, !noPack))
    .andThen(() => finalizeProcessedFiles(workingDir, noPack))
    .andTee(() => finalize())
    .orTee(() => finalize());
}

function finalizeProcessedFiles(workingDir: ResolvedPath, keepWorkingContents = false) {
  if (keepWorkingContents) {
    const destination = resolvePath(workingDir, '..', `working-contents-${format(new Date(), 'yyyyMMdd-HHmmss')}`);
    _getEventEmitter().emit(EpubCookerEventType.FINISHED_WITHOUT_ARCHIVE, destination);
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
  epubCookerEvent.on(EpubCookerEventType.PROJECT_LOADED, ({ inputFiles, projectDefinition }) => {
    printDoneMessage('プロジェクトを読み込みました');
    printProjectOverviewTable(projectDefinition, inputFiles);
  });

  epubCookerEvent.on(EpubCookerEventType.BEGIN_ITEM_LOADER, ({ inputFiles }) => {
    LoaderProgressBar.reset(inputFiles);
  });

  epubCookerEvent.on(EpubCookerEventType.ITEM_LOADER_NEXT_ITEM, (input) => {
    LoaderProgressBar.update(0, input);
  });

  epubCookerEvent.on(EpubCookerEventType.ITEM_LOADED, () => {
    LoaderProgressBar.update(1);
  });

  epubCookerEvent.on(EpubCookerEventType.END_ITEM_LOADER, () => {
    LoaderProgressBar.stop();
    printDoneMessage('読み込み完了');
  });

  epubCookerEvent.on(EpubCookerEventType.NO_TOC, () => {
    LoaderProgressBar.stop();
    printWarnMessage('このEPUBプロジェクトには目次が定義されていません');
    LoaderProgressBar.resume();
  });

  epubCookerEvent.on(EpubCookerEventType.FINISHED, ([, destination]) => {
    printDoneMessage('製本完了');
    console.log(chalk.hex('#00cde0')(`🎉 EPUBの生成が完了しました！`));
    console.log(chalk.gray(destination));
  });

  epubCookerEvent.on(EpubCookerEventType.FINISHED_WITHOUT_ARCHIVE, (destination) => {
    printDoneMessage('処理終了');
    console.log('EPUBファイルのコンテンツの変換結果を下記に出力しました');
    console.log(chalk.gray(destination));
  });

  epubCookerEvent.on(EpubCookerEventType.PAGE_NOT_FOUND, (pagePath) => {
    LoaderProgressBar.stop();
    printWarnMessage(
      `処理対象のページとして指定されているページのうち、次は見つかりませんでした: ${chalk.gray(pagePath)}`,
    );
    LoaderProgressBar.resume();
  });
}
