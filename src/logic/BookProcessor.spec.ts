import { epubProject } from "../../test-util/CreateEpubProject";
import { createContext } from "./BookProcessor";
import { identify } from "./Identifier";

jest.mock("./Identifier");

describe("createContext", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("読み込んだプロジェクト定義と、属しているディレクトリから初期状態のコンテキストが作られる", async () => {
    jest.mocked(identify).mockResolvedValue("test_id");

    const baseDirectory = "/path/to/directory";

    const actual = await createContext(baseDirectory, epubProject());

    expect(actual.projectDirectory).toBe("/path/to/directory");
    expect(actual.workingDirectory).toBe("/path/to/directory/.working");
    expect(actual.dataSourceDirectory).toBe("/path/to/directory/data-directory");
    expect(actual.spineItems).toStrictEqual([]);
    expect(actual.loadedItems).toStrictEqual([]);
  });
});
