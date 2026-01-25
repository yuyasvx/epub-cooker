import yaml from 'yaml';
import { BookProjectSchemaParseError } from '../../error/BookProjectSchemaParseError';
import type { IllegalBookSourceHandlingTypeError } from '../../error/IllegalBookSourceHandlingTypeError';
import { FileIoError } from '../../lib/file-io/error/FileIoError';
import * as FileIo from '../../lib/file-io/FileIo';
import { pipe, tryRejects, tryThrows, unwrap } from '../../lib/util/EffectUtil';
import type { BookPageDetail } from '../../value/BookSource';
import { EpubProject } from '../../value/EpubProject';
import { EpubProjectSchemaV2 } from '../../value/EpubProjectSchemaV2';
import { InputFileDetail } from '../../value/InputFileDetail';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
import { BookIdentificationError, decideIdentifier } from '../book-identification';
import { EpubCookerEventType } from '../event-emitter';
import { _getEventEmitter } from '../event-emitter/InitEvent';
import { loadContents } from './LoadContents';
import { BookProjectLoaderError, BookProjectLoaderErrorType, ProjectNotFoundError } from './ProjectLoaderError';

function determineProjectFile(projectDir: ResolvedPath) {
  return FileIo.getList(projectDir)
    .map((fileNames) =>
      fileNames
        .filter((fileName) => {
          const normalized = fileName.toLowerCase();
          return normalized.endsWith('project.yml') || normalized.endsWith('project.yaml');
        })
        .map((fileName) => resolvePath(projectDir, fileName)),
    )
    .map((fileNames) => fileNames[0])
    .unwrapOr(undefined);
}

function loadProjectDefinition(projectDir: ResolvedPath) {
  return tryRejects<never>()(() => determineProjectFile(projectDir))
    .andThen((projectFilePath) =>
      tryThrows<ProjectNotFoundError>()(() => {
        if (projectFilePath == null) {
          throw new ProjectNotFoundError(projectDir);
        }
        return projectFilePath;
      }),
    )
    .andThen(FileIo.getFile)
    .map((buffer) => yaml.parse(buffer.toString()))
    .andThen(EpubProjectSchemaV2)
    .map((schema) => EpubProjectSchemaV2.toValues(projectDir, schema));
}

function groupPageOptions(pages: BookPageDetail[]) {
  return unwrap(pipe(pages.map((p) => [p.pagePath, p] as const)).map((l) => new Map(l)));
}

export function loadProject(projectDirPath: ResolvedPath) {
  return loadProjectDefinition(projectDirPath)
    .andThen(({ bookAdditionaMetadata, bookConfig, bookMetadata, bookSource, projectDir }) =>
      decideIdentifier(projectDir, bookMetadata).andThen((metadata) =>
        EpubProject(projectDirPath, metadata, bookSource, bookAdditionaMetadata, bookConfig),
      ),
    )
    .andThen((project) =>
      loadContents(projectDirPath, project.source)
        .map((paths) => {
          const pageOptions = groupPageOptions(project.source.pages);
          return paths.map((p) => InputFileDetail(p, project.source, pageOptions.get(p)));
        })
        .map((inputs) => ({
          inputFiles: inputs,
          project,
        })),
    )
    .andTee(({ inputFiles, project }) => {
      _getEventEmitter().emit(EpubCookerEventType.PROJECT_LOADED, {
        bookMetadata: project.metadata,
        bookSource: project.source,
        inputFiles,
      });
    })
    .mapErr((error) => translateError(error));
}

function translateError(
  error:
    | FileIoError
    | ProjectNotFoundError
    | BookProjectSchemaParseError
    | BookIdentificationError
    | IllegalBookSourceHandlingTypeError,
) {
  if (error instanceof FileIoError) {
    return new BookProjectLoaderError(BookProjectLoaderErrorType.FileIo, { filePath: error.path }, error);
  }

  if (error instanceof ProjectNotFoundError) {
    return new BookProjectLoaderError(
      BookProjectLoaderErrorType.ProjectNotFound,
      { prjectDir: error.projectDir },
      error,
    );
  }

  if (error instanceof BookProjectSchemaParseError) {
    return new BookProjectLoaderError(
      BookProjectLoaderErrorType.BookProjectSchemaParse,
      { keys: error.details.map((d) => d.path.join('.')) },
      error,
    );
  }

  if (error instanceof BookIdentificationError) {
    return new BookProjectLoaderError(BookProjectLoaderErrorType.BookIdentification, undefined, error);
  }

  return new BookProjectLoaderError(
    BookProjectLoaderErrorType.IllegalBookSourceHandlingType,
    {
      layoutType: error.layoutType,
      using: error.using,
    },
    error,
  );
}
