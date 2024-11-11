import { ManifestItem } from "../value/ManifestItem";
import { SpineItem } from "../value/SpineItem";
import { processSpine } from "./SpineProcessor";

describe("SpineProcessor", () => {
  it("マニフェストアイテムを読み込んで、ページの順番を決定づけるspine要素の元となるデータに変換", () => {
    const manifestItems: ManifestItem[] = [
      {
        href: "/path/to/page.xhtml",
        id: "page1",
        mediaType: "application/xhtml+xml",
      },
      {
        href: "/path/to/page2.xhtml",
        id: "page2",
        mediaType: "application/xhtml+xml",
      },
    ];

    const result = processSpine(manifestItems);
    expect(result).toStrictEqual([
      { id: "page1", linear: true },
      { id: "page2", linear: true },
    ] as SpineItem[]);
  });

  it("ページの順番には関係しないので、XHTMLファイル以外のマニフェストアイテムは除外する", () => {
    const xhtmlItem: ManifestItem = {
      href: "/path/to/page.xhtml",
      id: "page1",
      mediaType: "application/xhtml+xml",
    };

    const imageItem: ManifestItem = {
      href: "/path/to/item.jpg",
      id: "photo1",
      mediaType: "image/jpeg",
    };

    const result = processSpine([xhtmlItem, imageItem]);
    expect(result).toStrictEqual([{ id: "page1", linear: true }] as SpineItem[]);
  });

  it("目次XHTMLを隠すフラグが立っている場合は、マニフェストアイテムは除外する", () => {
    const xhtmlItem: ManifestItem = {
      href: "/path/to/page.xhtml",
      id: "page1",
      mediaType: "application/xhtml+xml",
    };

    const tocXhtmlItem: ManifestItem = {
      href: "/path/to/toc.xhtml",
      id: "toc",
      mediaType: "application/xhtml+xml",
      properties: "nav",
    };

    const result = processSpine([xhtmlItem, tocXhtmlItem], false);
    expect(result).toStrictEqual([
      { id: "page1", linear: true },
      { id: "toc", linear: false },
    ] as SpineItem[]);
  });
});
