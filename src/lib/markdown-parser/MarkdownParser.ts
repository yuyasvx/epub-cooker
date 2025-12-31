import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import markdownItFrontMatter from 'markdown-it-front-matter';
import type { InputFileDetail } from '../../value/InputFileDetail';
import type { ResolvedPath } from '../../value/ResolvedPath';
import { obsidianEmbedImage } from './plugins/ObsidianEmbedImage';
import { obsidianInternalLinks } from './plugins/ObsidianLink';
import type { ParsedMarkdown } from './value/ParsedMarkdown';

// MarkdownItのインスタンスをシングルトンとして作成し、プラグインを適用
let md = new MarkdownIt({ xhtmlOut: true, html: true });
md.use(obsidianInternalLinks);
md.use(obsidianEmbedImage);
md.use(markdownItFrontMatter, () => {});

/**
 * @internal
 */
export const context = {
  files: [] as InputFileDetail[],
  currentFilePath: undefined as ResolvedPath | undefined,
};

/**
 * @internal
 */
export function initializeParser(inputFiles: InputFileDetail[]) {
  context.files = inputFiles;
  md = new MarkdownIt({ xhtmlOut: true, html: true });
  md.use(obsidianInternalLinks);
  md.use(obsidianEmbedImage);
  md.use(markdownItFrontMatter, () => {});
}

/**
 * Markdown文字列をHTMLにパースします。
 * Obsidianの内部リンク記法（[[記事名]]など）をHTMLの<a>タグに変換します。
 *
 * @param {string} markdownStr - パースするMarkdown文字列
 * @returns  変換されたHTML文字列
 * @internal
 */
export function parseMarkdown(markdownStr: string, markdownFilePath: ResolvedPath): ParsedMarkdown {
  if (!markdownStr) {
    return {
      htmlText: '',
    };
  }
  context.currentFilePath = markdownFilePath;

  return {
    htmlText: md.render(markdownStr),
    title: parseFrontMatter(markdownStr).data.title,
    cssPath: parseFrontMatter(markdownStr).data.css,
  } satisfies ParsedMarkdown;
}

function parseFrontMatter(markdownStr: string) {
  return matter(markdownStr);
}
