import { BookType } from "../enums/BookType";
import { Case } from "../enums/Case";
import { ItemSortType } from "../enums/ItemSortType";
import { PageProgression } from "../enums/PageProgression";
import { BookMetadata } from "./BookMetadata";

export type EpubProject = Readonly<
  {
    version: number;
    bookMetadata: BookMetadata;
    additionalMetadata?: AdditionalMetadata[];
    identifier?: string;
    pageProgression: Case<typeof PageProgression>;
    useSpecifiedFonts: boolean;
    parseMarkdown: boolean;
  } & EpubDataDetail
>;

export type EpubDataDetail = {
  sourcePath: string;
  bookType?: Case<typeof BookType>;
  itemSortType?: Case<typeof ItemSortType>;
  tocPath?: string;
  visibleTocFile: boolean;
  coverImagePath?: string;
  cssPath?: string;
  include: string[];
  exclude: "auto" | string[];
  pages?: string[];
};

export type AdditionalMetadata<V = unknown> = Readonly<{
  key: string;
  value: V;
}>;
