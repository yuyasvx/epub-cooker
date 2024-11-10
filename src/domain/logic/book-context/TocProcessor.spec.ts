import { Effect } from "effect";
import { succeed } from "effect/Effect";
import { BookContext } from "../../../domain/data/BookContext";
import { ManifestItem } from "../../../domain/value/ManifestItem";
import * as parsedMarkupIo from "../../../io/ParsedMarkupIo";
import { processToc } from "./TocProcessor";

jest.mock("../../../io/ParsedMarkupIo");

describe("TocProcessor", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("指定されたtocPathに該当する読み込み済みアイテムが見つかった場合は、そのアイテムを目次用としてマークする", async () => {
    jest.mocked(parsedMarkupIo.save).mockReturnValue(succeed(Effect.void));

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

    const result = await processToc(context, "/path/to/item1.xhtml");

    expect(result).toHaveLength(1);
    expect(result).toStrictEqual([
      {
        properties: "nav",
        id: "item1",
        href: "/path/to/item1.xhtml",
        mediaType: "text/html",
      },
    ] satisfies ManifestItem[]);
  });

  it("tocPathが無い場合は、代替のtoc.xhtmlを生成し読み込み済みアイテムとして記録", async () => {
    jest.mocked(parsedMarkupIo.save).mockReturnValue(succeed(Effect.void));

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

    const result = await processToc(context, undefined);

    expect(result).toHaveLength(2);
    expect(result[0]).toStrictEqual(oldLoadedItems[0]);
    expect(result[1]).toStrictEqual({
      href: "toc.xhtml",
      id: "dG9jLnhodG1s",
      mediaType: "application/xhtml+xml",
      properties: "nav",
    } satisfies ManifestItem);
  });

  it("tocPathで指定された目次用XHTMLが読み込んだ項目に無ければ、代替のtoc.xhtmlを生成し読み込み済みアイテムとして記録", async () => {
    jest.mocked(parsedMarkupIo.save).mockReturnValue(succeed(Effect.void));

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

    const result = await processToc(context, "/path/to/invalid-item.xhtml");

    expect(result).toHaveLength(2);
    expect(result[0]).toStrictEqual(oldLoadedItems[0]);
    expect(result[1]).toStrictEqual({
      href: "toc.xhtml",
      id: "dG9jLnhodG1s",
      mediaType: "application/xhtml+xml",
      properties: "nav",
    } satisfies ManifestItem);
  });
});
