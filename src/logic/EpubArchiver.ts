import { createWriteStream } from "fs";
import { resolve as resolvePath } from "path";
import archiver from "archiver";
import { readdir } from "fs/promises";
import { until } from "../util/Until";

export async function archiveDirectory(sourceDirectory: string, destination: string, fileName: string) {
  await until(() => findEssentialItems(sourceDirectory));

  console.log("EPUBファイルの作成を行っています ...");
  const sanitizedFileName = sanitizeFileName(fileName);
  const output = createWriteStream(resolvePath(destination, `${sanitizedFileName}`));
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
  archive.glob("*", { cwd: resolvePath(sourceDirectory), ignore: "mimetype" });
  archive.glob("**/*", { cwd: resolvePath(sourceDirectory) });
  archive.pipe(output);

  return archive.finalize();
}

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

async function findEssentialItems(sourceDirectory: string) {
  // TODO 即席すぎる
  const list = await readdir(sourceDirectory);
  return list.includes("OPS") && list.includes("META-INF");
}
