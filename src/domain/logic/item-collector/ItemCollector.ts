import { BookContext } from "../../../domain/data/BookContext";
import { CollectedItem } from "../../../domain/value/CollectedItem";
import { EpubProject } from "../../../domain/value/EpubProject";

export interface ItemCollector {
  collect(context: BookContext, project: EpubProject): Promise<Readonly<CollectedItem[]>>;
}
