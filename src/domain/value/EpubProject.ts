import { Case } from "../enums/Case";
import { ItemSortType } from "../enums/ItemSortType";
import { PageProgression } from "../enums/PageProgression";
import { PageType } from "../enums/PageType";
import { BookMetadata } from "./BookMetadata";

export type EpubProject = Readonly<{
  version: number;
  bookMetadata: BookMetadata;
  additionalMetadata: AdditionalMetadata[];
  itemSource: string;
  identifier?: string;
  pageProgression: Case<typeof PageProgression>;
  useSpecifiedFonts: boolean;
  sourcePath: string;
  pageType: Case<typeof PageType>;
  parseMarkdown: boolean;
  autoExclusion: boolean;
  itemSortType: Case<typeof ItemSortType>;
  tocFilePath?: string;
}>;

export type AdditionalMetadata<V = unknown> = Readonly<{
  key: string;
  value: V;
}>;

export function validate(data: unknown): data is EpubProject {
  if (typeof data !== "object") {
    return false;
  }

  const data_ = data as Record<string, unknown>;

  if (data_.version == null || data_.version !== 1) {
    return false;
  }

  // TODO まあいいか
  //   if (data_.bookMetadata == null || data_.bookMetadata.title == null) {
  //     return false;
  //   }

  return true;
}

export function createFromParsedYaml(data: Record<string, unknown>): EpubProject {
  const pageItemObject = data["page-item"] as Record<string, unknown>;
  return {
    version: data.version as number,
    bookMetadata: data["book-metadata"] as BookMetadata,
    additionalMetadata: (data["additional-metadata"] as AdditionalMetadata[]) ?? [],
    itemSource: data["item-source"] as string,
    identifier: data.identifier as string | undefined,
    pageProgression: (data["page-progression-direction"] as Case<typeof PageProgression>) ?? PageProgression.LTR,
    useSpecifiedFonts: (data["use-specified-fonts"] as boolean) ?? false,
    sourcePath: pageItemObject["source-path"] as string,
    pageType: pageItemObject.type as Case<typeof PageType>,
    parseMarkdown: (data["parse-markdown"] as boolean) ?? true,
    autoExclusion: (data["auto-exclusion"] as boolean) ?? true,
    itemSortType: (pageItemObject["sort-type"] as Case<typeof ItemSortType>) ?? ItemSortType.STRING,
    tocFilePath: pageItemObject.toc as string,
  };
}
