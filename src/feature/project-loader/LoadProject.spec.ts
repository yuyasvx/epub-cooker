import { describe, expect, test } from 'vitest';
import { PageLayoutType } from '../../enums/PageLayoutType';
import { PageProgressionDirectionType } from '../../enums/PageProgressionDirectionType';
import { PageSizeType } from '../../enums/PageSizeType';
import { rejecting } from '../../lib/util/EffectUtil';
import { resolvePath } from '../../value/ResolvedPath';
import { loadProject } from './LoadProject';
import type { LoadedProject } from './value/LoadedProject';

describe('loadProject', () => {
  test.each`
    targetPath | description
    ${'1'}     | ${'ファイル名が小文字yml'}
    ${'2'}     | ${'ファイル名が小文字yaml'}
    ${'3'}     | ${'ファイル名が大文字YML'}
    ${'4'}     | ${'ファイル名が大文字YAML'}
  `('determineProjectFile / $descriptionでもプロジェクトが読み込める', async ({ targetPath }) => {
    const file = await rejecting(
      loadProject(resolvePath(__dirname, `../../../test/determine-project-file/${targetPath}`)),
    );
    expect(file).toStrictEqual({
      loadedFiles: [],
      projectDefinition: {
        metadata: {
          description: 'あらすじ',
          language: 'ja',
          title: '吾輩は猫である',
        },
        book: {
          fixed: {
            'page-size': PageSizeType.auto,
          },
          'layout-type': PageLayoutType.reflow,
          'page-progression-direction': PageProgressionDirectionType.ltr,
          'use-specified-fonts': false,
        },
        source: {
          contents: 'contents',
          'ignore-patterns': [],
          using: 'markdown',
          'ignore-unknown-file-type': true,
          'ignore-system-file': true,
        },
        version: 2,
      },
      projectDir: resolvePath(__dirname, `../../../test/determine-project-file/${targetPath}`),
      contentsDir: resolvePath(__dirname, `../../../test/determine-project-file/${targetPath}/contents`),
    } satisfies LoadedProject);
  });
});
