import { createWriteStream } from "fs";
import { resolve as resolvePath } from "path";
import archiver, { ArchiverError } from "archiver";
import { Effect } from "effect";
import { fail } from "effect/Effect";

export const archiveDirectory = (sourceDirectory: string, destination: string, fileName: string) =>
  Effect.async<void, ArchiverError>((resume) => {
    console.log("EPUBファイルの作成を行っています ...");
    const sanitizedFileName = sanitizeFileName(fileName);
    const output = createWriteStream(resolvePath(destination, `${sanitizedFileName}`));
    const archive = archiver("zip");

    output.on("close", () => {
      console.log("製本が完了しました。");
      // resolve();
      resume(Effect.void);
    });
    archive.on("error", (err) => {
      resume(fail(err));
    });
    archive.append("application/epub+zip", {
      store: true,
      name: "mimetype",
    });

    archive.glob("*", { cwd: resolvePath(sourceDirectory), ignore: "mimetype" });
    archive.glob("**/*", { cwd: resolvePath(sourceDirectory) });
    archive.pipe(output);

    archive.finalize();
  });

/**
 * ファイル名のサニタイズ
 *
 * - WindowsやMacのファイルシステムで使っていけない記号を全て`_`に変換します
 * - ファイル名が`.epub`で終わっていない場合は、追加します。
 *
 * @param fileName ファイル名
 * @returns 変換済みのファイル名文字列
 */
function sanitizeFileName(fileName: string) {
  const nm = fileName.endsWith(".epub") ? fileName.substring(0, fileName.length - 5) : fileName;

  return `${nm.replace(/[\:\\\/\*\?\"\<\>\|]\./, "_")}.epub`;
}
