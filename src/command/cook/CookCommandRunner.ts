import chalk from 'chalk';
import { format } from 'date-fns';
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
    .andThen(({ contentsDir, loadedFiles, projectDefinition }) =>
      decideIdentifier(projectDefinition, projectDir).map(
        (p) => ({ projectDefinition: p, loadedFiles, projectDir, contentsDir }) satisfies LoadedProject,
      ),
    )
    .andThen((loaded) => loadContentsItem(loaded, resolvePath(workingDir, 'OPS')))
    .andThen(([loaded, items]) => saveMarkupStructure(workingDir, loaded.projectDefinition, items))
    .andThen((project) => archiveDirectory(workingDir, projectDir, project, !noPack))
    .andThen(() => finalize(workingDir, noPack))
    .andTee(() => epubCookerEvent.offAll())
    .orTee(() => epubCookerEvent.offAll());
}

function finalize(workingDir: ResolvedPath, keepWorkingContents = false) {
  if (keepWorkingContents) {
    const destination = resolvePath(workingDir, '..', `working-contents-${format(new Date(), 'yyyyMMdd-HHmmss')}`);
    _getEventEmitter().emit(EpubCookerEventType.FINISHED_WITHOUT_ARCHIVE, destination);
    return FileIo.move(workingDir, destination);
  }
  return FileIo.remove(workingDir);
}

function prepareEvents() {
  epubCookerEvent.on(EpubCookerEventType.PROJECT_LOADED, ({ loadedFiles, projectDefinition }) => {
    printDoneMessage('プロジェクトを読み込みました');
    printProjectOverviewTable(projectDefinition, loadedFiles);
  });

  epubCookerEvent.on(EpubCookerEventType.NO_TOC, () => {
    printWarnMessage('このEPUBプロジェクトには目次が定義されていません');
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
    printWarnMessage(
      `処理対象のページとして指定されているページのうち、次は見つかりませんでした: ${chalk.gray(pagePath)}`,
    );
  });
}
