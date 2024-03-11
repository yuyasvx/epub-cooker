import { resolve } from "path";
import mime from "mime-types";
import { BookContext } from "../domain/data/EpubContext";
import { ManifestItem } from "../domain/value/ManifestItem";
import { getDom, toXhtmlString } from "../util/DomUtil";
import { generateId } from "../util/ManifestIdGenerator";
import { saveTextFile } from "../writer/TextFileWriter";
import { markdownToHtml } from "./DocumentPageConverter";

export async function processToc(context: BookContext) {
  const { project } = context;
  const filePath = project.tocPath;

  if (filePath == null) {
    const tocItem = await handleNoTocDefinitionError(context.workingDirectory, undefined);
    context.loadedItems.push(tocItem);
    return;
  }

  const targetToc = context.loadedItems.find((itm) => itm.href === filePath);

  if (targetToc == null) {
    const tocItem = await handleNoTocDefinitionError(context.workingDirectory, filePath);
    context.loadedItems.push(tocItem);
    return;
  }
  context.loadedItems = context.loadedItems.filter((itm) => itm.href !== filePath);
  context.loadedItems.push({
    properties: "nav",
    ...targetToc,
  });
}

async function handleNoTocDefinitionError(
  workingDirecotry: string,
  filePath: string | undefined,
): Promise<ManifestItem> {
  if (filePath != null) {
    console.log(`目次ファイル(${filePath})が見つかりませんでした。`);
  }
  if (filePath == null) {
    console.log("目次が定義されていません。");
  }
  const emptyHtml = markdownToHtml(`<nav epub:type="toc" id="toc" />`);

  // TODO 悲しいベタ書き
  const fullPath = resolve(workingDirecotry, "OPS/toc.xhtml");
  await saveTextFile(toXhtmlString(getDom(emptyHtml)), fullPath);
  return {
    href: "toc.xhtml",
    id: generateId("toc.xhtml"),
    mediaType: mime.lookup("toc.xhtml") as string,
    properties: "nav",
  };
}
