import yaml from 'yaml';
import * as FileIo from '../../lib/file-io/FileIo';
import { fails, rejects } from '../../lib/util/EffectUtil';
import { EpubProjectV2 } from '../../value/EpubProject';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
import { EpubCookerEventType } from '../event-emitter';
import { _getEventEmitter } from '../event-emitter/InitEvent';
import { loadContents } from './LoadContents';
import { EpubLoadProjectError, ProjectNotFoundError } from './ProjectLoaderError';
import type { LoadedProject } from './value/LoadedProject';

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
  return rejects<never>()
    .run(() => determineProjectFile(projectDir))
    .andThen((projectFilePath) =>
      fails<ProjectNotFoundError>().run(() => {
        if (projectFilePath == null) {
          throw new ProjectNotFoundError(projectDir);
        }
        return projectFilePath;
      }),
    )
    .andThen(FileIo.getFile)
    .map((buffer) => yaml.parse(buffer.toString()))
    .andThen(EpubProjectV2);
}

export function loadProject(projectDirPath: ResolvedPath) {
  return loadProjectDefinition(projectDirPath)
    .andThen((proj) =>
      loadContents(projectDirPath, proj).map(
        (contents) =>
          ({
            loadedFiles: contents,
            projectDefinition: proj,
            projectDir: projectDirPath,
            contentsDir: resolvePath(projectDirPath, proj.source.contents),
          }) satisfies LoadedProject,
      ),
    )
    .andTee((l) => {
      _getEventEmitter().emit(EpubCookerEventType.PROJECT_LOADED, l);
    })
    .mapErr((e) => new EpubLoadProjectError('EpubLoadProjectError', e));
}
