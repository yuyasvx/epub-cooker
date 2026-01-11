export type BookMetadata = Readonly<{
  title: string;
  author?: string;
  publisher?: string;
  language: string;
  description?: string;
  publishedDate?: Date;
  identifier: string;
}>;

export type UnidentifiedBookMetadata = Omit<BookMetadata, 'identifier'>;

export function BookMetadata(value: BookMetadata): BookMetadata;
export function BookMetadata(value: UnidentifiedBookMetadata): UnidentifiedBookMetadata;
export function BookMetadata(value: BookMetadata | UnidentifiedBookMetadata): BookMetadata | UnidentifiedBookMetadata {
  return {
    title: value.title,
    language: value.language,
    ...(value.author != null && { author: value.author }),
    ...(value.publisher != null && { publisher: value.publisher }),
    ...(value.description != null && { description: value.description }),
    ...(value.publishedDate != null && { publishedDate: value.publishedDate }),
    ...((value as BookMetadata).identifier != null && { identifier: (value as BookMetadata).identifier }),
  };
}
