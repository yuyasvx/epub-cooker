import type MarkdownIt from 'markdown-it';
import type { IToken } from './IToken';

type Nesting = 1 | 0 | -1;

/**
 * StateInline インターフェースがtype importできないのでここで定義し直す
 * @internal
 */
export interface IStateInline {
  src: string;
  env: unknown;
  md: MarkdownIt;
  tokens: IToken[];
  tokens_meta: Array<unknown | null>;

  pos: number;
  posMax: number;
  level: number;
  pending: string;
  pendingLevel: number;

  cache: unknown;

  delimiters: unknown[];
  pushPending(): IToken;

  push(type: string, tag: string, nesting: Nesting): IToken;
}
