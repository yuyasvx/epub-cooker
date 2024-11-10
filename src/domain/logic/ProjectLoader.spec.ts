import type { Dirent } from "fs";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "path";
import { runPromise } from "effect/Effect";
import { EpubProject } from "../../domain/value/EpubProject";
import { ProjectFileNotFoundError } from "../../error/AppError";
import { runThrowing } from "../../util/EffectUtil";
import { loadProjectFile } from "./ProjectLoader";

jest.mock("path");
jest.mock("node:fs/promises");

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
  pages: [],
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
    // jest.mocked(validateProject).mockReturnValue(true);

    const actual = await runPromise(loadProjectFile(path));
    expect({ ...actual }).toStrictEqual(expectProject);
  });

  it("ディレクトリ直下のProject.ymlが読み込めないとエラー", async () => {
    const path = "/path/to/directory";
    const filesOfDirectory = ["file1.txt", "file2.txt"];

    jest.mocked(readdir).mockResolvedValue(filesOfDirectory as unknown[] as Dirent[]);
    jest.mocked(resolve).mockReturnValue("/path/to/resolved/directory");
    jest.mocked(readFile).mockResolvedValue(Buffer.from(yamlText));
    // jest.mocked(validateProject).mockReturnValue(true);

    await expect(runThrowing(loadProjectFile(path))).rejects.toThrow(ProjectFileNotFoundError);
  });

  it("空ディレクトリの場合エラー", async () => {
    const path = "/path/to/directory";
    const filesOfDirectory: Dirent[] = [];

    jest.mocked(readdir).mockResolvedValue(filesOfDirectory);
    jest.mocked(resolve).mockReturnValue("/path/to/resolved/directory");
    jest.mocked(readFile).mockResolvedValue(Buffer.from(yamlText));
    // jest.mocked(validateProject).mockReturnValue(true);

    await expect(runThrowing(loadProjectFile(path))).rejects.toThrow(ProjectFileNotFoundError);
  });
});
