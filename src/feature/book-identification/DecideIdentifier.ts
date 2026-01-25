import { err } from 'neverthrow';
import { v4 } from 'uuid';
import { FileNotFoundError } from '../../lib/file-io/error/FileIoError';
import { getFile, save } from '../../lib/file-io/FileIo';
import { pipeNonNull } from '../../lib/util/EffectUtil';
import { BookMetadata, type UnidentifiedBookMetadata } from '../../value/BookMetadata';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
import { BookIdentificationError } from './BookIdentificationError';

export function decideIdentifier(projectDir: ResolvedPath, bookMetadata: BookMetadata | UnidentifiedBookMetadata) {
  return pipeNonNull((bookMetadata as BookMetadata).identifier)
    .asyncMap(async () => bookMetadata as BookMetadata)
    .orElse(() => {
      const identifierFilePath = resolvePath(projectDir, 'identifier');
      return getFile(identifierFilePath)
        .map((buffer) => {
          const identifier = buffer.toString();
          return BookMetadata({
            ...bookMetadata,
            identifier,
          });
        })
        .orElse((error) => {
          if (error instanceof FileNotFoundError) {
            const newIdentifier = `urn:uuid:${v4()}`;
            return save(identifierFilePath, newIdentifier).map(() =>
              BookMetadata({
                ...bookMetadata,
                identifier: newIdentifier,
              }),
            );
          }
          return err(error);
        })
        .mapErr((e) => new BookIdentificationError(e.path as ResolvedPath, e));
    });
}
