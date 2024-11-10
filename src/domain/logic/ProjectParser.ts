import { Effect } from "effect";
import YAML from "yaml";
import { EpubProjectEntity } from "../../domain/entity/EpubProjectEntity";
import { EpubProject } from "../../domain/value/EpubProject";
import { EpubProjecErrors } from "../error/EpubProjectError";

/**
 * YAMLで書かれたテキストデータを解析してプロジェクト定義として解釈します。
 *
 * 各設定値のデータ型が想定通りかは確認しません。
 *
 * @param rawText テキプロジェクト定義
 */
export function parse(rawText: string): Effect.Effect<EpubProject, EpubProjecErrors> {
  const data = YAML.parse(rawText);
  return EpubProjectEntity.fromParsedYaml(data);
}
