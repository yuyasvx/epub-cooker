import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import markdownItFrontMatter from 'markdown-it-front-matter';
import { obsidianInternalLinks } from './plugins/ObsidianLink';
import type { ParsedMarkdown } from './value/ParsedMarkdown';

// MarkdownItのインスタンスをシングルトンとして作成し、プラグインを適用
const md = new MarkdownIt({ xhtmlOut: true, html: true });
md.use(obsidianInternalLinks);
md.use(markdownItFrontMatter, () => {});

/**
 * Markdown文字列をHTMLにパースします。
 * Obsidianの内部リンク記法（[[記事名]]など）をHTMLの<a>タグに変換します。
 *
 * @param {string} markdownStr - パースするMarkdown文字列
 * @returns  変換されたHTML文字列
 * @internal
 */
export function parseMarkdown(markdownStr: string): ParsedMarkdown {
  if (!markdownStr) {
    return {
      htmlText: '',
    };
  }

  return {
    htmlText: md.render(markdownStr),
    title: parseFrontMatter(markdownStr).data.title,
    cssPath: parseFrontMatter(markdownStr).data.css,
  } satisfies ParsedMarkdown;
}

function parseFrontMatter(markdownStr: string) {
  return matter(markdownStr);
}
