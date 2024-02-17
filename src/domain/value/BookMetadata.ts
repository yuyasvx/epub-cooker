export type BookMetadata = Readonly<{
  title: string;
  creator?: string;
  publisher?: string;
  language?: string;
  rights?: string;
  description?: string;
  genre?: string;
}>;
