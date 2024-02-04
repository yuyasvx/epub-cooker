import { BookMetadata } from "./BookMetadata";

export class EpubProject {
  constructor(
    public version: number,
    public bookMetadata: Readonly<BookMetadata>,
    public additionalMetadata: Readonly<AdditionalMetadata>[],
    public itemSource: string,
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

export function createFromParsedYaml(data: Record<string, unknown>): EpubProject {
  return {
    version: data.version as number,
    bookMetadata: data["book-metadata"] as BookMetadata,
    additionalMetadata: (data["additional-metadata"] as AdditionalMetadata[]) || [],
    itemSource: data["item-source"] as string,
  };
}
