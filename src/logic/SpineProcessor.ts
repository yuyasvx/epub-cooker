import { Case } from "../domain/enums/Case";
import { ItemSortType } from "../domain/enums/ItemSortType";
import { ManifestItem } from "../domain/value/ManifestItem";
import { SpineItems } from "../domain/value/SpineItem";

export function processSpine(items: ManifestItem[], type: Case<typeof ItemSortType>, visibleTocFile = true) {
  const sortedItems = [...items.filter((itm) => itm.mediaType === "application/xhtml+xml")];
  // sortedItems.sort()

  return sortedItems.map((itm): SpineItems => {
    if (itm.properties === "nav") {
      return { id: itm.id, linear: visibleTocFile };
    }
    return { id: itm.id, linear: true };
  });
}
