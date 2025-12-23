import { err } from 'neverthrow';
import { v4 } from 'uuid';
import { FileNotFoundError } from '../../lib/file-io/error/FileIoError';
import { getFile, save } from '../../lib/file-io/FileIo';
import { pipeNonNull } from '../../lib/util/EffectUtil';
import type { EpubProjectV2 } from '../../value/EpubProject';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
import { BookIdentificationError } from './BookIdentificationError';

export function decideIdentifier(project: EpubProjectV2, projectDir: ResolvedPath) {
  return pipeNonNull(project.metadata.identifier)
    .asyncMap(async () => project)
    .orElse(() => {
      const identifierFilePath = resolvePath(projectDir, 'identifier');
      return getFile(identifierFilePath)
        .map((buffer) => {
          const identifier = buffer.toString();
          const newProject: EpubProjectV2 = {
            ...project,
            metadata: {
              ...project.metadata,
              identifier,
            },
          };
          return newProject;
        })
        .orElse((error) => {
          if (error instanceof FileNotFoundError) {
            const newIdentifier = `urn:uuid:${v4()}`;
            return save(identifierFilePath, newIdentifier).map(() => {
              const newProject: EpubProjectV2 = {
                ...project,
                metadata: {
                  ...project.metadata,
                  identifier: newIdentifier,
                },
              };
              return newProject;
            });
          }
          return err(error);
        })
        .mapErr((e) => new BookIdentificationError('BookIdentificationError', e));
    });
}
