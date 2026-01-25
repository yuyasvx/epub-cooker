import { ZodError } from 'zod/v4';
import { printErrorMessage } from '../../app/print/PrintErrorMessage';
import { EpubCookerFeatureError } from '../../error/EpubCookerFeatureError';
import { BookProjectLoaderError } from '../../feature/project-loader';
import { ProjectNotFoundError } from '../../feature/project-loader/ProjectLoaderError';
import { FileIoError } from '../../lib/file-io/error/FileIoError';

/** @internal */
export function handleError(error: Error) {
  if (error instanceof BookProjectLoaderError) {
    printErrorMessage('プロジェクト読み込みエラー');
  } else {
    printErrorMessage('内部エラー');
  }

  if (error instanceof EpubCookerFeatureError) {
    const reason = getReason(error.cause);
    if (reason != null) {
      console.log(reason);
    }
  } else {
    printErrorMessage('内部エラー');
  }
}

function getReason(cause: EpubCookerFeatureError['cause']) {
  if (cause instanceof FileIoError) {
    return 'ファイルの読み込みまたは書き込みができませんでした';
  }
  if (cause instanceof ZodError) {
    return 'プロジェクト定義が正しくありません';
  }
  if (cause instanceof ProjectNotFoundError) {
    return 'プロジェクト定義が見つかりませんでした';
  }
}
