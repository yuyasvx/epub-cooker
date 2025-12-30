import chalk from 'chalk';
import columnify from 'columnify';
import type { SourceHandlingType } from '../../enums/SourceHandlingType';
import type { EpubProjectV2 } from '../../value/EpubProject';
import { type InputFileDetail, isPageContent } from '../../value/InputFileDetail';

/**
 * @internal
 */
export function printProjectOverviewTable(project: EpubProjectV2, loadedFiles: InputFileDetail[], blankLine = true) {
  console.log(
    `${blankLine ? '\n' : ''}${content(project)}\n\n${fileCounts(loadedFiles, project.source.using)}${pageList(project.source.pages)}`,
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
      ...(project.metadata.description ? { [propertyKey('説明')]: project.metadata.description } : {}),
    },
    {
      showHeaders: false,
      columnSplitter: ': ',
    },
  );
}

function fileCounts(loadedFiles: InputFileDetail[], using: SourceHandlingType) {
  const counts = loadedFiles.reduce(
    (acc, f) => {
      if (isPageContent(f, using)) {
        acc.pageFiles++;
      } else {
        acc.otherFiles++;
      }
      return acc;
    },
    { pageFiles: 0, otherFiles: 0 },
  );

  return `${bullet()}処理対象のファイル: 合計 ${loadedFiles.length}
  ${chalk.gray(`- ページファイル: ${counts.pageFiles}`)}
  ${chalk.gray(`- 画像・CSSなど: ${counts.otherFiles}`)}`;
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
