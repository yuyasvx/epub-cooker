import { ParsedMarkdown } from "./ParsedMarkdown";

describe("ParsedMarkdown", () => {
  it("題名とMarkdownで書かれたテキストを受け入れて、HTML化することができる", () => {
    const title = "New Document";
    const markdown = `
# Readme

こんにちは。これは **Markdownで書かれた** テキストです。
`;
    const result = new ParsedMarkdown(markdown, undefined, title);

    expect(result.htmlSource).toBe(`<html xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>New Document</title><meta charset="UTF-8"></head>
<body>
<h1>Readme</h1>
<p>こんにちは。これは <strong>Markdownで書かれた</strong> テキストです。</p>

</body>
</html>`);
  });

  it("EPUB専用のXHTMLを生成できる", () => {
    const title = "New Document";
    const markdown = "# HELLO WORLD\n\n![an image](image.jpg)\n\nHELLO  \nWORLD.";
    const result = new ParsedMarkdown(markdown, undefined, title);

    expect(result.xhtmlString).toBe(`<?xml version="1.0" encoding="UTF-8"?><html xmlns:epub="http://www.idpf.org/2007/ops" xmlns="http://www.w3.org/1999/xhtml">
<head><title>New Document</title><meta charset="UTF-8"/></head>
<body>
<h1>HELLO WORLD</h1>
<p><img src="image.jpg" alt="an image"/></p>
<p>HELLO<br/>
WORLD.</p>

</body>
</html>`);
  });

  it("題名を指定しないと空文字", () => {
    const markdown = "# HELLO WORLD\n\n![an image](image.jpg)\n\nHELLO  \nWORLD.";
    const result = new ParsedMarkdown(markdown, undefined);
    expect(result.pageTitle).toHaveLength(0);
  });
});
