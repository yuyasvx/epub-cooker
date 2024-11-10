import { resolve } from "path";
import { Effect, pipe } from "effect";
import { v4 } from "uuid";
import { EpubProject } from "../../domain/value/EpubProject";
import * as fileIo from "../../io/FileIo";
import { runNullable, runThrowing } from "../../util/EffectUtil";

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

  const readIdentifier = await runNullable(
    pipe(
      fileIo.getFile(resolve(directory, "identifier")),
      Effect.map((buffer) => buffer.toString()),
    ),
  );

  if (readIdentifier != null) {
    return readIdentifier;
  }

  const uuid = `urn:uuid:${v4()}`;
  // TODO WriteFileができなかった時どうする
  await runThrowing(fileIo.save(resolve(directory, "identifier"), uuid));
  return uuid;
}
