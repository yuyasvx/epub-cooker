import { describe, expect, test } from 'vitest';
import { rejecting } from '../../lib/util/EffectUtil';
import type { EpubProjectV2 } from '../../value/EpubProject';
import { resolvePath } from '../../value/ResolvedPath';
import { loadContents } from './LoadContents';

describe('loadContents', () => {
  test('projectDirとproject.source.contentsから、指定されたディレクトリのファイル一覧を取得する', async () => {
    const result = await rejecting(
      loadContents(resolvePath(__dirname, '../../../test/example-project'), makeProject('contents')),
    );

    expect(result).toStrictEqual([
      resolvePath(__dirname, '../../../test/example-project/contents/resources/test2.txt'),
      resolvePath(__dirname, '../../../test/example-project/contents/test.txt'),
    ]);
  });

  test('projectDirとproject.source.contentsのディレクトリが見つからなかった場合、空の配列を返す', async () => {
    const result = await rejecting(
      loadContents(resolvePath(__dirname, '../../../test/example-project-2'), makeProject('contents')),
    );

    expect(result).toStrictEqual([]);
  });
});

function makeProject(contentsDir: string): EpubProjectV2 {
  return {
    'additional-metadata': [],
    metadata: {
      language: 'ja',
      title: 'title',
      'published-date': '',
      author: '',
      description: '',
      identifier: '',
      publisher: '',
    },
    source: {
      'ignore-patterns': [],
      contents: contentsDir,
      'toc-page-path': '',
      using: 'none',
      'ignore-unknown-file-type': true,
      'ignore-system-file': true,
    },
    version: 2,
    book: {
      'layout-type': 'reflow',
      'page-progression-direction': 'ltr',
      'use-specified-fonts': false,
    },
  } satisfies EpubProjectV2;
}
