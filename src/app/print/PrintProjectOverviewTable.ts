import chalk from 'chalk';
import columnify from 'columnify';
import { formatISO } from 'date-fns';
import type { SourceHandlingType } from '../../enums/SourceHandlingType';
import type { EpubBookMetadata } from '../../value/EpubBookMetadata';
import type { EpubBookSource, EpubBookSourcePageOption } from '../../value/EpubBookSource';
import { type InputFileDetail, isPageContent } from '../../value/InputFileDetail';

/**
 * @internal
 */
export function printProjectOverviewTable(
  bookMetadata: EpubBookMetadata,
  bookSource: EpubBookSource,
  loadedFiles: InputFileDetail[],
  blankLine = true,
) {
  console.log(
    `${blankLine ? '\n' : ''}${content(bookMetadata)}\n\n${fileCounts(loadedFiles, bookSource.sourceHandlingType)}${pageList(bookSource.pages)}`,
  );
}

function content(bookMetadata: EpubBookMetadata) {
  return columnify(
    {
      [propertyKey('作品名')]: bookMetadata.title,
      ...(bookMetadata.author ? { [propertyKey('著者')]: bookMetadata.author } : {}),
      ...(bookMetadata.publisher ? { [propertyKey('出版社')]: bookMetadata.publisher } : {}),
      ...(bookMetadata.publishedDate != null
        ? { [propertyKey('発売日')]: formatISO(bookMetadata.publishedDate, { representation: 'date' }) }
        : {}),
      [propertyKey('言語')]: bookMetadata.language,
      ...(bookMetadata.description ? { [propertyKey('説明')]: bookMetadata.description } : {}),
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

function pageList(pages?: EpubBookSourcePageOption[]) {
  if (pages == null) {
    return '';
  }
  return `\n${bullet()}処理対象のページ:\n${chalk.gray(pages.map((p) => `  - ${p.pagePath}`).join('\n'))}`;
}
