import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { singleton } from "tsyringe";
import { v4 } from "uuid";
import { EpubProject } from "../domain/value/EpubProject";
import { asyncTryOrNothing } from "../util/TryOrNothing";
import { ContainerXml } from "../xml-resource/ContainerXml";
import { IBooksDisplayOptionsXml } from "../xml-resource/IBooksDisplayOptionsXml";
import { PackageOpfXml } from "../xml-resource/PackageOpfXml";
import { ResourceWriteService } from "./ResourceWriteService";

const WORKING_DIERCTORY_NAME = ".working";

@singleton()
export class CookService {
  constructor(private resourceWriteService: ResourceWriteService) {}

  public async cook(directory: string, project: EpubProject) {
    const workingDir = resolve(directory, WORKING_DIERCTORY_NAME);
    const identifier = await this.identify(directory, project);

    const containerXml = new ContainerXml();
    const displayOptionsXml = new IBooksDisplayOptionsXml();
    displayOptionsXml.setSpecifiedFonts(project.useSpecifiedFonts);
    const packageOpf = PackageOpfXml.of(project, identifier);

    return Promise.all([
      this.resourceWriteService.save(workingDir, containerXml),
      this.resourceWriteService.save(workingDir, displayOptionsXml),
      this.resourceWriteService.save(workingDir, packageOpf),
    ]);
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
  public async identify(directory: string, project: EpubProject) {
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
