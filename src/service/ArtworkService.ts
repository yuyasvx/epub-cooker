import { singleton } from "tsyringe";
import { EpubContext } from "../domain/data/EpubContext";
import { EpubProject } from "../domain/value/EpubProject";

@singleton()
export class ArtworkService {
  public async validate(context: EpubContext, project: EpubProject) {
    const filePath = project.coverImagePath;

    if (filePath == null) {
      this.handleNoCoverImageError(undefined);
      return;
    }

    const targetToc = context.loadedItems.find((itm) => itm.href === filePath);

    if (targetToc == null) {
      this.handleNoCoverImageError(filePath);
      return;
    }
    context.loadedItems = context.loadedItems.filter((itm) => itm.href !== filePath);
    context.loadedItems.push({
      properties: "cover-image",
      ...targetToc,
    });
  }

  protected handleNoCoverImageError(filePath: string | undefined) {
    if (filePath != null) {
      console.log(`カバー画像ファイル(${filePath})が見つかりませんでした。`);
    }
    if (filePath == null) {
      console.log("カバー画像が定義されていません。");
    }
  }
}
