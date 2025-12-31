import { describe, expect, test } from 'vitest';
import type { InputFileDetail } from '../../../value/InputFileDetail';
import { resolvePath } from '../../../value/ResolvedPath';
import { MarkdownParser } from '../MarkdownParser';

describe('obsidianInternalLinks', () => {
  const mockFiles: InputFileDetail[] = [
    {
      filePath: resolvePath('/root/contents/index.md'),
      fileType: 'text/markdown',
      isMarkdown: true,
      isHtml: false,
      isXhtml: false,
      coverImage: false,
      toc: false,
    },
    {
      filePath: resolvePath('/root/contents/sub/article.md'),
      fileType: 'text/markdown',
      isMarkdown: true,
      isHtml: false,
      isXhtml: false,
      coverImage: false,
      toc: false,
    },
  ];
  const parser = new MarkdownParser(mockFiles);

  test('シンプルな内部リンクを.xhtmlへの相対パスに変換する', () => {
    const markdown = '[[index]]';
    const currentPath = resolvePath('/root/contents/sub/article.md');

    const result = parser.parseMarkdown(markdown, currentPath);
    expect(result.htmlText).toContain('<a href="../index.xhtml" class="internal-link">index</a>');
  });

  test('表示テキスト付きの内部リンクを変換する', () => {
    const markdown = '[[index|トップページ]]';
    const currentPath = resolvePath('/root/contents/sub/article.md');

    const result = parser.parseMarkdown(markdown, currentPath);
    expect(result.htmlText).toContain('<a href="../index.xhtml" class="internal-link">トップページ</a>');
  });

  test('見出し付きの内部リンクをアンカー付きのパスに変換する', () => {
    const markdown = '[[article#セクション 1]]';
    const currentPath = resolvePath('/root/contents/index.md');

    const result = parser.parseMarkdown(markdown, currentPath);

    // 見出しのスペースはハイフンに変換されるロジック（現在の実装通り）
    expect(result.htmlText).toContain(
      '<a href="sub/article.xhtml#セクション-1" class="internal-link">article#セクション 1</a>',
    );
  });

  test('存在しないファイルへのリンクはデフォルトのパスを生成する', () => {
    const markdown = '[[non-existent]]';
    const currentPath = resolvePath('/root/contents/index.md');

    const result = parser.parseMarkdown(markdown, currentPath);
    expect(result.htmlText).toContain('<a href="non-existent.xhtml" class="internal-link">non-existent</a>');
  });
});
