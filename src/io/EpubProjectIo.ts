import { flatMap, map } from "effect/Effect";
import { parse } from "../domain/logic/ProjectParser";
import * as fileIo from "./FileIo";

export const getFile = (path: string) =>
  fileIo.getFile(path).pipe(
    map((buffer) => buffer.toString()),
    flatMap((rawText) => parse(rawText)),
  );
