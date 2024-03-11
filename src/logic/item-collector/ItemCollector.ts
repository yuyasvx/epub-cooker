import { BookContext } from "../../domain/data/EpubContext";
import { CollectedItem } from "../../domain/value/CollectedItem";
import { EpubProject } from "../../domain/value/EpubProject";

export interface ItemCollector {
  collect(context: BookContext): Promise<Readonly<CollectedItem[]>>;
}
