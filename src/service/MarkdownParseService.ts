import { readFile } from "node:fs/promises";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import markdownit from "markdown-it";
import obsidianImages from "markdown-it-obsidian-images";
import { singleton } from "tsyringe";
const md = markdownit({ html: true }).use(obsidianImages({ htmlAttributes: { class: "inserted-image" } }));
const domParser_ = new DOMParser();
const xmlSerializer_ = new XMLSerializer();

@singleton()
export class MarkdownParseService {
  protected domParser: DOMParser = domParser_;
  protected xmlSerializer: XMLSerializer = xmlSerializer_;

  public async parseFile(filePath: string) {
    const rawText = (await readFile(filePath)).toString();
    const htmlText = this.markdownToHtml(rawText);
    return this.htmlToXhtml(htmlText);
  }

  public markdownToHtml(markdownText: string, title = "") {
    return `<html xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>${title}</title><meta charset="UTF-8"></head>
<body>
${md.render(markdownText)}
</body>
</html>`;
  }

  public htmlToXhtml(htmlText: string) {
    const parsedData = this.domParser.parseFromString(htmlText, "text/html");
    return `<?xml version="1.0" encoding="UTF-8"?>${this.xmlSerializer.serializeToString(parsedData)}`;
  }
}
