import { readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { singleton } from "tsyringe";
import { v4 } from "uuid";
import { EpubContext } from "../domain/data/EpubContext";
import { ItemSortType } from "../domain/enums/ItemSortType";
import { EpubProject } from "../domain/value/EpubProject";
import { asyncTryOrNothing } from "../util/TryOrNothing";
import { ArchiveService } from "./ArchiveService";
import { ArtworkService } from "./ArtworkService";
import { FileCopyService } from "./FileCopyService";
import { ResourceWriteService } from "./ResourceWriteService";
import { SpineService } from "./SpineService";
import { TocService } from "./TocService";

//TODO 別の処理でも使われてるが
export const WORKING_DIERCTORY_NAME = ".working";

@singleton()
export class CookService {
  constructor(
    private resourceWriteService: ResourceWriteService,
    private fileCopyService: FileCopyService,
    private spineService: SpineService,
    private archiveService: ArchiveService,
    private tocService: TocService,
    private artworkService: ArtworkService,
  ) {}

  /**
   * ブックデータの読み込みを行います。
   *
   * 作業ディレクトリへのファイルのコピーまで行います。作業ディレクトリを丸ごとZIP化すればEPUBになりますが、
   * これは別の処理が担います。
   *
   * @param directory プロジェクトディレクトリ
   * @param project 読み込んだプロジェクト定義
   * @param noPack 圧縮処理をスキップするか
   * @returns
   */
  public async cook(directory: string, project: EpubProject) {
    const context = await this.createContext(directory, project);
    context.loadedItems = await this.fileCopyService.execute(context, project);
    // TODO ItemSortTypeをベタ指定
    context.spineItems = this.spineService.sortItems(context.loadedItems, ItemSortType.STRING);
    await this.tocService.validate(context, project);
    await this.artworkService.validate(context, project);
    await this.resourceWriteService.saveResources(context, project);
    return context;
  }

  /**
   * コンテキストを作成します。
   *
   * EPUB作成のために読み込んだデータや必要な情報は、一旦コンテキストというミュータブルな
   * 入れ物の中に保存します。各処理は、このコンテキストを受け取ったり、コンテキストにデータを書き込んだりして
   * 処理を進めていきます。
   *
   * @param directory プロジェクトディレクトリ
   * @param project 読み込んだプロジェクト定義
   * @returns コンテキスト
   */
  protected async createContext(directory: string, project: EpubProject) {
    const ctx: EpubContext = {
      projectDirectory: directory,
      workingDirectory: resolve(directory, WORKING_DIERCTORY_NAME),
      identifier: await this.identify(directory, project),
      loadedItems: [],
      spineItems: [],
      bookFileName: project.bookMetadata.title,
    };

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
    await writeFile(resolve(directory, "identifier"), uuid);
    return uuid;
  }
}
