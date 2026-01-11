import { describe, expect, test } from 'vitest';
import { SourceHandlingType } from '../../enums/SourceHandlingType';
import { rejecting, throwing } from '../../lib/util/EffectUtil';
import { EpubBookConfiguration } from '../../value/EpubBookConfiguration';
import { EpubBookMetadata } from '../../value/EpubBookMetadata';
import { EpubBookSource } from '../../value/EpubBookSource';
import { EpubProject } from '../../value/EpubProject';
import { resolvePath } from '../../value/ResolvedPath';
import { loadProject } from './LoadProject';

describe('loadProject', () => {
  test.each`
    targetPath | description
    ${'1'}     | ${'ファイル名が小文字yml'}
    ${'2'}     | ${'ファイル名が小文字yaml'}
    ${'3'}     | ${'ファイル名が大文字YML'}
    ${'4'}     | ${'ファイル名が大文字YAML'}
  `('determineProjectFile / $descriptionでもプロジェクトが読み込める', async ({ targetPath }) => {
    const result = await rejecting(
      loadProject(resolvePath(__dirname, `../../../test/determine-project-file/${targetPath}`)),
    );
    expect(result).toStrictEqual({
      inputFiles: [],
      project: throwing(
        EpubProject(
          resolvePath(__dirname, `../../../test/determine-project-file/${targetPath}`),
          EpubBookMetadata({ description: 'あらすじ', language: 'ja', title: '吾輩は猫である', identifier: 'id-test' }),
          EpubBookSource(
            { sourceHandlingType: 'markdown', coverImagePath: undefined, cssPath: undefined, tocPath: undefined },
            resolvePath(__dirname, `../../../test/determine-project-file/${targetPath}/contents`),
          ),
          [],
        ),
      ),
    });
  });

  test('必須項目以外省略した場合、初期値がセットされている', async () => {
    const result = await rejecting(loadProject(resolvePath(__dirname, `../../../test/minimal-project`)));

    expect(result).toStrictEqual({
      inputFiles: [],
      project: throwing(
        EpubProject(
          resolvePath(__dirname, `../../../test/minimal-project`),
          EpubBookMetadata({
            identifier: 'hello-example',
            language: 'ja',
            title: '吾輩は猫である',
          }),
          EpubBookSource(
            { sourceHandlingType: SourceHandlingType.markdown },
            resolvePath(__dirname, `../../../test/minimal-project/contents`),
          ),
          [],
          EpubBookConfiguration(),
        ),
      ),
    });
  });
});
