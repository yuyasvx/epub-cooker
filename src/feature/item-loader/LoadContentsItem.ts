import { PageLayoutType } from '../../enums/PageLayoutType';
import type { ResolvedPath } from '../../value/ResolvedPath';
import { EpubCookerEventType } from '../event-emitter';
import { _getEventEmitter } from '../event-emitter/InitEvent';
import type { LoadedProject } from '../project-loader';
import { loadFixedLayoutContents } from './loader/FixedLayoutContentsLoader';
import { loadReflowContents } from './loader/ReflowContentsLoader';

export function loadContentsItem(loadedProject: LoadedProject, saveTo: ResolvedPath) {
  _getEventEmitter().emit(EpubCookerEventType.BEGIN_ITEM_LOADER, loadedProject);
  const layoutType = loadedProject.projectDefinition.book['layout-type'];
  if (layoutType === PageLayoutType.reflow) {
    return loadReflowContents(loadedProject, saveTo);
  } else {
    return loadFixedLayoutContents(loadedProject, saveTo);
  }
}
