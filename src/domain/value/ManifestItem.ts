export type ManifestItem = Readonly<{
  id: string;
  href: string;
  mediaType: string;
  properties?: string;
  createdTimestamp?: number;
  lastModifiedTimestamp?: number;
}>;
