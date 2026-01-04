import yaml from 'yaml';
import * as FileIo from '../../lib/file-io/FileIo';
import { pipeNonNull, tryRejects, tryThrows } from '../../lib/util/EffectUtil';
import { EpubProjectV2 } from '../../value/EpubProject';
import { InputFileDetail } from '../../value/InputFileDetail';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
import { EpubCookerEventType } from '../event-emitter';
import { _getEventEmitter } from '../event-emitter/InitEvent';
import { loadContents } from './LoadContents';
import { EpubLoadProjectError, ProjectNotFoundError } from './ProjectLoaderError';
import type { LoadedPageOption, LoadedProject } from './value/LoadedProject';

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
    .andThen(EpubProjectV2);
}

function loadPageOptions(contentsDir: ResolvedPath, project: EpubProjectV2) {
  return pipeNonNull(project.source['page-options'])
    .map((options) =>
      options.map((option) => {
        const filePath = resolvePath(contentsDir, option.path);
        return [
          filePath,
          {
            filePath,
            spreadType: option['page-spread'],
          } satisfies LoadedPageOption,
        ] as const;
      }),
    )
    .map((l) => new Map(l))
    .unwrapOr(new Map<ResolvedPath, LoadedPageOption>());
}

export function loadProject(projectDirPath: ResolvedPath) {
  return loadProjectDefinition(projectDirPath)
    .andThen((proj) =>
      loadContents(projectDirPath, proj).map((contents) => {
        const contentsDir = resolvePath(projectDirPath, proj.source.contents);
        const pageOptions = loadPageOptions(contentsDir, proj);

        return {
          inputFiles: contents.map((c) => InputFileDetail(c, proj, contentsDir, pageOptions.get(c))),
          projectDefinition: proj,
          projectDir: projectDirPath,
          contentsDir,
        } satisfies LoadedProject;
      }),
    )
    .andTee((l) => {
      _getEventEmitter().emit(EpubCookerEventType.PROJECT_LOADED, l);
    })
    .mapErr((e) => new EpubLoadProjectError('EpubLoadProjectError', e));
}
