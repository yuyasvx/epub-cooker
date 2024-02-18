import { ManifestItem } from "../value/ManifestItem";
import { SpineItems } from "../value/SpineItem";

export type EpubContext = {
  projectDirectory: string;
  workingDirectory: string;
  identifier: string;
  loadedItems: ManifestItem[];
  spineItems: SpineItems[];
};