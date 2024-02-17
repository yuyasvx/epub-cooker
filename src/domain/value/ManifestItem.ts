export const ManifestItemType = {
  FILE: 0,
  DIRECTORY: 1,
} as const;

export type ManifestItem = Readonly<{
  id: string;
  href: string;
  mediaType: string;
  properties?: string;
  createdTimestamp?: number;
  lastModifiedTimestamp?: number;
}>;
