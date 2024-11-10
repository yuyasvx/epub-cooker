import { AbstractError } from "../error/AbstractError";
import { AppError, ProjectFileNotFoundError } from "../error/AppError";
import { FileIoError } from "../io/error/FileIoError";
import { CommandParameterError } from "./error/CommandParameterError";

export function outputErrorMessage(error: unknown) {
  if (error instanceof AbstractError) {
    handleInternalError(error);
    error.cause != null && console.error(error.cause);
  } else {
    console.log("不明なエラーが発生しました。");
  }

  if (error instanceof Error) {
    console.error(error.stack);
  }
}

function handleInternalError(err: AppError) {
  if (err instanceof FileIoError) {
    console.log("ファイルの読み書きでエラーが発生しました。");
    console.log(`パス: ${err.path}`);
  }
  if (err instanceof CommandParameterError) {
    console.log("コマンドのパラメータを正しく指定してください。");
  }
  if (err instanceof ProjectFileNotFoundError) {
    console.log(`ディレクトリ“${err.path}”にプロジェクトファイルが見つかりませんでした。`);
  }
}
