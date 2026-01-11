import yaml from 'yaml';
import * as FileIo from '../../lib/file-io/FileIo';
import { pipe, tryRejects, tryThrows, unwrap } from '../../lib/util/EffectUtil';
import type { EpubBookSourcePageOption } from '../../value/EpubBookSource';
import { EpubProject } from '../../value/EpubProject';
import { EpubProjectSchemaV2 } from '../../value/EpubProjectSchemaV2';
import { InputFileDetail } from '../../value/InputFileDetail';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
import { decideIdentifier } from '../book-identification';
import { loadContents } from './LoadContents';
import { EpubLoadProjectError, ProjectNotFoundError } from './ProjectLoaderError';

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

function groupPageOptions(pages: EpubBookSourcePageOption[]) {
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
    .mapErr((e) => new EpubLoadProjectError('EpubLoadProjectError', e));
}
