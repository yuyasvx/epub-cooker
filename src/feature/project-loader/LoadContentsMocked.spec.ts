import { okAsync } from 'neverthrow';
import { Dirent } from 'node:fs';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as FileIo from '../../lib/file-io/FileIo';
import { throwing } from '../../lib/util/EffectUtil';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
import { loadContents } from './LoadContents';

vi.mock('../../lib/file-io/FileIo');

describe('loadProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("'ignore-system-file'が有効な場合、システムファイルは無視される", async () => {
    const projectDirPath = resolvePath('/test/project');
    const contentsDirPath = resolvePath('/test/project/contents');

    vi.mocked(FileIo.getListDetails).mockImplementation((path: ResolvedPath) => {
      if (path === contentsDirPath) {
        return okAsync([
          dirent('.DS_Store'),
          dirent('.abc'),
          dirent('.def'),
          dirent('.aaaa'),
          dirent('Thumbs.db'),
          dirent('desktop.ini'),
          dirent('Text.md'),
        ]);
      }
      // projectDirPathの場合はproject.ymlを返すなど、必要に応じて実装を追加
      return okAsync([]);
    });

    vi.mocked(FileIo.getList).mockReturnValue(okAsync([`project.yml`]));

    const result = await loadContents(projectDirPath, {
      version: 2,
      metadata: {
        title: 'title',
        language: 'ja',
      },
      book: {
        'page-progression-direction': 'ltr',
        'use-specified-fonts': false,
        'layout-type': 'reflow',
      },
      source: {
        using: 'markdown',
        'ignore-patterns': [],
        'ignore-unknown-file-type': false,
        'ignore-system-file': true,
        contents: 'contents',
      },
    });

    expect(result.isOk()).toBe(true);
    const files = throwing(result);
    const expectedFiles: ResolvedPath[] = [resolvePath('/test/project/contents/Text.md')];
    expect(files).toEqual(expectedFiles);
  });

  test('プロジェクト定義で指定されたパターンに該当するファイルは無視', async () => {
    const projectDirPath = resolvePath('/test/project');
    const contentsDirPath = resolvePath('/test/project/contents');

    vi.mocked(FileIo.getListDetails).mockImplementation((path: ResolvedPath) => {
      if (path === contentsDirPath) {
        return okAsync([dirent('Text1.md'), dirent('Text2.md'), dirent('Text3.md'), dirent('ignore-file.md')]);
      }
      // projectDirPathの場合はproject.ymlを返すなど、必要に応じて実装を追加
      return okAsync([]);
    });

    vi.mocked(FileIo.getList).mockReturnValue(okAsync([`project.yml`]));

    const result = await loadContents(projectDirPath, {
      version: 2,
      metadata: {
        title: 'title',
        language: 'ja',
      },
      book: {
        'page-progression-direction': 'ltr',
        'use-specified-fonts': false,
        'layout-type': 'reflow',
      },
      source: {
        using: 'markdown',
        'ignore-patterns': ['ignore-file.md'],
        'ignore-unknown-file-type': false,
        'ignore-system-file': false,
        contents: 'contents',
      },
    });

    expect(result.isOk()).toBe(true);
    const files = throwing(result);
    const expectedFiles: ResolvedPath[] = [
      resolvePath('/test/project/contents/Text1.md'),
      resolvePath('/test/project/contents/Text2.md'),
      resolvePath('/test/project/contents/Text3.md'),
    ];
    expect(files).toEqual(expectedFiles);
  });
});

function dirent(name: string, isDirectory = false, isFile = true) {
  const d = new Dirent();
  d.name = name;
  d.parentPath = '/root/path';
  vi.spyOn(d, 'isDirectory').mockReturnValue(isDirectory);
  vi.spyOn(d, 'isFile').mockReturnValue(isFile);
  return d;
}
