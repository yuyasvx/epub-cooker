import { err, ok } from 'neverthrow';
import { beforeEach, describe, expect, type Mock, test, vi } from 'vitest';
import { NodeErrorType } from '../../../enums/NodeJsErrorType';
import { EpubCookerError } from '../../../error/EpubCookerError';
import { FileIoError } from '../../../lib/file-io/error/FileIoError';
import * as FileIo from '../../../lib/file-io/FileIo';
import type { ResolvedPath } from '../../../value/ResolvedPath';
import { IllegalFileTypeError } from './ItemProcessor';
import { runMarkdownItemProcessor } from './MarkdownItemProcessor';

// Mock dependencies
vi.mock('../../../lib/file-io/FileIo');

describe('MarkdownItemProcessor', () => {
  const sourcePath = '/abs/path/to/project/docs/page.md' as ResolvedPath;
  const projectDir = '/abs/path/to/project' as ResolvedPath;
  const saveDir = '/abs/path/to/project/.working' as ResolvedPath;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Markdownファイルを読み込んでXHTMLに変換し、保存する', async () => {
    const mockContent = Buffer.from('# Hello');
    const expectedXhtml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\"><head><meta charset=\"UTF-8\"/><title>docs/page</title></head><body><h1>Hello</h1></body></html>`;

    (FileIo.getFile as Mock).mockReturnValue(ok(mockContent));
    (FileIo.save as Mock).mockReturnValue(ok(undefined));

    const result = await runMarkdownItemProcessor(sourcePath, projectDir, saveDir);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe('docs/page.xhtml');

    expect(FileIo.getFile).toHaveBeenCalledWith(sourcePath);
    expect(FileIo.save).toHaveBeenCalledWith('/abs/path/to/project/.working/docs/page.xhtml', expectedXhtml);
  });

  test('Markdownファイルと認識できない場合はエラー', async () => {
    const invalidFile = '/abs/path/to/image.png' as ResolvedPath;

    const result = await runMarkdownItemProcessor(invalidFile, projectDir, saveDir);

    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(EpubCookerError);
    expect(error.cause).toBeInstanceOf(IllegalFileTypeError);
  });

  test('ファイル読み込みが失敗したらエラー', async () => {
    const error = FileIoError.from(sourcePath, NodeErrorType.NO_SUCH_FILE_OR_DIRECTORY, new Error('Read error'));
    (FileIo.getFile as Mock).mockReturnValue(err(error));

    const result = await runMarkdownItemProcessor(sourcePath, projectDir, saveDir);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(EpubCookerError);
  });

  test('ファイル書き込みが失敗したらエラー', async () => {
    const mockContent = Buffer.from('# Hello');
    (FileIo.getFile as Mock).mockReturnValue(ok(mockContent));
    const error = FileIoError.from('Save error', NodeErrorType.PERMISSION_DENIED, new Error('Write error'));
    (FileIo.save as Mock).mockReturnValue(err(error));

    const result = await runMarkdownItemProcessor(sourcePath, projectDir, saveDir);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(EpubCookerError);
  });
});
