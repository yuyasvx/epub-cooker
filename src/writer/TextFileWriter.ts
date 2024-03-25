import { resolve as resolvePath } from "path";
import { mkdir, writeFile } from "fs/promises";
import { checkDirectory } from "./FileIo";

export async function saveTextFile(rawText: string, fullPath: string, force = false) {
  if (!force && !(await checkDirectory(fullPath))) {
    await mkdir(resolvePath(fullPath, "../"), { recursive: true });
  }
  await writeFile(fullPath, rawText);
  return;
}
