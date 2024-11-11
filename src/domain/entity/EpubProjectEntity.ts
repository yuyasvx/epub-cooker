import { parseISO } from "date-fns";
import { Effect } from "effect";
import { throws } from "../../util/EffectUtil";
import { UnknownValue } from "../../util/UnknownValue";
import { BookType } from "../enums/BookType";
import { Case } from "../../util/Case";
import { ItemSortType } from "../enums/ItemSortType";
import { PageProgression } from "../enums/PageProgression";
import {
  EpubProjecErrors,
  InvalidAdditionalMetadataError,
  InvalidBookMetadataError,
  InvalidIdentifierError,
  InvalidRawDataError,
  InvalidVersionError,
} from "../error/EpubProjectError";
import { BookMetadata } from "../value/BookMetadata";
import { AdditionalMetadata, EpubDataDetail, EpubProject } from "../value/EpubProject";

type TocOption =
  | string
  | {
      path: string;
      visible: boolean;
    };

export class EpubProjectEntity implements EpubProject {
  static fromParsedYaml = (data: unknown): Effect.Effect<EpubProjectEntity, EpubProjecErrors> =>
    throws(() => {
      if (data == null || typeof data !== "object") {
        throw new InvalidRawDataError();
      }
      const data_ = data as UnknownValue<EpubProject>;
      rejectInvalidVersionNo(data_.version);
      rejectInvalidBookMetadata((data as Record<string, unknown>)["book-metadata"]);
      (data as Record<string, unknown>)["additional-metadata"] != null &&
        rejectInvalidAdditionalMetadata((data as Record<string, unknown>)["additional-metadata"]);
      rejectInvalidIdentifier(data_.identifier);

      const rawData = data as Record<string, unknown>;
      return EpubProjectEntity.create({
        version: rawData.version as number,
        bookMetadata: getBookMetadata(rawData),
        additionalMetadata: rawData["additional-metadata"] as AdditionalMetadata[],
        identifier: loadIdentifier(rawData) as string | undefined,
        pageProgression: rawData["page-progression-direction"] as Case<typeof PageProgression>,
        useSpecifiedFonts: rawData["use-specified-fonts"] as boolean,
        parseMarkdown: rawData["enable-markdown-parser"] as boolean,
        ...getDataObject(rawData),
      });
    });

  static create(epubProject: EpubProject) {
    return new EpubProjectEntity(
      epubProject.version,
      epubProject.bookMetadata,
      epubProject.sourcePath,
      epubProject.visibleTocFile,
      epubProject.include,
      epubProject.exclude,
      epubProject.useSpecifiedFonts,
      epubProject.parseMarkdown,
      epubProject.additionalMetadata,
      epubProject.pageProgression,
      epubProject.identifier,
      epubProject.bookType,
      epubProject.itemSortType,
      epubProject.tocPath,
      epubProject.coverImagePath,
      epubProject.cssPath,
      epubProject.pages,
    );
  }

  constructor(
    readonly version: number,
    readonly bookMetadata: BookMetadata,
    readonly sourcePath: string,
    readonly visibleTocFile: boolean,
    readonly include: string[],
    readonly exclude: string[] | "auto",
    readonly useSpecifiedFonts: boolean = false,
    readonly parseMarkdown: boolean = true,
    readonly additionalMetadata: Readonly<AdditionalMetadata>[] = [],
    readonly pageProgression: Case<typeof PageProgression> = PageProgression.LTR,
    readonly identifier?: string,
    readonly bookType?: Case<typeof BookType>,
    readonly itemSortType: Case<typeof ItemSortType> = ItemSortType.STRING,
    readonly tocPath?: string,
    readonly coverImagePath?: string,
    readonly cssPath?: string,
    readonly pages: string[] = [],
  ) {}
}

function getBookMetadata(data: Record<string, unknown>): BookMetadata {
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
    ...(metadata as BookMetadata),
    publishedDate,
  };
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

function loadIdentifier(data: Record<string, unknown>) {
  const value = data.identifier;

  if (typeof value === "number") {
    console.log("identifierプロパティが数値として設定されています。");
    return `${value}`;
  }

  return value;
}

function rejectInvalidVersionNo(versionNo?: unknown) {
  if (versionNo == null || versionNo !== 1) {
    throw new InvalidVersionError();
  }
}

function rejectInvalidAdditionalMetadata(value: unknown) {
  // AdditionalMetadataの中身はこのValidatorではチェックしない
  if (!Array.isArray(value)) {
    throw new InvalidAdditionalMetadataError();
  }
}

function rejectInvalidIdentifier(identifier?: unknown) {
  // identifierがnullとして設定されていても、プロジェクト定義上は問題ない
  if (identifier != null && typeof identifier !== "string") {
    throw new InvalidIdentifierError();
  }
}

export function rejectInvalidBookMetadata(value: unknown): value is BookMetadata {
  if (typeof value !== "object") {
    throw new InvalidBookMetadataError("DATA_TYPE");
  }
  const unknownMetadata = value as UnknownValue<BookMetadata>;

  // titleは必須
  if (unknownMetadata.title == null) {
    throw new InvalidBookMetadataError("TITLE");
  }

  // languageは必須
  if (unknownMetadata.language == null) {
    throw new InvalidBookMetadataError("LANGUAGE");
  }

  if (unknownMetadata.publishedDate != null && typeof unknownMetadata.publishedDate !== "object") {
    throw new InvalidBookMetadataError("PROPERTY");
  }

  const { creator, description, genre, publisher, rights } = unknownMetadata;

  for (const value of [creator, description, genre, publisher, rights]) {
    if (typeof value !== "string" && typeof value !== "undefined") {
      throw new InvalidBookMetadataError("PROPERTY");
    }
  }

  return true;
}
