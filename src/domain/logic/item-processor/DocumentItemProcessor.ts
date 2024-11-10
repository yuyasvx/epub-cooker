import { join, relative, resolve } from "path";
import { Effect } from "effect";
import { andThen, catchAll, fail, succeed } from "effect/Effect";
import mime from "mime-types";
import { CollectedItem } from "../../../domain/value/CollectedItem";
import { ManifestItem } from "../../../domain/value/ManifestItem";
import * as fileIo from "../../../io/FileIo";
import * as parsedMarkupIo from "../../../io/ParsedMarkupIo";
import { FileIoError, FileNotFoundError } from "../../../io/error/FileIoError";
import { runThrowing } from "../../../util/EffectUtil";
import { changeExtension } from "../../../util/FileExtensionUtil";
import { generateId } from "../../../util/ManifestIdGenerator";
import { ParsedHtml } from "../../value/parsed-markup/ParsedHtml";
import { ParsedMarkdown } from "../../value/parsed-markup/ParsedMarkdown";
import { ItemProcessor } from "./ItemProcessor";

const OPS_DIRECTORY_NAME = "OPS";

export const documentItemProcessor: ItemProcessor = {
  /**
   * アイテムを処理します。
   *
   * - Markdown自動変換が有効な場合は、MarkdownをXHTMLに変換・保存を行います
   * - HTMLファイルはEPUB用のXHTMLに変換・保存を行います
   * - それ以外のファイルはコピーだけを行います
   *
   * @param item 収集したアイテム
   * @param context コンテキスト
   * @returns ManifestItem
   */
  async process(item, context, project): Promise<ManifestItem> {
    //コピー先は .working/OPS ディレクトリ
    const destination = resolve(context.workingDirectory, OPS_DIRECTORY_NAME);

    await createDestinationDirectory(join(destination, item.href));

    if (project.parseMarkdown && item.mediaType === "text/markdown") {
      return await convertMarkdown(item, context.dataSourceDirectory, destination, project.cssPath);
    }
    if (item.mediaType === "text/html") {
      return await convertHtml(item, context.dataSourceDirectory, destination, project.cssPath);
    }
    return await runThrowing(copyOne(item, context.dataSourceDirectory, destination));
  },
};

async function createDestinationDirectory(destination: string) {
  const fileExist = fileIo.getFile(destination).pipe(
    andThen(() => true),
    catchAll((e) => (e instanceof FileNotFoundError ? succeed(false) : fail(e))),
  );

  if (!(await runThrowing(fileExist))) {
    await runThrowing(fileIo.makeDir(resolve(destination, "../")));
  }
}

async function convertMarkdown(
  markdownItem: CollectedItem,
  fromDirectory: string,
  toDirectory: string,
  cssPath?: string,
) {
  const sourceFilePath = resolve(fromDirectory, markdownItem.href);
  const parsed = await runThrowing(
    fileIo
      .getFile(sourceFilePath)
      .pipe(
        andThen(
          (b) => new ParsedMarkdown(b.toString(), cssPath != null ? resolveCssPath(markdownItem, cssPath) : undefined),
        ),
      ),
  );

  const convertedFilePath = changeExtension(markdownItem.href, "xhtml");
  await runThrowing(parsedMarkupIo.save(resolve(toDirectory, convertedFilePath), parsed));

  return {
    href: convertedFilePath,
    id: generateId(markdownItem),
    mediaType: mime.lookup(convertedFilePath) as string,
  };
}

async function convertHtml(htmlItem: CollectedItem, fromDirectory: string, toDirectory: string, cssPath?: string) {
  const sourceFilePath = resolve(fromDirectory, htmlItem.href);
  const parsed = await runThrowing(
    fileIo
      .getFile(sourceFilePath)
      .pipe(
        andThen((b) => new ParsedHtml(b.toString(), cssPath != null ? resolveCssPath(htmlItem, cssPath) : undefined)),
      ),
  );

  const convertedFilePath = changeExtension(htmlItem.href, "xhtml");
  await runThrowing(parsedMarkupIo.save(resolve(toDirectory, convertedFilePath), parsed));

  return {
    href: convertedFilePath,
    id: generateId(htmlItem),
    mediaType: mime.lookup(convertedFilePath) as string,
  };
}

/**
 * 1アイテムに対し、単純なファイルのコピーを行います
 * @param item アイテム
 * @param fromDirectory コピー元
 * @param toDirectory コピー先
 * @returns 非同期
 */
const copyOne = (
  item: CollectedItem,
  fromDirectory: string,
  toDirectory: string,
): Effect.Effect<ManifestItem, FileIoError> =>
  fileIo.copy(resolve(fromDirectory, item.href), resolve(toDirectory, item.href)).pipe(
    andThen(() =>
      succeed({
        href: item.href,
        id: generateId(item),
        mediaType: item.mediaType,
      }),
    ),
    catchAll((err) => {
      console.error(err);
      console.trace();
      return fail(err);
    }),
  );

function resolveCssPath(markdownItem: CollectedItem, cssPath: string) {
  const markdownDir = join(markdownItem.href, "../");
  return relative(markdownDir, cssPath);
}
