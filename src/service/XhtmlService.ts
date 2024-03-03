import { readFile } from "node:fs/promises";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import markdownit from "markdown-it";
import obsidianImages from "markdown-it-obsidian-images";
import { singleton } from "tsyringe";
const md = markdownit({ html: true }).use(obsidianImages());
const domParser_ = new DOMParser();
const xmlSerializer_ = new XMLSerializer();

@singleton()
export class XhtmlService {
  protected domParser: DOMParser = domParser_;
  protected xmlSerializer: XMLSerializer = xmlSerializer_;

  public async parseMarkdown(filePath: string) {
    const rawText = (await readFile(filePath)).toString();
    const htmlText = this.markdownToHtml(rawText);
    return this.getDom(htmlText);
  }

  public markdownToHtml(markdownText: string, title = "") {
    return `<html xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>${title}</title><meta charset="UTF-8"></head>
<body>
${md.render(markdownText)}
</body>
</html>`;
  }

  public toXhtmlString(dom: Document) {
    return `<?xml version="1.0" encoding="UTF-8"?>${this.xmlSerializer.serializeToString(dom)}`;
  }

  public getDom(htmlText: string) {
    return this.domParser.parseFromString(htmlText, "text/html");
  }

  public addCssLink(dom: Document, resolvedCssPath: string) {
    const linkTag = dom.createElement("link");
    linkTag.setAttribute("rel", "stylesheet");
    linkTag.setAttribute("href", resolvedCssPath);

    const headTag = dom.getElementsByTagName("head").item(0);
    if (headTag != null) {
      headTag.appendChild(linkTag);
    }
  }
}
