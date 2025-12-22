import { errAsync, okAsync } from 'neverthrow';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { NodeErrorType } from '../../enums/NodeJsErrorType';
import { FileIoError } from '../../lib/file-io/error/FileIoError';
import * as FileIo from '../../lib/file-io/FileIo';
import { EpubProjectV2 } from '../../value/EpubProject';
import { resolvePath } from '../../value/ResolvedPath';
import { decideIdentifier } from './DecideIdentifier';

// Mock dependencies
vi.mock('../../lib/file-io/FileIo');
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

describe('decideIdentifier', () => {
  const projectDir = resolvePath('/tmp/test-project');
  const identifierFilePath = resolvePath(projectDir, 'identifier');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('読み込んだプロジェクト定義の`metadata.identifier`があればそのまま返す', async () => {
    const project = EpubProjectV2({
      version: 2,
      metadata: {
        title: 'Test Book',
        language: 'ja',
        identifier: 'existing-id',
      },
      source: { using: 'none' },
    })._unsafeUnwrap();

    const result = await decideIdentifier(project, projectDir);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().metadata.identifier).toBe('existing-id');
    expect(FileIo.getFile).not.toHaveBeenCalled();
  });

  test('プロジェクト定義に識別子が書かれていなければ、所定の場所の`identifier`ファイルの内容を識別子とする', async () => {
    const project = EpubProjectV2({
      version: 2,
      metadata: {
        title: 'Test Book',
        language: 'ja',
      },
      source: { using: 'none' },
    })._unsafeUnwrap();

    vi.mocked(FileIo.getFile).mockReturnValue(okAsync(Buffer.from('file-id')));

    const result = await decideIdentifier(project, projectDir);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().metadata.identifier).toBe('file-id');
    expect(FileIo.getFile).toHaveBeenCalledWith(identifierFilePath);
  });

  test('識別子がどこにもなければ、識別子を決定して`identifier`ファイルとして保存する', async () => {
    const project = EpubProjectV2({
      version: 2,
      metadata: {
        title: 'Test Book',
        language: 'ja',
      },
      source: { using: 'none' },
    })._unsafeUnwrap();

    vi.mocked(FileIo.getFile).mockReturnValue(
      errAsync(FileIoError.from('path', NodeErrorType.NO_SUCH_FILE_OR_DIRECTORY)),
    );
    vi.mocked(FileIo.save).mockReturnValue(okAsync(undefined));

    const result = await decideIdentifier(project, projectDir);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().metadata.identifier).toBe('urn:uuid:mock-uuid');
    expect(FileIo.getFile).toHaveBeenCalledWith(identifierFilePath);
    expect(FileIo.save).toHaveBeenCalledWith(identifierFilePath, 'urn:uuid:mock-uuid');
  });
});
