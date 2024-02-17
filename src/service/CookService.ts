import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { singleton } from "tsyringe";
import { v4 } from "uuid";
import { EpubContext } from "../domain/data/EpubContext";
import { ItemSortType } from "../domain/enums/ItemSortType";
import { EpubProject } from "../domain/value/EpubProject";
import { asyncTryOrNothing } from "../util/TryOrNothing";
import { ContainerXml } from "../xml-resource/ContainerXml";
import { IBooksDisplayOptionsXml } from "../xml-resource/IBooksDisplayOptionsXml";
import { PackageOpfXml } from "../xml-resource/PackageOpfXml";
import { ArchiveService } from "./ArchiveService";
import { FileCopyService } from "./FileCopyService";
import { ResourceWriteService } from "./ResourceWriteService";
import { SpineService } from "./SpineService";
import { TocService } from "./TocService";

const WORKING_DIERCTORY_NAME = ".working";

@singleton()
export class CookService {
  constructor(
    private resourceWriteService: ResourceWriteService,
    private fileCopyService: FileCopyService,
    private spineService: SpineService,
    private archiveService: ArchiveService,
    private tocService: TocService,
  ) {}

  public async cook(directory: string, project: EpubProject) {
    const context = await this.createContext(directory, project);
    await this.tocService.validate(context, project);
    await this.resourceWriteService.saveResource(context, project);
    return this.archiveService.makeEpubArchive(
      context.workingDirecotry,
      context.projectDirectory,
      project.bookMetadata.title,
    );
  }

  protected async createContext(directory: string, project: EpubProject) {
    const ctx: EpubContext = {
      projectDirectory: directory,
      workingDirecotry: resolve(directory, WORKING_DIERCTORY_NAME),
      identifier: await this.identify(directory, project),
      loadedItems: [],
      spineItems: [],
    };
    ctx.loadedItems = await this.fileCopyService.loadAndCopy(ctx.projectDirectory, ctx.workingDirecotry, project);
    // TODO ItemSortTypeをベタ指定
    ctx.spineItems = this.spineService.sortItems(ctx.loadedItems, ItemSortType.STRING);

    return ctx;
  }

  /**
   * ブックのIDを決定します。
   *
   * プロジェクト定義に`identifier`プロパティがあれば、それをそのままブックのIDにします。
   * 無ければ、プロジェクトディレクトリの`identifier`ファイルの内容を読み込み、それをブックのIDにします。
   * それも無ければ、uuidを生成し、`identifier`ファイルとして保存してから、それをブックのIDにします。
   *
   * ※実はCookService内のメソッドから独立させた方が良いかもと思っている。
   *
   * @param directory プロジェクトディレクトリ
   * @param project プロジェクト定義
   * @returns ブックのID
   */
  protected async identify(directory: string, project: EpubProject) {
    const projectIdentifier = project.identifier;
    if (projectIdentifier != null) {
      return projectIdentifier;
    }
    const readIdentifier = await asyncTryOrNothing(() =>
      readFile(resolve(directory, "identifier")).then((file) => file.toString()),
    );
    if (readIdentifier != null) {
      return readIdentifier;
    }

    const uuid = `urn:uuid:${v4()}`;
    writeFile(resolve(directory, "identifier"), uuid);
    return uuid;
  }

  public async removeWorkingDirectory(directory: string) {
    // rm(resolve(directory, WORKING_DIERCTORY_NAME), { recursive: true });
  }
}
