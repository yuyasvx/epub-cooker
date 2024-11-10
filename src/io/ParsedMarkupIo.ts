import { ParsedMarkup } from "../domain/value/parsed-markup/ParsedMarkup";
import * as fileIo from "./FileIo";

export const save = (destination: string, markup: ParsedMarkup) => fileIo.save(destination, markup.xhtmlString);
