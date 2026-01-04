import { describe, expect, test } from 'vitest';
import { PageSpreadPositionType } from '../../../enums/PageSpreadPositionType';
import type { InputFileDetail } from '../../../value/InputFileDetail';
import { resolvePath } from '../../../value/ResolvedPath';
import { MarkdownParser } from '../MarkdownParser';

describe('obsidianEmbed', () => {
  const mockFiles: InputFileDetail[] = [
    {
      filePath: resolvePath('/root/contents/images/test-image.png'),
      fileType: 'image/png',
      isMarkdown: false,
      isHtml: false,
      isXhtml: false,
      coverImage: false,
      toc: false,
      spreadType: PageSpreadPositionType.NONE,
    },
    {
      filePath: resolvePath('/root/contents/sub/photo.jpg'),
      fileType: 'image/jpeg',
      isMarkdown: false,
      isHtml: false,
      isXhtml: false,
      coverImage: false,
      toc: false,
      spreadType: PageSpreadPositionType.NONE,
    },
  ];

  const parser = new MarkdownParser(mockFiles);
  const currentPath = resolvePath('/root/contents/index.md');

  test('通常の画像埋め込みをimgタグに変換する', () => {
    const markdown = '![[test-image.png]]';
    const result = parser.parseMarkdown(markdown, currentPath);

    expect(result.htmlText).toContain('<img src="images/test-image.png" alt="test-image.png" />');
  });

  test('幅指定のリサイズをimgタグに反映する', () => {
    const markdown = '![[test-image.png|100]]';
    const result = parser.parseMarkdown(markdown, currentPath);

    expect(result.htmlText).toContain('<img src="images/test-image.png" width="100" alt="test-image.png" />');
  });

  test('幅と高さ指定のリサイズをimgタグに反映する', () => {
    const markdown = '![[test-image.png|100x200]]';
    const result = parser.parseMarkdown(markdown, currentPath);

    expect(result.htmlText).toContain(
      '<img src="images/test-image.png" width="100" height="200" alt="test-image.png" />',
    );
  });

  test('Altテキスト指定をimgタグに反映する', () => {
    const markdown = '![[test-image.png|代替テキスト]]';
    const result = parser.parseMarkdown(markdown, currentPath);

    expect(result.htmlText).toContain('<img src="images/test-image.png" alt="代替テキスト" />');
  });

  test('拡張子なしでも画像ファイルが見つかれば変換する', () => {
    const markdown = '![[photo]]';
    const result = parser.parseMarkdown(markdown, currentPath);

    expect(result.htmlText).toContain('<img src="sub/photo.jpg" alt="photo" />');
  });

  test('存在しないファイルは変換しない', () => {
    const markdown = '![[not-found.png]]';
    const result = parser.parseMarkdown(markdown, currentPath);

    expect(result.htmlText).not.toContain('<img');
    expect(result.htmlText).toContain('![[not-found.png]]');
  });
});
