import { err } from 'neverthrow';
import { v4 } from 'uuid';
import { FileNotFoundError } from '../../lib/file-io/error/FileIoError';
import { getFile, save } from '../../lib/file-io/FileIo';
import { pipeNonNull } from '../../lib/util/EffectUtil';
import { EpubBookMetadata, type UnidentifiedEpubBookMetadata } from '../../value/EpubBookMetadata';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
import { BookIdentificationError } from './BookIdentificationError';

export function decideIdentifier(
  projectDir: ResolvedPath,
  bookMetadata: EpubBookMetadata | UnidentifiedEpubBookMetadata,
) {
  return pipeNonNull((bookMetadata as EpubBookMetadata).identifier)
    .asyncMap(async () => bookMetadata as EpubBookMetadata)
    .orElse(() => {
      const identifierFilePath = resolvePath(projectDir, 'identifier');
      return getFile(identifierFilePath)
        .map((buffer) => {
          const identifier = buffer.toString();
          return EpubBookMetadata({
            ...bookMetadata,
            identifier,
          });
        })
        .orElse((error) => {
          if (error instanceof FileNotFoundError) {
            const newIdentifier = `urn:uuid:${v4()}`;
            return save(identifierFilePath, newIdentifier).map(() =>
              EpubBookMetadata({
                ...bookMetadata,
                identifier: newIdentifier,
              }),
            );
          }
          return err(error);
        })
        .mapErr((e) => new BookIdentificationError('BookIdentificationError', e));
    });
}
