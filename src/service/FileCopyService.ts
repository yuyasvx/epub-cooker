import { join, relative, resolve } from "path";
import { copyFile, writeFile } from "fs/promises";
import mime from "mime-types";
import { singleton } from "tsyringe";
import { EpubContext } from "../domain/data/EpubContext";
import { DocumentItemLoader } from "../domain/data/ManifestItemLoader";
import { PageType } from "../domain/enums/PageType";
import { EpubProject } from "../domain/value/EpubProject";
import { ManifestItem } from "../domain/value/ManifestItem";
import { ResourceWriteService } from "./ResourceWriteService";
import { XhtmlService } from "./XhtmlService";

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

@singleton()
export class FileCopyService {
  constructor(
    private resourceWriteService: ResourceWriteService,
    private xhtmlService: XhtmlService,
  ) {}

  /**
   * プロジェクト定義で指定されたディレクトリのファイルを読み込み、作業ディレクトリへのコピーやXHTML変換を行います。
   *
   * @param context コンテキスト
   * @param project プロジェクト定義
   * @returns 読み込んだアイテム
   */
  public async execute(context: EpubContext, project: EpubProject): Promise<ManifestItem[]> {
    // project.ymlの置き場所が/path/to/project、データの置き場所がitem-path/の場合、
    // sourceDirectoryは/path/to/project/item-pathになる
    const sourceDirectory = resolve(context.projectDirectory, project.sourcePath);

    //コピー先は .working/OPS ディレクトリ
    const destination = resolve(context.workingDirectory, OPS_DIRECTORY_NAME);

    if (project.pageType === PageType.DOCUMENT) {
      const items = await this.loadAsDocumentMode(sourceDirectory, project);

      // 非同期処理が入るので安易にmapとかforEachできない
      const newItems: ManifestItem[] = [];
      for (const itm of items) {
        await this.resourceWriteService.createDestinationDirectory(join(destination, itm.href));

        if (project.parseMarkdown && itm.mediaType === "text/markdown") {
          newItems.push(await this.convertMarkdown(itm, sourceDirectory, destination, project.cssPath));
        } else if (itm.mediaType === "text/html") {
          // TODO ここにHTML→XHTML変換処理を追加する
          newItems.push(itm);
        } else {
          await this.copyOne(itm, sourceDirectory, destination);
          newItems.push(itm);
        }
      }
      return newItems;
    }

    return [];
  }

  /**
   * documentモードとしてコピー対象のアイテムを収集します
   */
  protected async loadAsDocumentMode(sourceDirectory: string, project: EpubProject) {
    let fileTypes = project.autoExclusion ? SUPPORTED_DOCUMENTS : undefined;
    if (fileTypes != null && project.parseMarkdown) {
      fileTypes = [...fileTypes, "text/markdown"];
    }

    /*
    TODO DocumentItemLoaderが読み込んだものがManifestItemとして記録され、コピー済みのファイルもManifestItemとして記録されるのが
    混乱ポイントになっている気がする。
    */
    const loader = await DocumentItemLoader.start(sourceDirectory, fileTypes, [], []);
    return loader.items;
  }

  /**
   * 1アイテムに対し、単純なファイルのコピーを行います
   * @param item アイテム
   * @param fromDirectory コピー元
   * @param toDirectory コピー先
   * @returns 非同期
   */
  protected async copyOne(item: ManifestItem, fromDirectory: string, toDirectory: string) {
    try {
      await copyFile(resolve(fromDirectory, item.href), resolve(toDirectory, item.href));
    } catch (error) {
      console.error(error);
      console.trace();
      throw error;
    }
  }

  /**
   * Markdownとして読み込んだアイテムをXHTMLに変換して保存します。
   *
   * @param markdownItem Markdownとして読み込んだアイテム
   * @param fromDirectory 読み込み元
   * @param toDirectory 保存先
   * @param cssPath CSSの相対パス
   * @returns 変換後のアイテム
   */
  protected async convertMarkdown(
    markdownItem: ManifestItem,
    fromDirectory: string,
    toDirectory: string,
    cssPath?: string,
  ) {
    const fromFullPath = resolve(fromDirectory, markdownItem.href);
    const dom = await this.xhtmlService.parseMarkdown(fromFullPath);
    if (cssPath != null) {
      this.xhtmlService.addCssLink(dom, this.resolveCssPath(markdownItem, cssPath));
    }
    const convertedFilePath = this.changeExtension(markdownItem.href, "xhtml");
    await writeFile(resolve(toDirectory, convertedFilePath), this.xhtmlService.toXhtmlString(dom));

    return {
      href: convertedFilePath,
      id: markdownItem.id,
      mediaType: mime.lookup(convertedFilePath) as string,
    };
  }

  protected resolveCssPath(markdownItem: ManifestItem, cssPath: string) {
    const markdownDir = join(markdownItem.href, "../");
    return relative(markdownDir, cssPath);
  }

  protected changeExtension(fullPath: string, toExtension: string) {
    const tokens = fullPath.split(".");
    if (tokens.length === 0) {
      return fullPath;
    }
    if (tokens.length === 1) {
      return `${fullPath}.${toExtension}`;
    }
    tokens.pop();
    tokens.push(toExtension);
    return tokens.join(".");
  }
}
