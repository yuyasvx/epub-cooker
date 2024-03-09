import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();

export function getDom(htmlText: string) {
  return domParser.parseFromString(htmlText, "text/html");
}

export function toXhtmlString(dom: Document) {
  return `<?xml version="1.0" encoding="UTF-8"?>${xmlSerializer.serializeToString(dom)}`;
}

export function addCssLink(dom: Document, resolvedCssPath: string) {
  const linkTag = dom.createElement("link");
  linkTag.setAttribute("rel", "stylesheet");
  linkTag.setAttribute("href", resolvedCssPath);

  const headTag = dom.getElementsByTagName("head").item(0);
  if (headTag != null) {
    headTag.appendChild(linkTag);
  }
}
