import { describe, expect, test } from 'vitest';
import { resolvePath } from '../../value/ResolvedPath';
import { initializeParser, parseMarkdown } from './MarkdownParser';

describe('MarkdownParser', () => {
  const dummyPath = resolvePath('/test/path.md');

  // テストごとにParserを初期化（副作用を防ぐため）
  initializeParser([]);

  test('Front MatterからタイトルとCSSパスを抽出できる', () => {
    const markdown = `---
title: テストタイトル
css: style.css
---
# 本文`;
    const result = parseMarkdown(markdown, dummyPath);
    expect(result.title).toBe('テストタイトル');
    expect(result.cssPath).toBe('style.css');
    // Front Matter自体はHTML出力に含まれないこと
    expect(result.htmlText).not.toContain('title: テストタイトル');
    expect(result.htmlText).toContain('<h1>本文</h1>');
  });

  test('Front Matterがない場合はメタデータがundefinedになる', () => {
    const markdown = '# 本文のみ';
    const result = parseMarkdown(markdown, dummyPath);
    expect(result.title).toBeUndefined();
    expect(result.cssPath).toBeUndefined();
    expect(result.htmlText).toContain('<h1>本文のみ</h1>');
  });

  test('基本的なMarkdownがHTMLに変換される', () => {
    const markdown = '**太字**と*イタリック*';
    const result = parseMarkdown(markdown, dummyPath);
    expect(result.htmlText).toContain('<strong>太字</strong>');
    expect(result.htmlText).toContain('<em>イタリック</em>');
  });

  test('XHTML準拠のタグが出力される', () => {
    // markdown-itのxhtmlOut: trueオプションの確認
    // 末尾にスペース2つで改行 -> <br />
    const markdown = '行1  \n行2';
    const result = parseMarkdown(markdown, dummyPath);
    expect(result.htmlText).toContain('<br />');
    
    // 水平線 -> <hr />
    // 先頭が --- だとFront Matterの開始と誤認される可能性があるため、テキストの後に配置
    const markdownHr = 'text\n\n---';
    const resultHr = parseMarkdown(markdownHr, dummyPath);
    expect(resultHr.htmlText).toContain('<hr />');
  });

  test('空文字列の場合は空の結果を返す', () => {
    const result = parseMarkdown('', dummyPath);
    expect(result.htmlText).toBe('');
    expect(result.title).toBeUndefined();
  });
});
