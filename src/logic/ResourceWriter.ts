import { resolve as resolvePath } from "path";
import { mkdir, readdir, writeFile } from "fs/promises";
import { BookContext } from "../domain/data/EpubContext";
import { ContainerXml } from "../domain/data/xml-resource/ContainerXml";
import { IBooksDisplayOptionsXml } from "../domain/data/xml-resource/IBooksDisplayOptionsXml";
import { PackageOpfXml } from "../domain/data/xml-resource/PackageOpfXml";
import { XmlResource } from "../domain/data/xml-resource/XmlResource";

// TODO リソースオブジェクトorプロジェクト定義 → 保存先のチェック処理 → ファイルの書き込み が渾然一体

/**
 * プロジェクト定義やコンテキストから、Epubの構成に必要なXMLファイルを保存します。
 *
 * @param context コンテキスト
 * @param project プロジェクト定義
 */
export async function saveResources(context: BookContext) {
  const { project } = context;
  const containerXml = new ContainerXml();
  const displayOptionsXml = new IBooksDisplayOptionsXml();
  displayOptionsXml.setSpecifiedFonts(project.useSpecifiedFonts);

  const packageOpf = PackageOpfXml.of(project, context.identifier);
  packageOpf.items = context.loadedItems;
  packageOpf.spineItems = context.spineItems;
  // 処理の最後に生成時刻更新
  packageOpf.updateModifiedDateTime();

  await Promise.all([
    save(context.workingDirectory, containerXml),
    save(context.workingDirectory, displayOptionsXml),
    save(context.workingDirectory, packageOpf),
  ]);
}

/**
 * ファイルの保存場所を作成します。
 * @param destination ファイルのフルパス(例 /Users/hogehoge/fuga.txt)。ファイル名まで指定しておくこと。
 */
export async function createDestinationDirectory(destination: string) {
  if (!(await checkExistence(destination))) {
    await mkdir(resolvePath(destination, "../"), { recursive: true });
  }
}

/**
 * XMLリソースを本当のXMLの文書に変換してファイルとして保存します。
 *
 * 例：directory=/path/to/directory、リソースのpath=hoge/fuga.xmlの場合、
 * /path/to/directory/hoge/fuga.xmlにファイルの保存を試みます。
 *
 * @param directory 保存先のベースとなるディレクトリを指定します。
 * @param resource XMLリソース
 * @param skipCheck trueにすると保存先のディレクトリ存在チェックをスキップします。
 */
async function save(directory: string, resource: XmlResource, skipCheck = false) {
  const destination = resolvePath(directory, resource.path);
  await saveTextFile(resource.toXml(), destination, skipCheck);
}

/**
 * 任意のテキストファイルを保存します。
 *
 * @param rawText テキストデータ
 * @param fullPath 保存先のフルパス
 * @param skipCheck trueにすると保存先のディレクトリ存在チェックをスキップします。
 */
async function saveTextFile(rawText: string, fullPath: string, skipCheck = false): Promise<void> {
  if (!skipCheck && !(await checkExistence(fullPath))) {
    await mkdir(resolvePath(fullPath, "../"), { recursive: true });
  }
  await writeFile(fullPath, rawText);
  return;
}

/**
 * ファイルの保存場所があるか確認します。
 * @param destination ファイルのフルパス(例 /Users/hogehoge/fuga.txt)。ファイル名まで指定しておくこと。
 * @returns あればtrue, 無ければfalse
 * @throws アクセス不可などの何かしらのトラブル発生の場合はエラーをスローします
 */
async function checkExistence(destination: string) {
  try {
    await readdir(resolvePath(destination, "../"));
    return true;
  } catch (e) {
    if ((e as Record<string, unknown>).code === "ENOENT") {
      return false;
    }
    throw e;
  }
}
