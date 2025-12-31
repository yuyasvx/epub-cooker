import type MarkdownIt from 'markdown-it';
import * as path from 'node:path';
import type { InputFileDetail } from '../../../value/InputFileDetail';
import type { IStateInline } from '../type-support/IStateInline';

/**
 * markdown-it プラグイン
 * @param md - markdown-itのインスタンス
 * @internal
 */
export function obsidianEmbedImage(md: MarkdownIt, { files }: { files: InputFileDetail[] }) {
  const OBSIDIAN_LINK_REGEX = /^!\[\[([^|\]#]+)(?:#([^|\]]+))?(?:\|([^\]]+))?\]\]/;

  function obsidianLinkTokenizer(state: IStateInline, silent: boolean) {
    // 現在位置から始まる文字列が正規表現にマッチするかチェック
    const match = OBSIDIAN_LINK_REGEX.exec(state.src.slice(state.pos));
    if (!match) {
      return false;
    }

    // 分割代入を使用してマッチ結果を変数に割り当てます。
    const [fullMatch, fileNameRaw, , optionsRaw] = match;
    const fileName = fileNameRaw!.trim();
    const options = optionsRaw ? optionsRaw.trim() : '';

    // silentモードではトークンを生成せず、マッチの可否だけを返す
    // ただし、ファイル検索などの重い処理は避けるべきだが、
    // ここでファイルが存在するか確認しないと、単なるテキストなのか埋め込みなのか判断できない可能性がある。
    // 今回は正規表現にマッチすれば埋め込み記法とみなして処理を進める。

    if (silent) {
      state.pos += fullMatch.length;
      return true;
    }

    const { currentFilePath } = state.env as Record<string, string>;

    // リンク先のファイルを検索
    const targetFile = files.find((file) => {
      const targetBaseName = path.basename(file.filePath, path.extname(file.filePath));
      const fileBaseName = path.basename(fileName, path.extname(fileName));

      // 拡張子がある場合は完全一致、ない場合は名前のみで一致を確認
      // かつ、画像ファイルであることを確認
      if (!file.fileType.startsWith('image/')) {
        return false;
      }

      if (path.extname(fileName)) {
        return file.filePath.endsWith(fileName) || path.basename(file.filePath) === fileName;
      }

      return targetBaseName === fileBaseName;
    });

    // 画像ファイルが見つからない場合はテキストとして出力する
    // falseを返すと ! がテキスト、 [[...]] がリンクとして処理されてしまうため、
    // ここで明示的にテキストトークンとして消費する。
    if (!targetFile || !currentFilePath) {
      if (!silent) {
        const textToken = state.push('text', '', 0);
        textToken.content = fullMatch;
      }
      state.pos += fullMatch.length;
      return true;
    }

    // 現在のファイルからの相対パスを計算
    const relativePath = path.relative(path.dirname(currentFilePath), targetFile.filePath);

    // image トークンを生成
    const token = state.push('image', 'img', 0);
    token.attrSet('src', relativePath);

    // オプション（リサイズ指定またはaltテキスト）の解析
    let altText = fileName; // デフォルトはファイル名
    if (options) {
      // リサイズ指定のチェック (例: 100, 100x200)
      const sizeMatch = options.match(/^(\d+)(?:x(\d+))?$/);
      if (sizeMatch) {
        const [, width, height] = sizeMatch;
        // widthは正規表現で必須グループなので必ず存在する
        if (width) {
          token.attrSet('width', width);
        }
        if (height) {
          token.attrSet('height', height);
        }
      } else {
        // 数字のみの指定でなければaltテキストとして扱う
        altText = options;
      }
    }

    token.content = altText;
    token.attrSet('alt', altText);

    // markdown-itのimageトークンはchildrenの内容をalt属性としてレンダリングするため、
    // childrenにテキストトークンを追加する
    const textToken = new state.Token('text', '', 0);
    textToken.content = altText;
    token.children = [textToken];

    // パーサーの現在位置をマッチしたリンクの後ろに進める
    state.pos += fullMatch.length;
    return true;
  }

  // 標準の 'link' ルールより先にこのカスタムルールを適用する
  // 画像埋め込みなので 'image' ルールより前が良いかもしれないが、
  // ![[...]] は通常の ![...](...) と競合しないので 'link' の前でも機能するはず。
  // ただし、MarkdownItの 'image' ルールは '![...]' をトリガーにするため、
  // 優先順位によっては競合する可能性もゼロではないが、'obsidian_embed' という独自ルール名で登録する。
  md.inline.ruler.before('image', 'obsidian_embed', obsidianLinkTokenizer);
}
