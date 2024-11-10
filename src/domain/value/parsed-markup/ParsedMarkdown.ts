import { DOMParser } from "@xmldom/xmldom";
import MarkdownIt from "markdown-it";
import obsidianImages from "markdown-it-obsidian-images";
import { ParsedMarkup } from "./ParsedMarkup";

const domParser = new DOMParser();
const md = MarkdownIt({ html: true }).use(obsidianImages());

type IParsedMarkdown = Readonly<{
  pageTitle: string;
  markdownText: string;
  resolvedCssPath: string | undefined;
}>;

/**
 * ParsedMarkdown.
 *
 * Markdownパーサー。コンストラクタでMarkdownのテキストを受け取ると、内部でMarkdownをパースしてXHTMLに変換してくれる
 * @internal
 */
export class ParsedMarkdown extends ParsedMarkup implements IParsedMarkdown {
  get dom() {
    if (this._dom == null) {
      this._dom = domParser.parseFromString(this.htmlSource, "text/html");
    }
    return this._dom;
  }

  get htmlSource() {
    return `<html xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>${this.pageTitle}</title><meta charset="UTF-8"></head>
<body>
${md.render(this.markdownText)}
</body>
</html>`;
  }

  constructor(
    readonly markdownText: string,
    readonly resolvedCssPath: string | undefined,
    readonly pageTitle: string = "",
  ) {
    super(resolvedCssPath);
  }
}
