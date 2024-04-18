import { parseISO } from "date-fns";
import { EpubProject } from "../../value/EpubProject";
import { PackageOpfXml } from "./PackageOpfXml";

const project: EpubProject = {
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

describe("PackageOpfXml", () => {
  it("読み込んだプロジェクト定義からOPFのXMLを生成できる", async () => {
    const date = parseISO("2014-02-11T11:30:30");
    const opf = PackageOpfXml.of(project, "TEST_ID");
    opf.setPublisedDate(date);

    expect(opf.toXml()).toBe(`<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<package xmlns=\"http://www.idpf.org/2007/opf\" version=\"3.0\" xml:lang=\"ja\" unique-identifier=\"book-id\" prefix=\"ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/\">
  <metadata xmlns:opf=\"http://www.idpf.org/2007/opf\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:dcterms=\"http://purl.org/dc/terms/\">
    <dc:title id=\"title\">吾輩は猫である</dc:title>
    <dc:creator id=\"creator\">夏目漱石</dc:creator>
    <dc:date>2014-02-11</dc:date>
    <dc:language id=\"language\">ja</dc:language>
    <meta property=\"ibooks:version\">3.0</meta>
    <meta property=\"ibooks:specified-fonts\">false</meta>
    <dc:identifier id=\"book-id\">TEST_ID</dc:identifier>
  </metadata>
  <manifest/>
  <spine page-progression-direction=\"ltr\"/>
</package>`);
  });

  it("出版日をnullにセットした場合、dc:dateタグが含まれないXMLになる", async () => {
    const opf = PackageOpfXml.of(project, "TEST_ID");
    opf.setPublisedDate(undefined);

    expect(opf.toXml()).toBe(`<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<package xmlns=\"http://www.idpf.org/2007/opf\" version=\"3.0\" xml:lang=\"ja\" unique-identifier=\"book-id\" prefix=\"ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/\">
  <metadata xmlns:opf=\"http://www.idpf.org/2007/opf\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:dcterms=\"http://purl.org/dc/terms/\">
    <dc:title id=\"title\">吾輩は猫である</dc:title>
    <dc:creator id=\"creator\">夏目漱石</dc:creator>
    <dc:language id=\"language\">ja</dc:language>
    <meta property=\"ibooks:version\">3.0</meta>
    <meta property=\"ibooks:specified-fonts\">false</meta>
    <dc:identifier id=\"book-id\">TEST_ID</dc:identifier>
  </metadata>
  <manifest/>
  <spine page-progression-direction=\"ltr\"/>
</package>`);
  });
});
