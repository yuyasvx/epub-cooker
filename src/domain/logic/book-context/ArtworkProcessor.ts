import { MessageLevelType } from "../../../cli/enums/MessageLevelType";
import { cliMessage } from "../../../cli/logic/CliMessageDispatcher";
import { newMessage } from "../../../cli/value/Message";
import { BookContext } from "../../../domain/data/BookContext";

export function processArtwork(context: BookContext, coverImagePath: string | undefined) {
  if (coverImagePath == null) {
    handleNoCoverImage(undefined);
    return context.loadedItems;
  }

  const targetToc = context.loadedItems.find((itm) => itm.href === coverImagePath);

  if (targetToc == null) {
    handleNoCoverImage(coverImagePath);
    return context.loadedItems;
  }
  const newLoadedItems = context.loadedItems.filter((itm) => itm.href !== coverImagePath);
  newLoadedItems.push({
    properties: "cover-image",
    ...targetToc,
  });
  return newLoadedItems;
}

function handleNoCoverImage(filePath: string | undefined) {
  if (filePath != null) {
    cliMessage.put(newMessage(`カバー画像ファイル(${filePath})が見つかりませんでした。`, MessageLevelType.WARN));
  }
  if (filePath == null) {
    cliMessage.put(newMessage("カバー画像が定義されていません。", MessageLevelType.WARN));
  }
}
