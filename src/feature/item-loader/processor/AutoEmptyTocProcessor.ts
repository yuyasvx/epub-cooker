import { EpubCookerError } from '../../../error/EpubCookerError';
import * as FileIo from '../../../lib/file-io/FileIo';
import { parseMarkdown } from '../../../lib/markdown-parser/MarkdownParser';
import { pipe } from '../../../lib/util/EffectUtil';
import { convertToEpubXhtml } from '../../../lib/xhtml-converter/HtmlUtil';
import { ItemPath } from '../../../value/ItemPath';
import { type ResolvedPath, resolvePath } from '../../../value/ResolvedPath';

/**
 * @internal
 */
export const runAutoEmptyTocItemProcessor = (saveDir: ResolvedPath) =>
  pipe('<nav epub:type="toc" id="toc" />')
    .map(parseMarkdown)
    .map(
      (parsed) =>
        ({
          ...parsed,
          title: 'toc',
        }) as const,
    )
    .map(({ htmlText, title }) => {
      const itemPath = ItemPath('_generated/toc.xhtml');

      return {
        serializedXhtml: convertToEpubXhtml(htmlText, title),
        itemPath,
      } as const;
    })
    .asyncAndThen(({ itemPath, serializedXhtml }) =>
      FileIo.save(resolvePath(saveDir, itemPath), serializedXhtml).map(() => itemPath),
    )
    .mapErr((e) => new EpubCookerError('MarkdownItemProcessor', e));
