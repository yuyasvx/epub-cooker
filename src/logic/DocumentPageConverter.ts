import { join, relative, resolve } from "path";
import { readFile, writeFile } from "fs/promises";
import MarkdownIt from "markdown-it";
import obsidianImages from "markdown-it-obsidian-images";
import mime from "mime-types";
import { ManifestItem } from "../domain/value/ManifestItem";
import { addCssLink, getDom, toXhtmlString } from "../util/DomUtil";
import { changeExtension } from "../util/FileExtensionUtil";

const md = MarkdownIt({ html: true }).use(obsidianImages());

/**
 * Markdownとして読み込んだアイテムをXHTMLに変換して保存します。
 *
 * @param markdownItem Markdownとして読み込んだアイテム
 * @param fromDirectory 読み込み元
 * @param toDirectory 保存先
 * @param cssPath CSSの相対パス
 * @returns 変換後のアイテム
 */
export async function convertMarkdown(
  markdownItem: ManifestItem,
  fromDirectory: string,
  toDirectory: string,
  cssPath?: string,
) {
  const fromFullPath = resolve(fromDirectory, markdownItem.href);
  const dom = await parseMarkdown(fromFullPath);
  if (cssPath != null) {
    addCssLink(dom, resolveCssPath(markdownItem, cssPath));
  }
  const convertedFilePath = changeExtension(markdownItem.href, "xhtml");
  await writeFile(resolve(toDirectory, convertedFilePath), toXhtmlString(dom));

  return {
    href: convertedFilePath,
    id: markdownItem.id,
    mediaType: mime.lookup(convertedFilePath) as string,
  };
}

export async function convertHtml(
  htmlItem: ManifestItem,
  fromDirectory: string,
  toDirectory: string,
  cssPath?: string,
) {
  const fromFullPath = resolve(fromDirectory, htmlItem.href);
  const dom = await parseHtml(fromFullPath);
  if (cssPath != null) {
    addCssLink(dom, resolveCssPath(htmlItem, cssPath));
  }

  const convertedFilePath = changeExtension(htmlItem.href, "xhtml");
  await writeFile(resolve(toDirectory, convertedFilePath), toXhtmlString(dom));

  return {
    href: convertedFilePath,
    id: htmlItem.id,
    mediaType: mime.lookup(convertedFilePath) as string,
  };
}

export function resolveCssPath(markdownItem: ManifestItem, cssPath: string) {
  const markdownDir = join(markdownItem.href, "../");
  return relative(markdownDir, cssPath);
}

export function markdownToHtml(markdownText: string, title = "") {
  return `<html xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>${title}</title><meta charset="UTF-8"></head>
<body>
${md.render(markdownText)}
</body>
</html>`;
}

async function parseMarkdown(filePath: string) {
  const rawText = (await readFile(filePath)).toString();
  const htmlText = markdownToHtml(rawText);
  return getDom(htmlText);
}

async function parseHtml(filePath: string) {
  const rawText = (await readFile(filePath)).toString();
  const dom = getDom(rawText);
  dom.getElementsByTagName("html")[0].setAttribute("xmlns:epub", "http://www.idpf.org/2007/ops");
  return dom;
}
