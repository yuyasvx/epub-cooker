import { createWriteStream } from "fs";
import { resolve as resolvePath } from "path";
import archiver from "archiver";
import { readdir } from "fs/promises";
import { singleton } from "tsyringe";

@singleton()
export class ArchiveService {
  public async makeEpubArchive(sourceDirectory: string, destinationDirectory: string, title: string): Promise<void> {
    await this.until(() => this.findEssentialItems(sourceDirectory));

    console.log("EPUBファイルの作成を行っています ...");
    const fileName = this.sanitizeFileName(title);
    const output = createWriteStream(resolvePath(destinationDirectory, `${fileName}.epub`));
    const archive = archiver("zip");

    output.on("close", () => {
      console.log("製本が完了しました。");
      // resolve();
    });
    archive.on("error", (err) => {
      throw err;
    });
    archive.append("application/epub+zip", {
      store: true,
      name: "mimetype",
    });
    archive.glob("OPS/*", { cwd: resolvePath(sourceDirectory) });
    archive.glob("OPS/**/*", { cwd: resolvePath(sourceDirectory) });
    archive.glob("META-INF/*", { cwd: resolvePath(sourceDirectory) });
    archive.glob("META-INF/**/*", { cwd: resolvePath(sourceDirectory) });
    archive.pipe(output);
    return archive.finalize();
  }

  protected sanitizeFileName(fileName: string) {
    return fileName.replace(/[\:\\\/\*\?\"\<\>\|]\./, "_");
  }

  /**
   * predicateがtrueになるまで、一定間隔で繰り返しpredicate関数を実行し続けます。
   *
   * @param predicate booleanを返す関数。非同期でもOK
   * @returns 非同期
   */
  protected until(predicate: () => boolean | Promise<boolean>) {
    let timerId: NodeJS.Timeout | undefined = undefined;
    let limitCount = 0;

    return new Promise<void>((resolve, reject) => {
      timerId = setInterval(() => {
        if (limitCount >= 10) {
          clearInterval(timerId);
          resolve();
          return;
        }
        const resultOrFlag = predicate();
        if (typeof resultOrFlag === "boolean") {
          limitCount += 1;
          if (resultOrFlag) {
            clearInterval(timerId);
            resolve();
          }
          return;
        }
        if (typeof resultOrFlag !== "boolean") {
          resultOrFlag.then((flag) => {
            limitCount += 1;
            if (flag) {
              clearInterval(timerId);
              resolve();
            }
            return;
          });
        }
      }, 500);
    });
  }

  protected async findEssentialItems(sourceDirectory: string) {
    // TODO 即席すぎる
    const list = await readdir(sourceDirectory);
    return list.includes("OPS") && list.includes("META-INF");
  }
}
