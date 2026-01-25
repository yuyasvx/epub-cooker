import { errAsync, okAsync } from 'neverthrow';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { NodeErrorType } from '../../enums/NodeJsErrorType';
import { PageLayoutType } from '../../enums/PageLayoutType';
import { SourceHandlingType } from '../../enums/SourceHandlingType';
import { FileIoError } from '../../lib/file-io/error/FileIoError';
import * as FileIo from '../../lib/file-io/FileIo';
import { rejecting, throwing } from '../../lib/util/EffectUtil';
import { BookConfiguration } from '../../value/BookConfiguration';
import { BookMetadata } from '../../value/BookMetadata';
import { BookSource } from '../../value/BookSource';
import { EpubProject } from '../../value/EpubProject';
import { resolvePath } from '../../value/ResolvedPath';
import * as BookIdentification from '../book-identification';
import { BookIdentificationError } from '../book-identification/BookIdentificationError';
import { loadProject } from './LoadProject';
import { BookProjectLoaderError, BookProjectLoaderErrorType } from './ProjectLoaderError';

vi.mock('../book-identification', async (importOriginal) => {
  const mod = await importOriginal<typeof BookIdentification>();
  return {
    ...mod,
    decideIdentifier: vi.fn((...args: Parameters<typeof mod.decideIdentifier>) => mod.decideIdentifier(...args)),
  };
});

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
          BookMetadata({ description: 'あらすじ', language: 'ja', title: '吾輩は猫である', identifier: 'id-test' }),
          BookSource(
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
          BookMetadata({
            identifier: 'hello-example',
            language: 'ja',
            title: '吾輩は猫である',
          }),
          BookSource(
            { sourceHandlingType: SourceHandlingType.markdown },
            resolvePath(__dirname, `../../../test/minimal-project/contents`),
          ),
          [],
          BookConfiguration(),
        ),
      ),
    });
  });
});

describe('translateError', () => {
  const dummyPath = resolvePath('/tmp/project');

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('FileIoError gets translated to BookProjectLoaderError(FileIo)', async () => {
    vi.spyOn(FileIo, 'getList').mockReturnValue(okAsync(['project.yml']));
    vi.spyOn(FileIo, 'getFile').mockReturnValue(
      errAsync(FileIoError.from('/tmp/project', NodeErrorType.PERMISSION_DENIED)),
    );

    await expect(rejecting(loadProject(dummyPath))).rejects.toThrow(BookProjectLoaderError);
    await expect(rejecting(loadProject(dummyPath))).rejects.toMatchObject({
      type: BookProjectLoaderErrorType.FileIo,
      detail: { filePath: '/tmp/project' },
    });
  });

  test('ProjectNotFoundError gets translated', async () => {
    vi.spyOn(FileIo, 'getList').mockReturnValue(okAsync([]));
    await expect(rejecting(loadProject(dummyPath))).rejects.toThrow(BookProjectLoaderError);
    await expect(rejecting(loadProject(dummyPath))).rejects.toMatchObject({
      type: BookProjectLoaderErrorType.ProjectNotFound,
      detail: { prjectDir: dummyPath },
    });
  });

  test('BookProjectSchemaParseError gets translated', async () => {
    vi.spyOn(FileIo, 'getList').mockReturnValue(okAsync(['project.yml']));
    vi.spyOn(FileIo, 'getFile').mockReturnValue(okAsync(Buffer.from('version: 2')));

    await expect(rejecting(loadProject(dummyPath))).rejects.toThrow(BookProjectLoaderError);
    await expect(rejecting(loadProject(dummyPath))).rejects.toMatchObject({
      type: BookProjectLoaderErrorType.BookProjectSchemaParse,
      detail: { keys: ['metadata', 'source'] },
    });
  });

  test('BookIdentificationError gets translated', async () => {
    vi.spyOn(FileIo, 'getList').mockReturnValue(okAsync(['project.yml']));
    vi.spyOn(FileIo, 'getFile').mockReturnValue(
      okAsync(
        Buffer.from(`
version: 2
metadata:
  title: test
  language: ja
source:
  using: markdown
`),
      ),
    );

    vi.mocked(BookIdentification.decideIdentifier).mockReturnValue(
      errAsync(new BookIdentificationError(dummyPath, new Error('mock error'))),
    );

    await expect(rejecting(loadProject(dummyPath))).rejects.toThrow(BookProjectLoaderError);
    await expect(rejecting(loadProject(dummyPath))).rejects.toMatchObject({
      type: BookProjectLoaderErrorType.BookIdentification,
      detail: undefined,
    });
  });

  test('IllegalBookSourceHandlingTypeError gets translated', async () => {
    vi.spyOn(FileIo, 'getList').mockReturnValue(okAsync(['project.yml']));
    vi.spyOn(FileIo, 'getFile').mockReturnValue(
      okAsync(
        Buffer.from(`
version: 2
metadata:
  title: test
  language: ja
book:
  layout-type: reflow
source:
  using: photo
`),
      ),
    );
    vi.mocked(BookIdentification.decideIdentifier).mockReturnValue(
      okAsync(BookMetadata({ title: 'test', language: 'ja', identifier: 'id' })),
    );

    await expect(rejecting(loadProject(dummyPath))).rejects.toThrow(BookProjectLoaderError);
    await expect(rejecting(loadProject(dummyPath))).rejects.toMatchObject({
      type: BookProjectLoaderErrorType.IllegalBookSourceHandlingType,
      detail: {
        layoutType: PageLayoutType.reflow,
        using: SourceHandlingType.photo,
      },
    });
  });
});
