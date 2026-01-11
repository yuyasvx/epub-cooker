import { PageLayoutType } from '../../enums/PageLayoutType';
import type { EpubProject } from '../../value/EpubProject';
import type { InputFileDetail } from '../../value/InputFileDetail';
import type { ResolvedPath } from '../../value/ResolvedPath';
import { EpubCookerEventType } from '../event-emitter';
import { _getEventEmitter } from '../event-emitter/InitEvent';
import { loadFixedLayoutContents } from './loader/FixedLayoutContentsLoader';
import { loadReflowContents } from './loader/ReflowContentsLoader';

export function loadContentsItem(project: EpubProject, inputFiles: InputFileDetail[], saveTo: ResolvedPath) {
  _getEventEmitter().emit(EpubCookerEventType.BEGIN_ITEM_LOADER, {
    inputFiles,
  });

  if (project.config.layoutType === PageLayoutType.reflow) {
    return loadReflowContents(project, inputFiles, saveTo).andTee(() => {
      _getEventEmitter().emit(EpubCookerEventType.END_ITEM_LOADER);
    });
  } else {
    return loadFixedLayoutContents(project, inputFiles, saveTo).andTee(() => {
      _getEventEmitter().emit(EpubCookerEventType.END_ITEM_LOADER);
    });
  }
}
