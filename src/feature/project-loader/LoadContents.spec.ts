import { describe, expect, test } from 'vitest';
import { rejecting } from '../../lib/util/EffectUtil';
import { BookSource } from '../../value/BookSource';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
import { loadContents } from './LoadContents';

describe('loadContents', () => {
  test('projectDirとproject.source.contentsから、指定されたディレクトリのファイル一覧を取得する', async () => {
    const result = await rejecting(
      loadContents(
        resolvePath(__dirname, '../../../test/example-project'),
        makeProject(resolvePath(__dirname, '../../../test/example-project', 'contents')),
      ),
    );

    expect(result).toStrictEqual([
      resolvePath(__dirname, '../../../test/example-project/contents/resources/test2.txt'),
      resolvePath(__dirname, '../../../test/example-project/contents/test.txt'),
    ]);
  });

  test('projectDirとproject.source.contentsのディレクトリが見つからなかった場合、空の配列を返す', async () => {
    const result = await rejecting(
      loadContents(
        resolvePath(__dirname, '../../../test/example-project-2'),
        makeProject(resolvePath(__dirname, '../../../test/example-project-2', 'contents')),
      ),
    );

    expect(result).toStrictEqual([]);
  });
});

function makeProject(contentsDir: ResolvedPath): BookSource {
  return BookSource({}, contentsDir);
}
