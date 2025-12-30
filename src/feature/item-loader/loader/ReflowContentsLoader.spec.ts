import { okAsync } from 'neverthrow';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { PageLayoutType } from '../../../enums/PageLayoutType';
import { PageProgressionDirectionType } from '../../../enums/PageProgressionDirectionType';
import { SourceHandlingType } from '../../../enums/SourceHandlingType';
import { rejecting } from '../../../lib/util/EffectUtil';
import type { EpubProjectV2 } from '../../../value/EpubProject';
import { InputFileDetail } from '../../../value/InputFileDetail';
import { ItemPath } from '../../../value/ItemPath';
import { type ResolvedPath, resolvePath } from '../../../value/ResolvedPath';
import { EpubCookerEventType } from '../../event-emitter';
import type { LoadedProject } from '../../project-loader';
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
const contentsDir = resolvePath(projectRoot, 'contents');
const saveTo = resolvePath('/test/output');

const createLoadedProject = (files: string[], sourceConfig: Partial<EpubProjectV2['source']> = {}) => {
  const defaultSource: EpubProjectV2['source'] = {
    using: SourceHandlingType.markdown,
    contents: 'contents',
    'ignore-patterns': [],
    'ignore-unknown-file-type': true,
    'ignore-system-file': true,
  };

  const projectDefinition = {
    version: 2,
    source: { ...defaultSource, ...sourceConfig },
    book: {
      'layout-type': PageLayoutType.reflow,
      'page-progression-direction': PageProgressionDirectionType.ltr,
      'use-specified-fonts': false,
    },
    metadata: {
      title: 'book title test',
      language: 'ja',
    },
  } satisfies EpubProjectV2;

  return {
    projectDefinition,
    inputFiles: files.map((f) => InputFileDetail(f as ResolvedPath, projectDefinition, contentsDir)),
    projectDir: projectRoot,
    contentsDir,
  } satisfies LoadedProject;
};

describe('ReflowContentsLoader', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Markdownファイルをページとして、画像ファイルをアセットとして処理する', async () => {
    // Arrange
    const loadedProject = createLoadedProject(['page1.md', 'image.png']);
    vi.mocked(runMarkdownItemProcessor).mockReturnValue(okAsync(ItemPath('page1.xhtml')));
    vi.mocked(runFileCopyItemProcessor).mockReturnValue(okAsync(ItemPath('image.png')));
    vi.mocked(runAutoEmptyTocItemProcessor).mockReturnValue(okAsync(ItemPath('toc.xhtml')));

    // Act
    const result = await loadReflowContents(loadedProject, saveTo);

    // Assert
    expect(result.isOk()).toBe(true);
    const [, items] = result._unsafeUnwrap();

    expect(items).toHaveLength(3); // page, asset, auto-toc
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
        filePath: 'page1.md' as ResolvedPath,
        fileType: 'text/markdown',
        isHtml: false,
        isMarkdown: true,
        isXhtml: false,
        toc: false,
      } satisfies InputFileDetail,
      loadedProject,
      saveTo,
      undefined,
    );
    expect(runFileCopyItemProcessor).toHaveBeenCalledWith(
      {
        coverImage: false,
        filePath: 'image.png',
        fileType: 'image/png',
        isHtml: false,
        isMarkdown: false,
        isXhtml: false,
        toc: false,
      },
      loadedProject,
      saveTo,
    );
    // 目次がないので自動生成が呼ばれる
    expect(runAutoEmptyTocItemProcessor).toHaveBeenCalled();
    expect(mockEmit).toHaveBeenCalledWith(EpubCookerEventType.NO_TOC);
  });

  test('指定されたページ順序に従って処理する', async () => {
    // Arrange
    const loadedProject = createLoadedProject(
      ['/test/project/contents/page2.md', '/test/project/contents/page1.md', '/test/project/contents/page3.md'],
      {
        pages: ['page1.md', 'page2.md'],
      },
    );
    vi.mocked(runMarkdownItemProcessor).mockImplementation(({ filePath }) => {
      if (filePath.endsWith('page1.md')) return okAsync(ItemPath('page1.xhtml'));
      if (filePath.endsWith('page2.md')) return okAsync(ItemPath('page2.xhtml'));
      return okAsync(ItemPath('page3.xhtml'));
    });
    vi.mocked(runAutoEmptyTocItemProcessor).mockReturnValue(okAsync(ItemPath('toc.xhtml')));

    // Act
    const [, items] = await rejecting(loadReflowContents(loadedProject, saveTo));

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
    const loadedProject = createLoadedProject(['/test/project/contents/toc.md', '/test/project/contents/page1.md'], {
      'toc-page-path': 'toc.md',
      pages: ['page1.md'],
    });
    vi.mocked(runMarkdownTocItemProcessor).mockReturnValue(okAsync(ItemPath('toc.xhtml')));
    vi.mocked(runMarkdownItemProcessor).mockReturnValue(okAsync(ItemPath('page1.xhtml')));

    // Act
    const result = await loadReflowContents(loadedProject, saveTo);

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
      },
      loadedProject,
      saveTo,
      undefined,
    );
    expect(runAutoEmptyTocItemProcessor).not.toHaveBeenCalled();
  });

  test('存在しないページが指定された場合はイベントを発行する', async () => {
    // Arrange
    const loadedProject = createLoadedProject(['page1.md'], { pages: ['page1.md', 'missing.md'] });
    vi.mocked(runMarkdownItemProcessor).mockReturnValue(okAsync(ItemPath('page1.xhtml')));
    vi.mocked(runAutoEmptyTocItemProcessor).mockReturnValue(okAsync(ItemPath('toc.xhtml')));

    // Act
    await loadReflowContents(loadedProject, saveTo);

    // Assert
    expect(mockEmit).toHaveBeenCalledWith(EpubCookerEventType.PAGE_NOT_FOUND, 'missing.md');
  });

  test('HTML/XHTMLファイルもページとして処理される', async () => {
    // Arrange
    const loadedProject = createLoadedProject(
      ['page.html', 'page.xhtml'],
      { using: SourceHandlingType.markdown }, // markdownモードでもhtml/xhtmlはページ扱い
    );
    vi.mocked(runHtmlItemProcessor).mockReturnValue(okAsync(ItemPath('processed.xhtml')));
    vi.mocked(runAutoEmptyTocItemProcessor).mockReturnValue(okAsync(ItemPath('toc.xhtml')));

    // Act
    await loadReflowContents(loadedProject, saveTo);

    // Assert
    expect(runHtmlItemProcessor).toHaveBeenCalledTimes(2);
  });

  test('SourceHandlingType.none の場合はMarkdownは無視される', async () => {
    // Arrange
    const loadedProject = createLoadedProject(['page.md', 'page.html'], { using: SourceHandlingType.none });
    vi.mocked(runHtmlItemProcessor).mockReturnValue(okAsync(ItemPath('page.xhtml')));
    vi.mocked(runFileCopyItemProcessor).mockReturnValue(okAsync(ItemPath('page.md'))); // assetとしてコピー
    vi.mocked(runAutoEmptyTocItemProcessor).mockReturnValue(okAsync(ItemPath('toc.xhtml')));

    // Act
    await loadReflowContents(loadedProject, saveTo);

    // Assert
    expect(runMarkdownItemProcessor).not.toHaveBeenCalled();
    expect(runHtmlItemProcessor).toHaveBeenCalledWith(
      {
        coverImage: false,
        filePath: 'page.html',
        fileType: 'text/html',
        isHtml: true,
        isMarkdown: false,
        isXhtml: false,
        toc: false,
      },
      loadedProject,
      saveTo,
      undefined,
    );
    // Markdownはアセット扱いになるのでコピーされる
    expect(runFileCopyItemProcessor).toHaveBeenCalledWith(
      {
        coverImage: false,
        filePath: 'page.md',
        fileType: 'text/markdown',
        isHtml: false,
        isMarkdown: true,
        isXhtml: false,
        toc: false,
      },
      loadedProject,
      saveTo,
    );
  });
});
