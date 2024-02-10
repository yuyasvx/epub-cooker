import { Case } from "../enums/Case";
import { PageProgression } from "../enums/PageProgression";
import { PageType } from "../enums/PageType";
import { BookMetadata } from "./BookMetadata";

export class EpubProject {
  constructor(
    public version: number,
    public bookMetadata: Readonly<BookMetadata>,
    public additionalMetadata: Readonly<AdditionalMetadata>[],
    public itemSource: string,
    public identifier: string | undefined,
    public pageProgression: Case<typeof PageProgression>,
    public useSpecifiedFonts: boolean,
    public sourcePath: string,
    public pageType: Case<typeof PageType>,
  ) {}
}

export interface AdditionalMetadata {
  key: string;
  value: unknown;
}

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

export function createFromParsedYaml(data: Record<string, unknown>): Readonly<EpubProject> {
  return {
    version: data.version as number,
    bookMetadata: data["book-metadata"] as BookMetadata,
    additionalMetadata: (data["additional-metadata"] as AdditionalMetadata[]) ?? [],
    itemSource: data["item-source"] as string,
    identifier: data.identifier as string | undefined,
    pageProgression: (data["page-progression-direction"] as Case<typeof PageProgression>) ?? PageProgression.LTR,
    useSpecifiedFonts: (data["use-specified-fonts"] as boolean) ?? false,
    sourcePath: data["item-source-path"] as string,
    pageType: data["page-type"] as Case<typeof PageType>,
  };
}
