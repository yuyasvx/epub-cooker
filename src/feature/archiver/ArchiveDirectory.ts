import archiver, { type ArchiverError } from 'archiver';
import { createWriteStream } from 'node:fs';
import { rejects } from '../../lib/util/EffectUtil';
import type { EpubProjectV2 } from '../../value/EpubProject';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
import { EpubCookerEventType } from '../event-emitter';
import { _getEventEmitter } from '../event-emitter/InitEvent';

export function archiveDirectory(
  workingDir: ResolvedPath,
  saveDir: ResolvedPath,
  project: EpubProjectV2,
  enabled = true,
) {
  return rejects<ArchiverError>().run(
    () =>
      new Promise((resolve, reject) => {
        if (!enabled) {
          return resolve(undefined);
        }

        const sanitizedFileName = sanitizeFileName(project.metadata.title);
        const output = createWriteStream(resolvePath(saveDir, `${sanitizedFileName}`));
        const archive = archiver('zip');

        output.on('close', () => {
          _getEventEmitter().emit(EpubCookerEventType.FINISHED, project);

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
  );
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
