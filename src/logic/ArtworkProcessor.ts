import { BookContext } from "../domain/data/EpubContext";

export function processArtwork(context: BookContext) {
  const project = context.project;
  const filePath = project.coverImagePath;

  if (filePath == null) {
    handleNoCoverImageError(undefined);
    return;
  }

  const targetToc = context.loadedItems.find((itm) => itm.href === filePath);

  if (targetToc == null) {
    handleNoCoverImageError(filePath);
    return;
  }
  context.loadedItems = context.loadedItems.filter((itm) => itm.href !== filePath);
  context.loadedItems.push({
    properties: "cover-image",
    ...targetToc,
  });
}

function handleNoCoverImageError(filePath: string | undefined) {
  if (filePath != null) {
    console.log(`カバー画像ファイル(${filePath})が見つかりませんでした。`);
  }
  if (filePath == null) {
    console.log("カバー画像が定義されていません。");
  }
}
