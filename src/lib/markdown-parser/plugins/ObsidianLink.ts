import type MarkdownIt from 'markdown-it';
import * as path from 'node:path';
import { context } from '../MarkdownParser';
import type { IStateInline } from '../type-support/IStateInline';

/**
 * markdown-it プラグイン: Obsidianの内部リンクをHTMLの<a>タグに変換します。
 * @param md - markdown-itのインスタンス
 * @internal
 */
export function obsidianInternalLinks(md: MarkdownIt) {
  // 正規表現でObsidianの内部リンクをキャプチャします。
  // [[記事名]], [[記事名|表示テキスト]], [[記事名#見出し]], [[記事名#見出し|表示テキスト]]
  const OBSIDIAN_LINK_REGEX = /^\[\[([^|\]#]+)(?:#([^|\]]+))?(?:\|([^\]]+))?\]\]/;

  function obsidianLinkTokenizer(state: IStateInline, silent: boolean) {
    // 現在位置から始まる文字列が正規表現にマッチするかチェック
    const match = OBSIDIAN_LINK_REGEX.exec(state.src.slice(state.pos));
    if (!match) {
      return false;
    }

    // 分割代入を使用してマッチ結果を変数に割り当てます。
    const [fullMatch, articleNameRaw, headingRaw, displayTextRaw] = match;
    const articleName = articleNameRaw!.trim();
    const heading = headingRaw ? headingRaw.trim() : null;
    const displayText = displayTextRaw ? displayTextRaw.trim() : heading ? `${articleName}#${heading}` : articleName;

    // silentモードではトークンを生成せず、マッチの可否だけを返す
    if (!silent) {
      // リンク先のファイルを検索
      const targetFile = context.files.find((file) => {
        const fileNameWithoutExt = path.basename(file.filePath, path.extname(file.filePath));
        // 完全一致（またはパスを含む一致）をチェック
        // Obsidianはファイル名だけでもリンクできるし、フォルダパスを含めることもできる
        return (
          fileNameWithoutExt === articleName || file.filePath.endsWith(`${articleName}${path.extname(file.filePath)}`)
        );
      });

      let href = '';
      if (targetFile && context.currentFilePath) {
        // 現在のファイルからの相対パスを計算
        const relativePath = path.relative(path.dirname(context.currentFilePath), targetFile.filePath);
        // 拡張子を .xhtml に変更
        href = relativePath.replace(/\.md$/, '.xhtml');
      } else {
        // 見つからない場合はデフォルトの挙動
        href = `${articleName}.xhtml`;
      }

      if (heading) {
        // 見出しをURLのアンカー（#...）として使えるように変換
        const anchor = heading.toLowerCase().replace(/\s+/g, '-');
        href += `#${anchor}`;
      }

      // link_open トークン: <a> タグの開始
      const openToken = state.push('link_open', 'a', 1);
      openToken.attrSet('href', href);
      // CSSでスタイルを付けられるようにクラスを追加
      openToken.attrSet('class', 'internal-link');

      // text トークン: リンクの表示テキスト
      const textToken = state.push('text', '', 0);
      textToken.content = displayText;

      // link_close トークン: <a> タグの終了
      state.push('link_close', 'a', -1);
    }

    // パーサーの現在位置をマッチしたリンクの後ろに進める
    state.pos += fullMatch.length;
    return true;
  }

  // 標準の 'link' ルールより先にこのカスタムルールを適用する
  md.inline.ruler.before('link', 'obsidian_internal_link', obsidianLinkTokenizer);
}
