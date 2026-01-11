import { okAsync } from 'neverthrow';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { PageSpreadPositionType } from '../../../enums/PageSpreadPositionType';
import { SourceHandlingType } from '../../../enums/SourceHandlingType';
import { rejecting, throwing } from '../../../lib/util/EffectUtil';
import { BookConfiguration } from '../../../value/BookConfiguration';
import { BookMetadata } from '../../../value/BookMetadata';
import { BookSource } from '../../../value/BookSource';
import { EpubProject } from '../../../value/EpubProject';
import { InputFileDetail } from '../../../value/InputFileDetail';
import { ItemPath } from '../../../value/ItemPath';
import { type ResolvedPath, resolvePath } from '../../../value/ResolvedPath';
import { EpubCookerEventType } from '../../event-emitter';
import { runAutoEmptyTocItemProcessor } from '../processor/AutoEmptyTocProcessor';
import { runFileCopyItemProcessor } from '../processor/FileCopyItemProcessor';
import { runHtmlItemProcessor } from '../processor/HtmlItemProcessor';
import { runMarkdownItemProcessor } from '../processor/MarkdownItemProcessor';
import { runMarkdownTocItemProcessor } from '../processor/MarkdownTocItemProcessor';
import { ProcessedItemType } from './enums/ProcessedItemType';
import { loadReflowContents } from './ReflowContentsLoader';

// モックの定義
const mockEmit = vi.fn();
vi.mock('../../event-emitter/InitEvent', () => ({
  _getEventEmitter: () => ({
    emit: mockEmit,
  }),
}));

vi.mock('../processor/AutoEmptyTocProcessor', () => ({
  runAutoEmptyTocItemProcessor: vi.fn(),
}));
vi.mock('../processor/FileCopyItemProcessor', () => ({
  runFileCopyItemProcessor: vi.fn(),
}));
vi.mock('../processor/HtmlItemProcessor', () => ({
  runHtmlItemProcessor: vi.fn(),
}));
vi.mock('../processor/MarkdownItemProcessor', () => ({
  runMarkdownItemProcessor: vi.fn(),
}));
vi.mock('../processor/MarkdownTocItemProcessor', () => ({
  runMarkdownTocItemProcessor: vi.fn(),
}));

// ヘルパー
const projectRoot = resolvePath('/test/project');
const saveTo = resolvePath('/test/output');

describe('ReflowContentsLoader', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Markdownファイルをページとして、画像ファイルをアセットとして処理する', async () => {
    // Arrange
    const bookSource = BookSource(
      { sourceHandlingType: SourceHandlingType.markdown },
      resolvePath(projectRoot, 'contents'),
    );
    const inputFiles = [
      InputFileDetail(resolvePath(projectRoot, 'contents/page1.md'), bookSource),
      InputFileDetail(resolvePath(projectRoot, 'contents/image.png'), bookSource),
    ];
    const project = throwing(
      EpubProject(
        projectRoot,
        BookMetadata({ title: 'book title test', language: 'ja', identifier: 'id' }),
        bookSource,
        [],
        BookConfiguration(),
      ),
    );

    vi.mocked(runMarkdownItemProcessor).mockReturnValue(okAsync(ItemPath('page1.xhtml')));
    vi.mocked(runFileCopyItemProcessor).mockReturnValue(okAsync(ItemPath('image.png')));
    vi.mocked(runAutoEmptyTocItemProcessor).mockReturnValue(okAsync(ItemPath('toc.xhtml')));

    // Act
    const result = await loadReflowContents(project, inputFiles, saveTo);

    // Assert
    expect(result.isOk()).toBe(true);
    const [, items] = result._unsafeUnwrap();

    expect(items).toHaveLength(3);
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ itemType: ProcessedItemType.PAGE, itemPath: 'page1.xhtml' }),
        expect.objectContaining({ itemType: ProcessedItemType.ASSET, itemPath: 'image.png' }),
        expect.objectContaining({ itemType: ProcessedItemType.TOC_PAGE, itemPath: 'toc.xhtml' }),
      ]),
    );

    expect(runMarkdownItemProcessor).toHaveBeenCalledWith(
      {
        coverImage: false,
        filePath: '/test/project/contents/page1.md' as ResolvedPath,
        fileType: 'text/markdown',
        isHtml: false,
        isMarkdown: true,
        isXhtml: false,
        toc: false,
        spreadType: PageSpreadPositionType.NONE,
      } satisfies InputFileDetail,
      bookSource.contentsDir,
      saveTo,
      undefined,
      expect.anything(),
    );
    expect(runFileCopyItemProcessor).toHaveBeenCalledWith(
      {
        coverImage: false,
        filePath: '/test/project/contents/image.png' as ResolvedPath,
        fileType: 'image/png',
        isHtml: false,
        isMarkdown: false,
        isXhtml: false,
        toc: false,
        spreadType: PageSpreadPositionType.NONE,
      } satisfies InputFileDetail,
      bookSource.contentsDir,
      saveTo,
    );
    // 目次がないので自動生成が呼ばれる
    expect(runAutoEmptyTocItemProcessor).toHaveBeenCalled();
    expect(mockEmit).toHaveBeenCalledWith(EpubCookerEventType.NO_TOC);
  });

  test('指定されたページ順序に従って処理する', async () => {
    // Arrange
    const bookSource = BookSource(
      {
        sourceHandlingType: SourceHandlingType.markdown,
        pages: [
          {
            pagePath: resolvePath(projectRoot, 'contents/page1.md'),
            spreadType: PageSpreadPositionType.NONE,
          },
          {
            pagePath: resolvePath(projectRoot, 'contents/page2.md'),
            spreadType: PageSpreadPositionType.NONE,
          },
        ],
      },
      resolvePath(projectRoot, 'contents'),
    );
    const inputFiles = [
      InputFileDetail(resolvePath(projectRoot, 'contents/page2.md'), bookSource),
      InputFileDetail(resolvePath(projectRoot, 'contents/page1.md'), bookSource),
      InputFileDetail(resolvePath(projectRoot, 'contents/page3.md'), bookSource),
    ];
    const project = throwing(
      EpubProject(
        projectRoot,
        BookMetadata({ title: 'book title test', language: 'ja', identifier: 'id' }),
        bookSource,
        [],
        BookConfiguration(),
      ),
    );

    vi.mocked(runMarkdownItemProcessor).mockImplementation(({ filePath }) => {
      if (filePath.endsWith('page1.md')) return okAsync(ItemPath('page1.xhtml'));
      if (filePath.endsWith('page2.md')) return okAsync(ItemPath('page2.xhtml'));
      return okAsync(ItemPath('page3.xhtml'));
    });
    vi.mocked(runAutoEmptyTocItemProcessor).mockReturnValue(okAsync(ItemPath('toc.xhtml')));

    // Act
    const [, items] = await rejecting(loadReflowContents(project, inputFiles, saveTo));

    // Assert
    const pages = items.filter((i) => i.itemType === ProcessedItemType.PAGE);

    expect(pages).toHaveLength(2);
    expect(pages[0]?.itemPath).toBe('page1.xhtml');
    expect(pages[1]?.itemPath).toBe('page2.xhtml');

    // page3.md は処理されないはず (プロセッサが呼ばれないことを確認)
    expect(runMarkdownItemProcessor).not.toHaveBeenCalledWith(
      expect.stringContaining('page3.md'),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
  });

  test('目次ファイルはページ指定に含まれていなくても処理される', async () => {
    // Arrange
    const bookSource = BookSource(
      {
        sourceHandlingType: SourceHandlingType.markdown,
        tocPath: 'toc.md',
        pages: [
          {
            pagePath: resolvePath(projectRoot, 'contents/page1.md'),
            spreadType: PageSpreadPositionType.NONE,
          },
        ],
      },
      resolvePath(projectRoot, 'contents'),
    );
    const inputFiles = [
      InputFileDetail(resolvePath(projectRoot, 'contents/toc.md'), bookSource),
      InputFileDetail(resolvePath(projectRoot, 'contents/page1.md'), bookSource),
    ];
    const project = throwing(
      EpubProject(
        projectRoot,
        BookMetadata({ title: 'book title test', language: 'ja', identifier: 'id' }),
        bookSource,
        [],
        BookConfiguration(),
      ),
    );

    vi.mocked(runMarkdownTocItemProcessor).mockReturnValue(okAsync(ItemPath('toc.xhtml')));
    vi.mocked(runMarkdownItemProcessor).mockReturnValue(okAsync(ItemPath('page1.xhtml')));

    // Act
    const result = await loadReflowContents(project, inputFiles, saveTo);

    // Assert
    const [, items] = result._unsafeUnwrap();
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ itemType: ProcessedItemType.TOC_PAGE, itemPath: 'toc.xhtml' }),
        expect.objectContaining({ itemType: ProcessedItemType.PAGE, itemPath: 'page1.xhtml' }),
      ]),
    );

    expect(runMarkdownTocItemProcessor).toHaveBeenCalledWith(
      {
        coverImage: false,
        filePath: '/test/project/contents/toc.md',
        fileType: 'text/markdown',
        isHtml: false,
        isMarkdown: true,
        isXhtml: false,
        toc: true,
        spreadType: PageSpreadPositionType.NONE,
      },
      bookSource.contentsDir,
      saveTo,
      undefined,
      expect.anything(),
    );
    expect(runAutoEmptyTocItemProcessor).not.toHaveBeenCalled();
  });

  test('存在しないページが指定された場合はイベントを発行する', async () => {
    // Arrange
    const bookSource = BookSource(
      {
        sourceHandlingType: SourceHandlingType.markdown,
        tocPath: 'toc.md',
        pages: [
          {
            pagePath: resolvePath(projectRoot, 'contents/page1.md'),
            spreadType: PageSpreadPositionType.NONE,
          },
          {
            pagePath: resolvePath(projectRoot, 'contents/missing.md'),
            spreadType: PageSpreadPositionType.NONE,
          },
        ],
      },
      resolvePath(projectRoot, 'contents'),
    );
    const inputFiles = [InputFileDetail(resolvePath(projectRoot, 'contents/page1.md'), bookSource)];
    const project = throwing(
      EpubProject(
        projectRoot,
        BookMetadata({ title: 'book title test', language: 'ja', identifier: 'id' }),
        bookSource,
        [],
        BookConfiguration(),
      ),
    );

    vi.mocked(runMarkdownItemProcessor).mockReturnValue(okAsync(ItemPath('page1.xhtml')));
    vi.mocked(runAutoEmptyTocItemProcessor).mockReturnValue(okAsync(ItemPath('toc.xhtml')));

    // Act
    await loadReflowContents(project, inputFiles, saveTo);

    // Assert
    expect(mockEmit).toHaveBeenCalledWith(
      EpubCookerEventType.PAGE_NOT_FOUND,
      resolvePath(projectRoot, 'contents/missing.md'),
    );
  });

  test('HTML/XHTMLファイルもページとして処理される', async () => {
    // Arrange
    const bookSource = BookSource(
      { sourceHandlingType: SourceHandlingType.markdown }, // markdownモードでもhtml/xhtmlはページ扱い
      resolvePath(projectRoot, 'contents'),
    );
    const inputFiles = [
      InputFileDetail(resolvePath(projectRoot, 'contents/page1.html'), bookSource),
      InputFileDetail(resolvePath(projectRoot, 'contents/page2.xhtml'), bookSource),
    ];
    const project = throwing(
      EpubProject(
        projectRoot,
        BookMetadata({ title: 'book title test', language: 'ja', identifier: 'id' }),
        bookSource,
        [],
        BookConfiguration(),
      ),
    );

    vi.mocked(runHtmlItemProcessor).mockReturnValue(okAsync(ItemPath('processed.xhtml')));
    vi.mocked(runAutoEmptyTocItemProcessor).mockReturnValue(okAsync(ItemPath('toc.xhtml')));

    // Act
    await loadReflowContents(project, inputFiles, saveTo);

    // Assert
    expect(runHtmlItemProcessor).toHaveBeenCalledTimes(2);
  });

  test('SourceHandlingType.none の場合はMarkdownは無視される', async () => {
    // Arrange
    const bookSource = BookSource(
      { sourceHandlingType: SourceHandlingType.none },
      resolvePath(projectRoot, 'contents'),
    );
    const inputFiles = [
      InputFileDetail(resolvePath(projectRoot, 'contents/page.md'), bookSource),
      InputFileDetail(resolvePath(projectRoot, 'contents/page.html'), bookSource),
    ];
    const project = throwing(
      EpubProject(
        projectRoot,
        BookMetadata({ title: 'book title test', language: 'ja', identifier: 'id' }),
        bookSource,
        [],
        BookConfiguration(),
      ),
    );

    vi.mocked(runHtmlItemProcessor).mockReturnValue(okAsync(ItemPath('page.xhtml')));
    vi.mocked(runFileCopyItemProcessor).mockReturnValue(okAsync(ItemPath('page.md'))); // assetとしてコピー
    vi.mocked(runAutoEmptyTocItemProcessor).mockReturnValue(okAsync(ItemPath('toc.xhtml')));

    // Act
    await loadReflowContents(project, inputFiles, saveTo);

    // Assert
    expect(runMarkdownItemProcessor).not.toHaveBeenCalled();
    expect(runHtmlItemProcessor).toHaveBeenCalledWith(
      {
        coverImage: false,
        filePath: '/test/project/contents/page.html' as ResolvedPath,
        fileType: 'text/html',
        isHtml: true,
        isMarkdown: false,
        isXhtml: false,
        toc: false,
        spreadType: PageSpreadPositionType.NONE,
      } satisfies InputFileDetail,
      bookSource.contentsDir,
      saveTo,
      undefined,
      expect.anything(),
    );
    // Markdownはアセット扱いになるのでコピーされる
    expect(runFileCopyItemProcessor).toHaveBeenCalledWith(
      {
        coverImage: false,
        filePath: '/test/project/contents/page.md' as ResolvedPath,
        fileType: 'text/markdown',
        isHtml: false,
        isMarkdown: true,
        isXhtml: false,
        toc: false,
        spreadType: PageSpreadPositionType.NONE,
      } satisfies InputFileDetail,
      bookSource.contentsDir,
      saveTo,
    );
  });
});
