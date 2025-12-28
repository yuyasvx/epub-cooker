import { okAsync } from 'neverthrow';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { SourceHandlingType } from '../../../enums/SourceHandlingType';
import type { EpubProjectV2 } from '../../../value/EpubProject';
import { ItemPath } from '../../../value/ItemPath';
import { resolvePath } from '../../../value/ResolvedPath';
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
    source: { ...defaultSource, ...sourceConfig },
    book: {},
    metadata: {},
  } as unknown as EpubProjectV2;

  return {
    projectDefinition,
    loadedFiles: files.map((f) => resolvePath(contentsDir, f)),
    projectDir: projectRoot,
    contentsDir,
  };
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
      expect.stringContaining('page1.md'),
      contentsDir,
      saveTo,
      undefined,
    );
    expect(runFileCopyItemProcessor).toHaveBeenCalledWith(expect.stringContaining('image.png'), contentsDir, saveTo);
    // 目次がないので自動生成が呼ばれる
    expect(runAutoEmptyTocItemProcessor).toHaveBeenCalled();
    expect(mockEmit).toHaveBeenCalledWith(EpubCookerEventType.NO_TOC);
  });

  test('指定されたページ順序に従って処理する', async () => {
    // Arrange
    const loadedProject = createLoadedProject(['page2.md', 'page1.md', 'page3.md'], {
      pages: ['page1.md', 'page2.md'],
    });
    vi.mocked(runMarkdownItemProcessor).mockImplementation((path) => {
      if (path.endsWith('page1.md')) return okAsync(ItemPath('page1.xhtml'));
      if (path.endsWith('page2.md')) return okAsync(ItemPath('page2.xhtml'));
      return okAsync(ItemPath('page3.xhtml'));
    });
    vi.mocked(runAutoEmptyTocItemProcessor).mockReturnValue(okAsync(ItemPath('toc.xhtml')));

    // Act
    const result = await loadReflowContents(loadedProject, saveTo);

    // Assert
    const [, items] = result._unsafeUnwrap();
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
    const loadedProject = createLoadedProject(['toc.md', 'page1.md'], {
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
      expect.stringContaining('toc.md'),
      contentsDir,
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
      expect.stringContaining('page.html'),
      expect.anything(),
      expect.anything(),
      undefined,
    );
    // Markdownはアセット扱いになるのでコピーされる
    expect(runFileCopyItemProcessor).toHaveBeenCalledWith(
      expect.stringContaining('page.md'),
      expect.anything(),
      expect.anything(),
    );
  });
});
