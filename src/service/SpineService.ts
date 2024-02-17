import { singleton } from "tsyringe";
import { Case } from "../domain/enums/Case";
import { ItemSortType } from "../domain/enums/ItemSortType";
import { ManifestItem } from "../domain/value/ManifestItem";
import { SpineItems } from "../domain/value/SpineItem";

@singleton()
export class SpineService {
  public sortItems(items: ManifestItem[], type: Case<typeof ItemSortType>): SpineItems[] {
    const sortedItems = [...items.filter((itm) => itm.mediaType === "application/xhtml+xml")];
    // sortedItems.sort()

    return sortedItems.map((itm): SpineItems => ({ id: itm.id, linear: true }));
  }
}
