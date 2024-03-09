import { BookType } from "../src/domain/enums/BookType";
import { PageProgression } from "../src/domain/enums/PageProgression";
import { EpubProject } from "../src/domain/value/EpubProject";

export function epubProject(id?: string): EpubProject {
  return {
    bookMetadata: {
      title: "How To Write Test Code",
      language: "ja",
    },
    exclude: [],
    include: [],
    pageProgression: PageProgression.RTL,
    parseMarkdown: true,
    sourcePath: "/path/to/project/data",
    useSpecifiedFonts: false,
    version: 1,
    visibleTocFile: true,
    bookType: BookType.DOCUMENT,
    additionalMetadata: [],
    identifier: id,
  };
}
