import { parseISO } from "date-fns";
import { BookType } from "../domain/enums/BookType";
import { Case } from "../domain/enums/Case";
import { ItemSortType } from "../domain/enums/ItemSortType";
import { PageProgression } from "../domain/enums/PageProgression";
import { BookMetadata } from "../domain/value/BookMetadata";
import { AdditionalMetadata, EpubDataDetail, EpubProject } from "../domain/value/EpubProject";
import { UnknownValue } from "../util/UnknownValue";

type TocOption =
  | string
  | {
      path: string;
      visible: boolean;
    };

/**
 * オブジェクトをプロジェクト定義として読み込みます。
 *
 * 各設定値のデータ型が想定通りかは確認しません。
 *
 * @param data オブジェクト(YAMLからパースした直後のデータ)
 * @returns プロジェクト定義（設定値未確認）
 */
export function loadProjectFromRawObject(data: Record<string, unknown>): UnknownValue<EpubProject> {
  return {
    version: data.version as number,
    bookMetadata: getBookMetadata(data),
    additionalMetadata: (data["additional-metadata"] as AdditionalMetadata[]) ?? [],
    identifier: loadIdentifier(data) as string | undefined,
    pageProgression: (data["page-progression-direction"] as Case<typeof PageProgression>) ?? PageProgression.LTR,
    useSpecifiedFonts: (data["use-specified-fonts"] as boolean) ?? false,
    parseMarkdown: (data["enable-markdown-parser"] as boolean) ?? true,
    ...getDataObject(data),
  };
}

function loadIdentifier(data: Record<string, unknown>) {
  const value = data.identifier;

  if (typeof value === "number") {
    console.log("identifierプロパティが数値として設定されています。");
    return `${value}`;
  }

  return value;
}

function getDataObject(data: Record<string, unknown>): EpubDataDetail {
  const dataObject = data.data as Record<string, unknown>;
  const tocOption = dataObject.toc as TocOption | undefined;

  return {
    sourcePath: dataObject["source-path"] as string,
    bookType: dataObject["book-type"] as Case<typeof BookType>,
    itemSortType: (dataObject["sort-type"] as Case<typeof ItemSortType>) ?? ItemSortType.STRING,
    tocPath: getTocPath(tocOption),
    visibleTocFile: getVisibleTocFile(tocOption),
    coverImagePath: dataObject["cover-image"] as string,
    cssPath: dataObject.css as string,
    include: (dataObject.include as string[]) ?? [],
    exclude: (dataObject.exclude as "auto" | string[]) ?? "auto",
  };
}

function getTocPath(tocOption?: TocOption) {
  if (tocOption == null) {
    return undefined;
  }
  if (typeof tocOption === "string") {
    return tocOption;
  }
  return tocOption.path;
}

function getVisibleTocFile(tocOption?: TocOption) {
  if (tocOption == null) {
    return false;
  }
  if (typeof tocOption === "string") {
    return true;
  }
  return tocOption.visible;
}

function getBookMetadata(data: Record<string, unknown>): UnknownValue<BookMetadata> {
  const metadata = data["book-metadata"] as UnknownValue<BookMetadata & { "published-date": string }>;

  let publishedDate = undefined;
  const dateString = metadata["published-date"];
  if (dateString != null && typeof dateString === "string") {
    const date = parseISO(dateString);

    // パースが成功できたかを確認
    if (!Number.isNaN(date.getTime())) {
      publishedDate = date;
    }
  }

  return {
    ...metadata,
    publishedDate,
  };
}
