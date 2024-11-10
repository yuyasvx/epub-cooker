import { DOMParser } from "@xmldom/xmldom";
import { ParsedMarkup } from "./ParsedMarkup";

const domParser = new DOMParser();

type IParsedHtml = Readonly<{
  pageTitle: string;
  sourceText: string;
  resolvedCssPath: string | undefined;
}>;

/**
 * @internal
 */
export class ParsedHtml extends ParsedMarkup implements IParsedHtml {
  static from(schema: IParsedHtml) {
    const { sourceText, pageTitle } = schema;
    return new ParsedHtml(sourceText, pageTitle);
  }

  get dom() {
    if (this._dom == null) {
      this._dom = domParser.parseFromString(this.sourceText);
      this._dom.getElementsByTagName("html")[0].setAttribute("xmlns:epub", "http://www.idpf.org/2007/ops");
    }
    return this._dom;
  }

  constructor(
    readonly sourceText: string,
    readonly resolvedCssPath: string | undefined,
    readonly pageTitle: string = "",
  ) {
    super(resolvedCssPath);
  }
}
