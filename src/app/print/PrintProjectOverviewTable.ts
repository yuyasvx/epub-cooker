import chalk from 'chalk';
import columnify from 'columnify';
import type { EpubProjectV2 } from '../../value/EpubProject';

/**
 * @internal
 */
export function printProjectOverviewTable(project: EpubProjectV2, loadedFiles: unknown[], blankLine = true) {
  console.log(
    `${blankLine ? '\n' : ''}${content(project)}\n\n${fileCounts(loadedFiles)}${pageList(project.source.pages)}`,
  );
}

function content(project: EpubProjectV2) {
  return columnify(
    {
      [propertyKey('作品名')]: project.metadata.title,
      ...(project.metadata.author ? { [propertyKey('著者')]: project.metadata.author } : {}),
      ...(project.metadata.publisher ? { [propertyKey('出版社')]: project.metadata.publisher } : {}),
      ...(project.metadata['published-date'] ? { [propertyKey('発売日')]: project.metadata['published-date'] } : {}),
      [propertyKey('言語')]: project.metadata.language,
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

function pageList(pagePaths?: string[]) {
  if (pagePaths == null) {
    return '';
  }
  return `\n${bullet()}処理対象のページ:\n${chalk.gray(pagePaths.map((p) => `  - ${p}`).join('\n'))}`;
}
