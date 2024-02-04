import fs from "node:fs";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { singleton } from "tsyringe";

@singleton()
export class DirectoryService {
  public async getDirectory(path: string) {
    const resolvedPath = resolve(path);
    return promisify(fs.readdir)(resolvedPath);
  }
}
