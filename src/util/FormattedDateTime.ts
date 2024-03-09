import { format } from "date-fns";

export function getFormattedDateTime(dt: Date) {
  return format(dt, "yyyy-MM-dd'T'HH:mm:ss'Z'");
}

export function getFormattedDate(dt: Date) {
  return format(dt, "yyyy-MM-dd");
}
