import { describe, expect, test } from 'vitest';
import { parseMarkdown } from './MarkdownParser';

describe('parseMarkdown', () => {
  test('should parse basic markdown correctly', () => {
    const markdown = '# Hello World\n\nThis is a paragraph.\n\n- Item 1\n- Item 2';
    const expectedHtml =
      '<h1>Hello World</h1>\n<p>This is a paragraph.</p>\n<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n</ul>\n';
    expect(parseMarkdown(markdown).htmlText).toBe(expectedHtml);
  });

  test('should parse standard markdown links correctly', () => {
    const markdown = 'Visit [Google](https://google.com).';
    const expectedHtml = '<p>Visit <a href="https://google.com">Google</a>.</p>\n';
    expect(parseMarkdown(markdown).htmlText).toBe(expectedHtml);
  });

  test('should convert simple Obsidian internal link to HTML link', () => {
    const markdown = 'Link to [[My Article]].';
    const expectedHtml = '<p>Link to <a href="My Article.html" class="internal-link">My Article</a>.</p>\n';
    expect(parseMarkdown(markdown).htmlText).toBe(expectedHtml);
  });

  test('should convert Obsidian internal link with display text to HTML link', () => {
    const markdown = 'Link to [[Another Article|See More]].';
    const expectedHtml = '<p>Link to <a href="Another Article.html" class="internal-link">See More</a>.</p>\n';
    expect(parseMarkdown(markdown).htmlText).toBe(expectedHtml);
  });

  test('should convert Obsidian internal link with heading to HTML link', () => {
    const markdown = 'Link to [[My Article#Section 1]].';
    const expectedHtml =
      '<p>Link to <a href="My Article.html#section-1" class="internal-link">My Article#Section 1</a>.</p>\n';
    expect(parseMarkdown(markdown).htmlText).toBe(expectedHtml);
  });

  test('should convert Obsidian internal link with heading and display text to HTML link', () => {
    const markdown = 'Link to [[My Article#Section 2|Go to Section]].';
    const expectedHtml =
      '<p>Link to <a href="My Article.html#section-2" class="internal-link">Go to Section</a>.</p>\n';
    expect(parseMarkdown(markdown).htmlText).toBe(expectedHtml);
  });

  test('should handle mixed content correctly', () => {
    const markdown = 'This is a **bold** text and a link to [[Test Page]].';
    const expectedHtml =
      '<p>This is a <strong>bold</strong> text and a link to <a href="Test Page.html" class="internal-link">Test Page</a>.</p>\n';
    expect(parseMarkdown(markdown).htmlText).toBe(expectedHtml);
  });

  test('should return empty string for empty input', () => {
    expect(parseMarkdown('').htmlText).toBe('');
  });

  test('should handle multiple internal links in one line', () => {
    const markdown = 'Links: [[One]], [[Two|Text Two]], [[Three#Part]].';
    const expectedHtml =
      '<p>Links: <a href="One.html" class="internal-link">One</a>, <a href="Two.html" class="internal-link">Text Two</a>, <a href="Three.html#part" class="internal-link">Three#Part</a>.</p>\n';
    expect(parseMarkdown(markdown).htmlText).toBe(expectedHtml);
  });

  test('フロントマターがあればタイトルを取得できる', () => {
    const markdown = '---\ntitle: Test Page\n---\n\n# h1\n\nhello world';
    const expectedHtml = '\n<h1>h1</h1>\n<p>hello world</p>\n';
    expect(parseMarkdown(markdown).htmlText).toBe(expectedHtml);
    expect(parseMarkdown(markdown).title).toBe('Test Page');
  });

  test('余計なフロントマターがあっても良い', () => {
    const markdown = '---\nhogehoge: Test Page\n---\n\n# h1\n\nhello world';
    const expectedHtml = '\n<h1>h1</h1>\n<p>hello world</p>\n';
    expect(parseMarkdown(markdown).htmlText).toBe(expectedHtml);
    expect(parseMarkdown(markdown).title).toBeUndefined();
  });

  test('HTMLタグはそのまま解釈して良い', () => {
    const markdown = '# Hello World\n\n<strong>bold text</strong>';
    const expectedHtml = '<h1>Hello World</h1>\n<p><strong>bold text</strong></p>\n';
    expect(parseMarkdown(markdown).htmlText).toBe(expectedHtml);
  });
});
