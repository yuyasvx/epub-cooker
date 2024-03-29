import type { Dirent } from "fs";
import { resolve } from "path";
import { readFile, readdir } from "fs/promises";
import { ProjectFileNotFoundError } from "../domain/error/AppError";
import { EpubProject } from "../domain/value/EpubProject";
import { loadProjectFile } from "./ProjectLoader";
import { validateProject } from "./ValidateProject";

jest.mock("path");
jest.mock("fs/promises");
jest.mock("./ValidateProject");

const yamlText = `
version: 1
book-metadata:
  title: 吾輩は猫である
  creator: 夏目漱石
  language: ja
identifier: abcdefgh

data:
  source-path: "./page-data"
  cover-image: "cover.jpg"
  exclude:
    - "_*.md"
  toc:
    path: contents.xhtml
    visible: false
`;

const expectProject: EpubProject = {
  version: 1,
  bookMetadata: {
    title: "吾輩は猫である",
    creator: "夏目漱石",
    language: "ja",
    publishedDate: undefined,
  },
  additionalMetadata: [],
  identifier: "abcdefgh",
  pageProgression: "ltr",
  useSpecifiedFonts: false,
  parseMarkdown: true,
  sourcePath: "./page-data",
  bookType: undefined,
  itemSortType: "string",
  tocPath: "contents.xhtml",
  visibleTocFile: false,
  coverImagePath: "cover.jpg",
  cssPath: undefined,
  include: [],
  exclude: ["_*.md"],
};

describe("loadFromDirectory", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it.each`
    fileName
    ${"project.yml"}
    ${"PROJECT.yml"}
    ${"project.YML"}
    ${"PROJECT.YML"}
    ${"project.yaml"}
  `("ディレクトリ直下の$fileNameが読み込めるとEpubProjectを取得できる", async ({ fileName }) => {
    const path = "/path/to/directory";
    const filesOfDirectory = ["file1.txt", "file2.txt", "file3", fileName];

    jest.mocked(readdir).mockResolvedValue(filesOfDirectory as unknown[] as Dirent[]);
    jest.mocked(resolve).mockReturnValue("/path/to/resolved/directory");
    jest.mocked(readFile).mockResolvedValue(Buffer.from(yamlText));
    jest.mocked(validateProject).mockReturnValue(true);

    const actual = await loadProjectFile(path);
    expect(actual).toStrictEqual(expectProject);
  });

  it("ディレクトリ直下のProject.ymlが読み込めないとエラー", () => {
    const path = "/path/to/directory";
    const filesOfDirectory = ["file1.txt", "file2.txt"];

    jest.mocked(readdir).mockResolvedValue(filesOfDirectory as unknown[] as Dirent[]);
    jest.mocked(resolve).mockReturnValue("/path/to/resolved/directory");
    jest.mocked(readFile).mockResolvedValue(Buffer.from(yamlText));
    jest.mocked(validateProject).mockReturnValue(true);

    expect(() => loadProjectFile(path)).rejects.toThrow(ProjectFileNotFoundError);
  });

  it("空ディレクトリの場合エラー", () => {
    const path = "/path/to/directory";
    const filesOfDirectory: Dirent[] = [];

    jest.mocked(readdir).mockResolvedValue(filesOfDirectory);
    jest.mocked(resolve).mockReturnValue("/path/to/resolved/directory");
    jest.mocked(readFile).mockResolvedValue(Buffer.from(yamlText));
    jest.mocked(validateProject).mockReturnValue(true);

    expect(() => loadProjectFile(path)).rejects.toThrow(ProjectFileNotFoundError);
  });
});
