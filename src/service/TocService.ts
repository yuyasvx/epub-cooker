import { resolve } from "path";
import mime from "mime-types";
import { singleton } from "tsyringe";
import { EpubContext } from "../domain/data/EpubContext";
import { EpubProject } from "../domain/value/EpubProject";
import { ManifestItem } from "../domain/value/ManifestItem";
import { ResourceWriteService } from "./ResourceWriteService";
import { XhtmlService } from "./XhtmlService";

@singleton()
export class TocService {
  constructor(
    private xhtmlService: XhtmlService,
    private resourceWriteService: ResourceWriteService,
  ) {}
  /**
   * 目次として使うXHTMLファイルが存在することを確認します。
   *
   * - 確認できた場合は、該当のManifestItem.propertiesに`nav`を書き込みます。
   * - 確認できなかった場合は、空のXHTMLファイルを"toc.xhtml"として保存し、それを目次として使用します。
   *
   * @param context コンテキスト
   * @param project プロジェクト定義
   */
  public async validate(context: EpubContext, project: EpubProject) {
    const filePath = project.tocFilePath;

    if (filePath == null) {
      const tocItem = await this.handleNoTocDefinitionError(context.workingDirectory, undefined);
      context.loadedItems.push(tocItem);
      return;
    }

    const targetToc = context.loadedItems.find((itm) => itm.href === filePath);

    if (targetToc == null) {
      const tocItem = await this.handleNoTocDefinitionError(context.workingDirectory, filePath);
      context.loadedItems.push(tocItem);
      return;
    }
    context.loadedItems = context.loadedItems.filter((itm) => itm.href !== filePath);
    context.loadedItems.push({
      properties: "nav",
      ...targetToc,
    });
  }

  protected async handleNoTocDefinitionError(
    workingDirecotry: string,
    filePath: string | undefined,
  ): Promise<ManifestItem> {
    if (filePath != null) {
      console.log(`目次ファイル(${filePath})が見つかりませんでした。`);
    }
    if (filePath == null) {
      console.log("目次が定義されていません。");
    }
    const emptyHtml = this.xhtmlService.markdownToHtml(`<nav epub:type="toc" id="toc" />`);

    // TODO 悲しいベタ書き
    const fullPath = resolve(workingDirecotry, "OPS/toc.xhtml");
    await this.resourceWriteService.saveTextFile(
      this.xhtmlService.toXhtmlString(this.xhtmlService.getDom(emptyHtml)),
      fullPath,
    );
    return {
      // TODO DRY
      href: "toc.xhtml",
      id: "toc_xhtml",
      mediaType: mime.lookup("toc.xhtml") as string,
      properties: "nav",
    };
  }
}
