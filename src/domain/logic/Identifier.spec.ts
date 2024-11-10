import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "path";
import { v4 } from "uuid";
import { epubProject } from "../../../test-util/CreateEpubProject";
import { identify } from "./Identifier";

jest.mock("path");
jest.mock("node:fs/promises");
jest.mock("uuid");

describe("identify", () => {
  const directory = "/path/to/project";

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("プロジェクト定義内で指定されていれば、それをIDとする", async () => {
    jest.mocked(resolve).mockReturnValue("/resolved/path");

    expect(await identify(directory, epubProject("TEST_ID"))).toBe("TEST_ID");
    expect(jest.mocked(readFile).mock.calls.length).toBe(0);
    expect(jest.mocked(writeFile).mock.calls.length).toBe(0);
  });

  it("プロジェクト定義内になければ、'identifier'ファイルを読み込む", async () => {
    jest.mocked(resolve).mockReturnValue("/resolved/path");
    jest.mocked(readFile).mockResolvedValue(Buffer.from("ID_FROM_FILE", "utf8"));
    jest.mocked(writeFile).mockResolvedValue();

    expect(await identify(directory, epubProject(undefined))).toBe("ID_FROM_FILE");
    expect(jest.mocked(readFile).mock.calls.length).toBe(1);
    expect(jest.mocked(writeFile).mock.calls.length).toBe(0);
  });

  it("'identifier'ファイルが読み込めない場合は、UUIDを生成し'identifier'ファイルとして保存する", async () => {
    jest.mocked(resolve).mockReturnValue("/resolved/path");
    jest.mocked(readFile).mockRejectedValue("rejected");
    jest.mocked(v4).mockReturnValue("AAAAAAAA-BBBB-CCCC-DDDD-XXXXXXXXXXXX");
    jest.mocked(writeFile).mockResolvedValue();

    expect(await identify(directory, epubProject(undefined))).toBe("urn:uuid:AAAAAAAA-BBBB-CCCC-DDDD-XXXXXXXXXXXX");
    expect(jest.mocked(readFile).mock.calls.length).toBe(1);
    expect(jest.mocked(writeFile).mock.calls.length).toBe(1);
  });
});
