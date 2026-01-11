export type EpubBookMetadata = Readonly<{
  title: string;
  author?: string;
  publisher?: string;
  language: string;
  description?: string;
  publishedDate?: Date;
  identifier: string;
}>;

export type UnidentifiedEpubBookMetadata = Omit<EpubBookMetadata, 'identifier'>;

export function EpubBookMetadata(value: EpubBookMetadata): EpubBookMetadata;
export function EpubBookMetadata(value: UnidentifiedEpubBookMetadata): UnidentifiedEpubBookMetadata;
export function EpubBookMetadata(
  value: EpubBookMetadata | UnidentifiedEpubBookMetadata,
): EpubBookMetadata | UnidentifiedEpubBookMetadata {
  return {
    title: value.title,
    language: value.language,
    ...(value.author != null && { author: value.author }),
    ...(value.publisher != null && { publisher: value.publisher }),
    ...(value.description != null && { description: value.description }),
    ...(value.publishedDate != null && { publishedDate: value.publishedDate }),
    ...((value as EpubBookMetadata).identifier != null && { identifier: (value as EpubBookMetadata).identifier }),
  };
}
