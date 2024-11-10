import { resolve } from "path";
import mime from "mime-types";
import { BookContext } from "../../../domain/data/BookContext";
import { ManifestItem } from "../../../domain/value/ManifestItem";
import * as pageMarkupIo from "../../../io/ParsedMarkupIo";
import { runThrowing } from "../../../util/EffectUtil";
import { generateId } from "../../../util/ManifestIdGenerator";
import { ParsedMarkdown } from "../../value/parsed-markup/ParsedMarkdown";

/**
 * 目次用XHTMLファイルの処理を行います。
 *
 * - プロジェクト定義のtocPathで指定されたXHTMLファイルが、すでに読み込まれていることが前提です。
 * - プロジェクト定義でtocPathが指定されていない場合は、中身の無い目次用XHTMLファイルを作成し、読み込み済みアイテムとして記録します。
 * - tocPathのXHTMLファイルが読み込まれていない場合も、tocPathが指定されていない時と同じ対応をとります。
 *   ※目次が定義されていないEPUBは不正なEPUBであり、エラーの原因になるため
 * @param context
 * @param tocPath
 * @returns
 */
export async function processToc(context: BookContext, tocPath: string | undefined) {
  if (tocPath == null) {
    const tocItem = await handleNoTocDefinition(context.workingDirectory, undefined);
    const newloadedItems = [...context.loadedItems];
    newloadedItems.push(tocItem);
    return newloadedItems;
  }

  const targetToc = context.loadedItems.find((itm) => itm.href === tocPath);

  if (targetToc == null) {
    const tocItem = await handleNoTocDefinition(context.workingDirectory, tocPath);
    const newloadedItems = [...context.loadedItems];
    newloadedItems.push(tocItem);
    return newloadedItems;
  }
  const newloadedItems = context.loadedItems.filter((itm) => itm.href !== tocPath);
  newloadedItems.push({
    properties: "nav",
    ...targetToc,
  });

  return newloadedItems;
}

async function handleNoTocDefinition(workingDirecotry: string, filePath: string | undefined) {
  if (filePath != null) {
    console.log(`目次ファイル(${filePath})が見つかりませんでした。`);
  }
  if (filePath == null) {
    console.log("目次が定義されていません。");
  }
  // ParsedMarkdownはMarkdownのParserとしての用途なのでハック的な使い方をしている
  const emptyHtml = new ParsedMarkdown(`<nav epub:type="toc" id="toc" />`, undefined);

  // TODO 悲しいベタ書き
  const fullPath = resolve(workingDirecotry, "OPS/toc.xhtml");
  await runThrowing(pageMarkupIo.save(fullPath, emptyHtml));
  return {
    href: "toc.xhtml",
    id: generateId("toc.xhtml"),
    mediaType: mime.lookup("toc.xhtml") as string,
    properties: "nav",
  } satisfies ManifestItem;
}
