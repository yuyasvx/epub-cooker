import { PageLayoutType } from '../../enums/PageLayoutType';
import { FileIoError } from '../../lib/file-io/error/FileIoError';
import type { EpubProject } from '../../value/EpubProject';
import type { InputFileDetail } from '../../value/InputFileDetail';
import type { ResolvedPath } from '../../value/ResolvedPath';
import { EpubCookerEventCode } from '../event-emitter';
import { _getEventEmitter } from '../event-emitter/InitEvent';
import { BookItemLoaderError, BookItemLoaderErrorType } from './error/BookItemLoaderError';
import { loadFixedLayoutContents } from './loader/FixedLayoutContentsLoader';
import { loadReflowContents } from './loader/ReflowContentsLoader';
import type { IllegalFileTypeError } from './processor/ItemProcessor';

export function loadContentsItem(project: EpubProject, inputFiles: InputFileDetail[], saveTo: ResolvedPath) {
  _getEventEmitter().emit(EpubCookerEventCode.BEGIN_ITEM_LOADER, {
    inputFiles,
  });

  return run(project, inputFiles, saveTo).mapErr((e) => translateError(e));
}

function run(project: EpubProject, inputFiles: InputFileDetail[], saveTo: ResolvedPath) {
  if (project.config.layoutType === PageLayoutType.reflow) {
    return loadReflowContents(project, inputFiles, saveTo).andTee(() => {
      _getEventEmitter().emit(EpubCookerEventCode.END_ITEM_LOADER);
    });
  } else {
    return loadFixedLayoutContents(project, inputFiles, saveTo).andTee(() => {
      _getEventEmitter().emit(EpubCookerEventCode.END_ITEM_LOADER);
    });
  }
}

function translateError(error: FileIoError | IllegalFileTypeError) {
  if (error instanceof FileIoError) {
    return BookItemLoaderError.from(BookItemLoaderErrorType.FileIo, { filePath: error.path }, error);
  }
  return BookItemLoaderError.from(
    BookItemLoaderErrorType.IllegalFileType,
    { fileType: error.fileType, allowedTypes: error.allowedTypes },
    error,
  );
}
