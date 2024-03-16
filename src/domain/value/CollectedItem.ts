export type CollectedItem = Readonly<{
  name: string;
  path: string;
  href: string;
  mediaType: string;
  properties?: string;
  createdTimestamp?: number;
  lastModifiedTimestamp?: number;
}>;

export type CollectedPhotoItem = Readonly<{
  width: number;
  height: number;
}> &
  CollectedItem;
