import { resolve } from "path";
import { readFile, writeFile } from "fs/promises";
import { v4 } from "uuid";
import { EpubProject } from "../domain/value/EpubProject";
import { asyncTryOrNothing } from "../util/TryOrNothing";

/**
 * ブックのIDを決定します。
 *
 * プロジェクト定義に`identifier`プロパティがあれば、それをそのままブックのIDにします。
 * 無ければ、プロジェクトディレクトリの`identifier`ファイルの内容を読み込み、それをブックのIDにします。
 * それも無ければ、uuidを生成し、`identifier`ファイルとして保存してから、それをブックのIDにします。
 *
 * @param directory プロジェクトディレクトリ
 * @param project プロジェクト定義
 * @returns ブックのID
 */
export async function identify(directory: string, project: EpubProject) {
  const projectIdentifier = project.identifier;
  if (projectIdentifier != null) {
    return projectIdentifier;
  }
  const readIdentifier = await asyncTryOrNothing(() =>
    readFile(resolve(directory, "identifier")).then((file) => file.toString()),
  );
  if (readIdentifier != null) {
    return readIdentifier;
  }

  const uuid = `urn:uuid:${v4()}`;
  await writeFile(resolve(directory, "identifier"), uuid);
  return uuid;
}
