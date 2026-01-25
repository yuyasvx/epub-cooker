import { printErrorMessage } from '../../app/print/PrintErrorMessage';
import { BookItemLoaderError } from '../../feature/item-loader';
import { BookItemLoaderErrorType } from '../../feature/item-loader/error/BookItemLoaderError';
import { BookProjectLoaderError, BookProjectLoaderErrorType } from '../../feature/project-loader';

/** @internal */
export function handleError(error: Error) {
  if (error instanceof BookProjectLoaderError) {
    printErrorMessage('プロジェクト読み込みエラー');
    handleBookProjectLoaderError(error);
    return;
  }

  if (error instanceof BookItemLoaderError && error.type === BookItemLoaderErrorType.FileIo) {
    printErrorMessage('本のコンテンツ読み込みエラー');
    handleBookItemLoaderError(error);
    return;
  }

  printErrorMessage('内部エラー');
}

function handleBookProjectLoaderError(error: BookProjectLoaderError) {
  const { type } = error;
  if (type === BookProjectLoaderErrorType.FileIo) {
    const detail = error.getDetail<typeof type>();
    console.log(`${detail.filePath}は存在しないか、読み書きに失敗しました`);
  }

  if (type === BookProjectLoaderErrorType.BookIdentification) {
    console.log(`ブックの識別子の設定に失敗しました`);
  }

  if (type === BookProjectLoaderErrorType.BookProjectSchemaParse) {
    const detail = error.getDetail<typeof type>();
    detail.keys.forEach((k) => {
      console.log(`プロジェクト定義の "${k}" の値が正しくありません`);
    });
  }

  if (type === BookProjectLoaderErrorType.IllegalBookSourceHandlingType) {
    const detail = error.getDetail<typeof type>();
    console.log(`設定値の組み合わせが不正です\nlayoutType: ${detail.layoutType}, using: ${detail.using}`);
  }

  if (type === BookProjectLoaderErrorType.ProjectNotFound) {
    const detail = error.getDetail<typeof type>();
    console.log(`プロジェクト定義が見つかりませんでした: ${detail.prjectDir}`);
  }

  if (type === BookProjectLoaderErrorType.EmptyInputItems) {
    const detail = error.getDetail<typeof type>();
    console.log(`読み込み対象のアイテムが1つも存在しませんでした。プロジェクト: ${detail.prjectDir}`);
  }
}

function handleBookItemLoaderError(error: BookItemLoaderError) {
  const { type } = error;
  if (type === BookItemLoaderErrorType.FileIo) {
    const detail = error.getDetail<typeof type>();
    console.log(`${detail.filePath}は存在しないか、読み書きに失敗しました`);
  }
}
