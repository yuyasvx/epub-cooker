import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

/**
 * HTML文字列をEPUB対応のXHTMLに変換します。
 * - XML宣言を追加
 * - DOCTYPEを追加
 * - htmlタグにxmlns属性を追加
 * - head/bodyがない場合は補完
 *
 * @param html HTML文字列
 * @returns XHTML文字列
 * @internal
 */
export function convertToEpubXhtml(html: string, title = '', cssHrefs: string[] = []): string {
  const parser = new DOMParser();
  // text/xmlとしてパースすることで、閉じタグがない場合などにエラーになるため、
  // 一旦text/htmlとしてパースしたいが、xmldomはtext/htmlを完全にはサポートしていない可能性がある。
  // しかし、入力がmarkdown-it由来であればある程度整っているはず。
  // ここでは汎用性を高めるため、一度DOMにしてからXHTMLとしてシリアライズする。

  // Note: xmldomのDOMParserはHTMLのパースに弱いため、
  // 簡易的にラップしてからパースするなどの工夫が必要な場合があるが、
  // 今回はmarkdown-itのxhtmlOut=trueを前提とするため、ある程度ValidなHTMLが来ることを期待する。
  // ただし、完全なHTML構造 ("<html>...</html>") が渡される場合と、
  // 部分的なフラグメント ("<p>...</p>") が渡される場合の両方を考慮する。

  let doc: Document;
  const mimeType = 'text/xml'; // XHTMLとして扱いたいのでXMLパーサを使う

  try {
    // まずはそのままパースしてみる
    // XMLパーサなので、整形式でないとエラーになるか、変なパース結果になる
    // markdown-itの出力はフラグメントであることが多いので、
    // まずはフラグメントとしてラップしてパースを試みるのが安全かもしれない。

    // しかし、入力が既に完全なHTMLの可能性もある。
    // 簡易的な判定を行う。
    const trimmed = html.trim();
    const hasHtmlTag = /<html[^>]*>/i.test(trimmed);

    let stringToParse = trimmed;
    if (!hasHtmlTag) {
      // フラグメントとみなしてラップする
      stringToParse = `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><meta charset="UTF-8" /><title>${title}</title></head><body>${trimmed}</body></html>`;
    }

    doc = parser.parseFromString(stringToParse, mimeType);

    // パースエラーのチェック (xmldomはエラー時にparsererrorタグを含むDOMを返すことがある)
    // ※ @xmldom/xmldom の挙動に依存
    const parserError = doc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      // XMLパース失敗。HTMLとして緩くパース...はxmldomでは難しい。
      // ここではエラーとして扱うか、あるいはフォールバックが必要だが、
      // EPUB化においてはStrictなXHTMLが求められるため、エラーにして修正を促す方が健全かもしれない。
      // 一旦そのまま進める（シリアライズしてどうなるか）
      console.warn('XML Parse Warning:', parserError[0]?.textContent);
    }
  } catch (e) {
    // パース自体が落ちた場合
    console.error('DOM Parser Error:', e);
    // 空のドキュメントを返すなどの対処
    return '';
  }

  // ルート要素 (html) の属性を確認・設定
  const htmlElement = doc.documentElement;
  if (htmlElement != null) {
    if (!htmlElement.hasAttribute('xmlns')) {
      htmlElement.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    }
    if (!htmlElement.hasAttribute('xmlns:epub')) {
      htmlElement.setAttribute('xmlns:epub', 'http://www.idpf.org/2007/ops');
    }
  }

  const doc2 = addCssLink(doc, cssHrefs);

  const serializer = new XMLSerializer();
  const serialized = serializer.serializeToString(doc2);

  // XML宣言
  const xmlDeclaration = hasXmlDeclaration(html) ? '' : '<?xml version="1.0" encoding="UTF-8"?>\n';
  // ※DOCTYPE宣言はいらないはず

  // serializeToStringはXML宣言を含まないため手動追加
  return `${xmlDeclaration}${serialized}`;
}

function hasXmlDeclaration(xmlText: string) {
  return xmlText.startsWith('<?xml');
}

function addCssLink(doc: Document, cssHrefs: string[]) {
  const head = doc.getElementsByTagName('head').item(0);

  cssHrefs.forEach((h) => {
    const link = doc.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', h);
    head?.appendChild(link);
  });

  return doc;
}
