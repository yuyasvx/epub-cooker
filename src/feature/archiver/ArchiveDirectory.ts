import archiver, { type ArchiverError } from 'archiver';
import { createWriteStream } from 'node:fs';
import { tryRejects } from '../../lib/util/EffectUtil';
import type { BookMetadata } from '../../value/BookMetadata';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
import { EpubCookerEventCode } from '../event-emitter';
import { _getEventEmitter } from '../event-emitter/InitEvent';
import { BookArchiverError } from './error/BookArchiverError';

export function archiveDirectory(
  workingDir: ResolvedPath,
  saveDir: ResolvedPath,
  metadata: BookMetadata,
  enabled = true,
) {
  const sanitizedFileName = sanitizeFileName(metadata.title);
  const destination = resolvePath(saveDir, `${sanitizedFileName}`);

  return tryRejects<ArchiverError>()(
    () =>
      new Promise((resolve, reject) => {
        if (!enabled) {
          return resolve(undefined);
        }

        const output = createWriteStream(destination);
        const archive = archiver('zip');

        output.on('close', () => {
          _getEventEmitter().emit(EpubCookerEventCode.FINISHED, resolvePath(saveDir, `${sanitizedFileName}`));

          return resolve(undefined);
        });

        archive.on('error', (err) => reject(err));

        archive.append('application/epub+zip', {
          store: true,
          name: 'mimetype',
        });

        archive.glob('*', { cwd: resolvePath(workingDir), ignore: 'mimetype' });
        archive.glob('**/*', { cwd: resolvePath(workingDir) });
        archive.pipe(output);

        archive.finalize();
      }),
  ).mapErr((e) => new BookArchiverError(workingDir, destination, e));
}

/**
 * ファイル名のサニタイズ
 *
 * - WindowsやMacのファイルシステムで使っていけない記号を全て`_`に変換します
 * - ファイル名が`.epub`で終わっていない場合は、追加します。
 *
 * @param fileName ファイル名
 * @returns 変換済みのファイル名文字列
 */
function sanitizeFileName(fileName: string) {
  const nm = fileName.endsWith('.epub') ? fileName.substring(0, fileName.length - 5) : fileName;

  return `${nm.replace(/[\:\\\/\*\?\"\<\>\|]\./, '_')}.epub`;
}
