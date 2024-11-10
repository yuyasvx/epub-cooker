import { resolve } from "path";
import { EpubProject } from "../value/EpubProject";
import { ManifestItem } from "../value/ManifestItem";
import { SpineItem } from "../value/SpineItem";
import { ContainerXml } from "./xml-resource/ContainerXml";
import { IBooksDisplayOptionsXml } from "./xml-resource/IBooksDisplayOptionsXml";

/**
 * @internal
 */
export const WORKING_DIERCTORY_NAME = ".working";

/**
 * @internal
 */
export type BookContext = {
  projectDirectory: string;
  dataSourceDirectory: string;
  workingDirectory: string;
  identifier: string;
  loadedItems: ManifestItem[];
  spineItems: SpineItem[];
  bookFileName: string;
  useSpecifiedFonts: boolean;
};

/**
 * @internal
 */
export class BookContextData implements BookContext {
  projectDirectory = "";
  dataSourceDirectory = "";
  workingDirectory = "";
  identifier = "";
  loadedItems: ManifestItem[] = [];
  spineItems: SpineItem[] = [];
  bookFileName = "";
  useSpecifiedFonts = false;

  private containerXml = new ContainerXml();

  /**
   * コンテキストを作成します。
   *
   * EPUB作成のために読み込んだデータや必要な情報・プロジェクト定義内の一部の情報は、一旦コンテキストというミュータブルな
   * 入れ物の中に保存します。各処理は、このコンテキストを受け取ったり、コンテキストにデータを書き込んだりして
   * 処理を進めていきます。
   *
   * @param directory プロジェクトディレクトリ
   * @param project 読み込んだプロジェクト定義
   * @returns コンテキスト
   */
  static create(directory: string, project: EpubProject, identifier: string) {
    return BookContextData.from({
      projectDirectory: directory,
      workingDirectory: resolve(directory, WORKING_DIERCTORY_NAME),

      // project.ymlの置き場所が/path/to/project、データの置き場所がitem-path/の場合、
      // sourceDirectoryは/path/to/project/item-pathになる
      dataSourceDirectory: resolve(directory, project.sourcePath),

      identifier,
      loadedItems: [],
      spineItems: [],
      bookFileName: project.bookMetadata.title,
      useSpecifiedFonts: project.useSpecifiedFonts,
    });
  }

  static from(ctx: BookContext) {
    const newContext = new BookContextData();
    Object.assign(newContext, { ...ctx });
    return newContext;
  }

  private constructor() {}

  getContainerXml() {
    return this.containerXml;
  }

  getDisplayOptionsXml() {
    const displayOptionsXml = new IBooksDisplayOptionsXml();
    displayOptionsXml.setSpecifiedFonts(this.useSpecifiedFonts);
    return displayOptionsXml;
  }
}
