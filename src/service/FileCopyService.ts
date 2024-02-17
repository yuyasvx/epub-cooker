import { resolve } from "path";
import { copyFile, writeFile } from "fs/promises";
import mime from "mime-types";
import { singleton } from "tsyringe";
import { DocumentItemLoader } from "../domain/data/ManifestItemLoader";
import { PageType } from "../domain/enums/PageType";
import { EpubProject } from "../domain/value/EpubProject";
import { ManifestItem } from "../domain/value/ManifestItem";
import { MarkdownParseService } from "./MarkdownParseService";
import { ResourceWriteService } from "./ResourceWriteService";

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
    private markdownParseService: MarkdownParseService,
  ) {}
  /**
   * アイテムの読み込みとコピーを行います。
   *
   * @param directory プロジェクトディレクトリ
   * @param workingDirectory 作業ィレクトリ(.workingを想定)
   * @param project プロジェクト定義
   * @param packageOpf Package.opfの元になるやつ（Modifyします）
   * @returns 更新済みのpackageOpf
   */
  public async loadAndCopy(directory: string, workingDirectory: string, project: EpubProject) {
    const sourceDirectory = resolve(directory, project.sourcePath);
    const destination = resolve(workingDirectory, OPS_DIRECTORY_NAME);
    const newItems: ManifestItem[] = [];

    if (project.pageType === PageType.DOCUMENT) {
      const items = await this.loadAsDocumentMode(sourceDirectory, project);

      // 非同期処理が入るので安易にmapとかforEachできない
      for (const itm of items) {
        const newItem = await this.doCopy(sourceDirectory, itm, destination, project.parseMarkdown);
        newItems.push(newItem);
      }
    }

    return newItems;
  }

  /**
   * documentモードとしてコピー対象のアイテムを収集します
   */
  protected async loadAsDocumentMode(sourceDirectory: string, project: EpubProject) {
    let fileTypes = project.autoExclusion ? SUPPORTED_DOCUMENTS : undefined;
    if (fileTypes != null && project.parseMarkdown) {
      fileTypes = [...fileTypes, "text/markdown"];
    }

    const loader = await DocumentItemLoader.start(sourceDirectory, fileTypes, [], []);
    return loader.items;
  }

  protected async doCopy(
    rootDirectory: string,
    item: ManifestItem,
    destinationRootDirectory: string,
    parseMarkdown: boolean,
  ) {
    const dest = resolve(destinationRootDirectory, item.href);
    // TODO Tryすること
    await this.resourceWriteService.createDestinationDirectory(dest);
    if (parseMarkdown && item.mediaType === "text/markdown") {
      const text = await this.markdownParseService.parseFile(resolve(rootDirectory, item.href));
      const newFileName = this.changeExtension(item.href, "xhtml");
      await writeFile(resolve(destinationRootDirectory, newFileName), text);

      return {
        href: newFileName,
        id: item.id,
        mediaType: mime.lookup(newFileName) as string,
      };
    }
    await copyFile(resolve(rootDirectory, item.href), resolve(destinationRootDirectory, item.href));
    return item;
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
