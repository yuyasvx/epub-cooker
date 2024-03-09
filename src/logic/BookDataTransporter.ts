import { join, resolve } from "path";
import { copyFile } from "fs/promises";
import { EpubContext } from "../domain/data/EpubContext";
import { DocumentItemLoader } from "../domain/data/ManifestItemLoader";
import { BookType } from "../domain/enums/BookType";
import { EpubProject } from "../domain/value/EpubProject";
import { ManifestItem } from "../domain/value/ManifestItem";
import { convertHtml, convertMarkdown } from "./DocumentPageConverter";
import { createDestinationDirectory } from "./ResourceWriter";

const OPS_DIRECTORY_NAME = "OPS";

const SUPPORTED_DOCUMENTS = [
  "image/jpeg",
  "image/gif",
  "image/png",
  "image/webp",
  "audio/mp4",
  "video/mp4",
  "video/x-m4v",
  "audio/mpeg",
  "audio/wave",
  "audio/x-flac",
  "text/css",
  "application/javascript",
  "application/xhtml+xml",
  "text/html",
  "font/ttf",
  "font/otf",
  "font/woff",
];

/**
 * プロジェクト定義で指定されたディレクトリのファイルを読み込み、作業ディレクトリへのコピーやXHTML変換を行います。
 *
 * @param context コンテキスト
 * @param project プロジェクト定義
 * @returns 読み込んだアイテム
 */
export async function copyBookData(context: EpubContext, project: EpubProject): Promise<ManifestItem[]> {
  // project.ymlの置き場所が/path/to/project、データの置き場所がitem-path/の場合、
  // sourceDirectoryは/path/to/project/item-pathになる
  const sourceDirectory = resolve(context.projectDirectory, project.sourcePath);

  //コピー先は .working/OPS ディレクトリ
  const destination = resolve(context.workingDirectory, OPS_DIRECTORY_NAME);

  if (project.bookType === BookType.DOCUMENT) {
    const items = await collectAsDocumentMode(sourceDirectory, project);

    // 非同期処理が入るので安易にmapとかforEachできない
    const newItems: ManifestItem[] = [];
    for (const itm of items) {
      await createDestinationDirectory(join(destination, itm.href));

      if (project.parseMarkdown && itm.mediaType === "text/markdown") {
        newItems.push(await convertMarkdown(itm, sourceDirectory, destination, project.cssPath));
      } else if (itm.mediaType === "text/html") {
        newItems.push(await convertHtml(itm, sourceDirectory, destination, project.cssPath));
      } else {
        await copyOne(itm, sourceDirectory, destination);
        newItems.push(itm);
      }
    }
    return newItems;
  }

  return [];
}

/**
 * documentモードとしてコピー対象のアイテムを収集します
 * @param sourceDirectory
 * @param project プロジェクト定義
 * @returns
 */
export async function collectAsDocumentMode(sourceDirectory: string, project: EpubProject) {
  // FIXME 面倒なので一旦除外条件が自動の場合だけ、読み込むファイル形式を限定させ、マニュアル指定が入っている場合は何も限定させないことにしている
  let fileTypes = project.exclude === "auto" ? SUPPORTED_DOCUMENTS : undefined;
  if (fileTypes != null && project.parseMarkdown) {
    fileTypes = [...fileTypes, "text/markdown"];
  }

  /*
  TODO DocumentItemLoaderが読み込んだものがManifestItemとして記録され、コピー済みのファイルもManifestItemとして記録されるのが
  混乱ポイントになっている気がする。
  */
  const loader = await DocumentItemLoader.start(
    sourceDirectory,
    fileTypes,
    project.include,
    project.exclude === "auto" ? [] : project.exclude,
  );
  return loader.items;
}

/**
 * 1アイテムに対し、単純なファイルのコピーを行います
 * @param item アイテム
 * @param fromDirectory コピー元
 * @param toDirectory コピー先
 * @returns 非同期
 */
async function copyOne(item: ManifestItem, fromDirectory: string, toDirectory: string) {
  try {
    await copyFile(resolve(fromDirectory, item.href), resolve(toDirectory, item.href));
  } catch (error) {
    console.error(error);
    console.trace();
    throw error;
  }
}
