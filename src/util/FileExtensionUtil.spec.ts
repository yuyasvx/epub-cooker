import { changeExtension } from "./FileExtensionUtil";

describe("File Extension Util", () => {
  it.each`
    fileName                     | extension | expected
    ${"example.txt"}             | ${"html"} | ${"example.html"}
    ${"example.txt.md"}          | ${"html"} | ${"example.txt.html"}
    ${"example"}                 | ${"html"} | ${"example.html"}
    ${"/path/to/example.txt"}    | ${"html"} | ${"/path/to/example.html"}
    ${"/path/to/example.txt.md"} | ${"html"} | ${"/path/to/example.txt.html"}
    ${"/path/to/example"}        | ${"html"} | ${"/path/to/example.html"}
    ${""}                        | ${"html"} | ${".html"}
  `("'$fileName'に対して拡張子'$extension'を適用すると'$expected'になる", ({ fileName, extension, expected }) => {
    expect(changeExtension(fileName, extension)).toBe(expected);
  });
});
