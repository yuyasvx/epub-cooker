import { EpubProject } from "../value/EpubProject";
import { ManifestItem } from "../value/ManifestItem";
import { SpineItems } from "../value/SpineItem";

export type EpubContext = {
  projectDirectory: string;
  workingDirectory: string;
  identifier: string;
  loadedItems: ManifestItem[];
  spineItems: SpineItems[];
  bookFileName: string;
};

export type BookContext = {
  project: EpubProject;
  projectDirectory: string;
  dataSourceDirectory: string;
  workingDirectory: string;
  identifier: string;
  loadedItems: ManifestItem[];
  spineItems: SpineItems[];
  bookFileName: string;
};
