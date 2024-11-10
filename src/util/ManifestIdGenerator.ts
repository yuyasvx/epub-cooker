import { join } from "path";
import { CollectedItem } from "../domain/value/CollectedItem";

/**
 * @internal
 * @param value
 * @returns
 */
export function generateId(value: CollectedItem | string) {
  const source = typeof value === "string" ? value : join(value.path, value.name);
  return Buffer.from(source).toString("base64").replaceAll("=", "_");
}
