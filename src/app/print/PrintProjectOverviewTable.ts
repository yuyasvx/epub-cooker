import chalk from 'chalk';
import columnify from 'columnify';
import type { EpubProjectV2 } from '../../value/EpubProject';

/**
 * @internal
 */
export function printProjectOverviewTable(project: EpubProjectV2, loadedFiles: unknown[], blankLine = true) {
  console.log(`${blankLine ? '\n' : ''}${content(project)}\n\n${fileCounts(loadedFiles)}`);
}

function content(project: EpubProjectV2) {
  return columnify(
    {
      [propertyKey('title')]: project.metadata.title,
      ...(project.metadata.author ? { [propertyKey('author')]: project.metadata.author } : {}),
      ...(project.metadata.publisher ? { [propertyKey('publisher')]: project.metadata.publisher } : {}),
      [propertyKey('language')]: project.metadata.language,
    },
    {
      showHeaders: false,
      columnSplitter: ': ',
    },
  );
}

function fileCounts(loadedFiles: unknown[]) {
  return `${bullet()}処理対象のファイル数: ${loadedFiles.length}`;
}

function propertyKey(keyName: string) {
  return chalk.hex('#A0A0A0')(keyName);
}

function bullet() {
  return chalk.hex('#ffe600')('- ');
}
