import { ManifestItem } from "../../domain/value/ManifestItem";
import { SpineItem } from "../value/SpineItem";

export function processSpine(items: ManifestItem[], visibleTocFile = true) {
  const sortedItems = [...items.filter((itm) => itm.mediaType === "application/xhtml+xml")];
  // sortedItems.sort()

  return sortedItems.map((itm): SpineItem => {
    if (itm.properties === "nav") {
      return { id: itm.id, linear: visibleTocFile };
    }
    return { id: itm.id, linear: true };
  });
}
