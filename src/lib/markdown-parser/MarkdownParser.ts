import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import markdownItFrontMatter from 'markdown-it-front-matter';
import type { InputFileDetail } from '../../value/InputFileDetail';
import type { ResolvedPath } from '../../value/ResolvedPath';
import { obsidianEmbedImage } from './plugins/ObsidianEmbedImage';
import { obsidianInternalLinks } from './plugins/ObsidianLink';
import type { ParsedMarkdown } from './value/ParsedMarkdown';

/** @internal */
export class MarkdownParser {
  private readonly parser: MarkdownIt;
  constructor(private files: InputFileDetail[] = []) {
    this.parser = new MarkdownIt({ xhtmlOut: true, html: true });
    this.parser.use(obsidianInternalLinks, { files: this.files });
    this.parser.use(obsidianEmbedImage, { files: this.files });
    this.parser.use(markdownItFrontMatter, () => {});
  }

  parseMarkdown(markdownStr: string, markdownFilePath: ResolvedPath): ParsedMarkdown {
    if (!markdownStr) {
      return {
        htmlText: '',
      };
    }
    return {
      htmlText: this.parser.render(markdownStr, {
        currentFilePath: markdownFilePath,
      }),
      title: this.parseFrontMatter(markdownStr).data.title,
      cssPath: this.parseFrontMatter(markdownStr).data.css,
    } satisfies ParsedMarkdown;
  }

  private parseFrontMatter(markdownStr: string) {
    return matter(markdownStr);
  }
}
