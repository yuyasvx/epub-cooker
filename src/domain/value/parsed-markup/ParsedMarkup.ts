import { XMLSerializer } from "@xmldom/xmldom";

const xmlSerializer = new XMLSerializer();

/**
 * @internal
 */
export abstract class ParsedMarkup {
  protected _dom?: Document;

  /**
   * HTMLとしてパースしたデータの中身
   */
  abstract get dom(): Document;

  /**
   * XHTML形式の文字列
   *
   * ファイルとして保存する処理とかを実装したいときはこれを呼ぶことになる
   */
  get xhtmlString() {
    return `<?xml version="1.0" encoding="UTF-8"?>${xmlSerializer.serializeToString(this.dom)}`;
  }

  constructor(readonly resolvedCssPath: string | undefined) {
    this.addCssLink();
  }

  protected addCssLink() {
    if (this.resolvedCssPath == null) {
      return;
    }
    const linkTag = this.dom.createElement("link");
    linkTag.setAttribute("rel", "stylesheet");
    linkTag.setAttribute("href", this.resolvedCssPath);

    const headTag = this.dom.getElementsByTagName("head").item(0);
    if (headTag != null) {
      headTag.appendChild(linkTag);
    }
  }
}
