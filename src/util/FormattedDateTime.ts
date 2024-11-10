import { format } from "date-fns";

/**
 * @internal
 * @param dt
 * @returns
 */
export function getFormattedDateTime(dt: Date) {
  return format(dt, "yyyy-MM-dd'T'HH:mm:ss'Z'");
}

/**
 * @internal
 * @param dt
 * @returns
 */
export function getFormattedDate(dt: Date) {
  return format(dt, "yyyy-MM-dd");
}
