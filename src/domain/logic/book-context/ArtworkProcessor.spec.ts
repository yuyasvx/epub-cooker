import { parseISO } from "date-fns";
import { MessageLevelType } from "../../../cli/enums/MessageLevelType";
import { cliMessage } from "../../../cli/logic/CliMessageDispatcher";
import { newMessage } from "../../../cli/value/Message";
import { BookContext } from "../../data/BookContext";
import { ManifestItem } from "../../value/ManifestItem";
import { processArtwork } from "./ArtworkProcessor";

const now = parseISO("2024-01-01");

describe("ArtworkProcessor", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("指定されたcoverImagePathに該当するマニフェストアイテムが見つかった場合は、そのアイテムをアートワークとしてマークする", async () => {
    jest.spyOn(global, "Date").mockImplementation(() => now);

    const oldLoadedItems: ManifestItem[] = [
      {
        id: "item1",
        href: "/path/to/item1.xhtml",
        mediaType: "text/html",
      },
      {
        id: "photo1",
        href: "/path/to/photo1.jpg",
        mediaType: "image/jpeg",
      },
    ];

    const context: BookContext = {
      bookFileName: "book-file-name",
      dataSourceDirectory: "/path/to/dataSourceDirectory",
      identifier: "test-id",
      loadedItems: [...oldLoadedItems],
      projectDirectory: "/path/to/projectDirectory",
      spineItems: [],
      workingDirectory: "/path/to/workingDirectory",
      useSpecifiedFonts: false,
    };

    const result = processArtwork(context, "/path/to/photo1.jpg");
    expect(result).toStrictEqual([
      {
        id: "item1",
        href: "/path/to/item1.xhtml",
        mediaType: "text/html",
      },
      {
        properties: "cover-image",
        id: "photo1",
        href: "/path/to/photo1.jpg",
        mediaType: "image/jpeg",
      },
    ] satisfies ManifestItem[]);
  });

  it("coverImagePathが無指定の場合は、警告するだけで無変換でデータを返す", async () => {
    const messageSpy = jest.spyOn(cliMessage, "put");
    jest.spyOn(global, "Date").mockImplementation(() => now);

    const oldLoadedItems: ManifestItem[] = [
      {
        id: "item1",
        href: "/path/to/item1.xhtml",
        mediaType: "text/html",
      },
    ];

    const context: BookContext = {
      bookFileName: "book-file-name",
      dataSourceDirectory: "/path/to/dataSourceDirectory",
      identifier: "test-id",
      loadedItems: [...oldLoadedItems],
      projectDirectory: "/path/to/projectDirectory",
      spineItems: [],
      workingDirectory: "/path/to/workingDirectory",
      useSpecifiedFonts: false,
    };

    const result = processArtwork(context, undefined);
    expect(result).toStrictEqual(oldLoadedItems);
    expect(messageSpy).toHaveBeenCalledTimes(1);
    expect(messageSpy).toHaveBeenLastCalledWith(newMessage("カバー画像が定義されていません。", MessageLevelType.WARN));
  });

  it("指定されたcoverImagePathが読み込んだ項目に無ければ、警告するだけで無変換でデータを返す", async () => {
    const messageSpy = jest.spyOn(cliMessage, "put");
    jest.spyOn(global, "Date").mockImplementation(() => now);

    const oldLoadedItems: ManifestItem[] = [
      {
        id: "item1",
        href: "/path/to/item1.xhtml",
        mediaType: "text/html",
      },
      {
        id: "photo1",
        href: "/path/to/photo1.jpg",
        mediaType: "image/jpeg",
      },
    ];

    const context: BookContext = {
      bookFileName: "book-file-name",
      dataSourceDirectory: "/path/to/dataSourceDirectory",
      identifier: "test-id",
      loadedItems: [...oldLoadedItems],
      projectDirectory: "/path/to/projectDirectory",
      spineItems: [],
      workingDirectory: "/path/to/workingDirectory",
      useSpecifiedFonts: false,
    };

    const result = processArtwork(context, "/path/to/invalid-photo.jpg");
    expect(result).toStrictEqual([
      {
        id: "item1",
        href: "/path/to/item1.xhtml",
        mediaType: "text/html",
      },
      {
        id: "photo1",
        href: "/path/to/photo1.jpg",
        mediaType: "image/jpeg",
      },
    ] satisfies ManifestItem[]);

    expect(messageSpy).toHaveBeenCalledTimes(1);
    expect(messageSpy).toHaveBeenLastCalledWith(
      newMessage("カバー画像ファイル(/path/to/invalid-photo.jpg)が見つかりませんでした。", MessageLevelType.WARN),
    );
  });
});
