import { BookMetadata } from "../domain/value/BookMetadata";
import { EpubProject } from "../domain/value/EpubProject";
import { UnknownValue } from "../util/UnknownValue";

/**
 * プロジェクト定義のバリデーションを行います。
 *
 * バリデーションが成功した場合はtrueを返します。失敗した場合はその時点でエラーをスローします。
 * （つまりfalseを返す事はない）
 *
 * @param data バリデーション対象のプロジェクト定義
 * @returns true
 */
export function validateProject(data: unknown): data is EpubProject {
  if (typeof data !== "object") {
    return false;
  }

  const data_ = data as UnknownValue<EpubProject>;

  if (data_.version == null || data_.version !== 1) {
    throw new Error("INVALID_VERSION");
  }
  validateBookMetadata(data_.bookMetadata);

  // AdditionalMetadataの中身はこのValidatorではチェックしない
  if (!Array.isArray(data_.additionalMetadata)) {
    throw new Error("INVALID_ADDITIONAL_METADATA");
  }

  // identifierがnullとして設定されていても、プロジェクト定義上は問題ない
  if (data_.identifier != null && typeof data_.identifier !== "string") {
    throw new Error("INVALID_IDENTIFIER");
  }

  return true;
}

export function validateBookMetadata(value: unknown): value is BookMetadata {
  if (typeof value !== "object") {
    throw new Error("INVALID_BOOK_METADATA_TYPE");
  }
  const unknownMetadata = value as UnknownValue<BookMetadata>;

  // titleは必須
  if (unknownMetadata.title == null) {
    throw new Error("INVALID_BOOK_METADATA_TITLE");
  }

  // languageは必須
  if (unknownMetadata.language == null) {
    throw new Error("INVALID_BOOK_LANGUAGE");
  }

  if (unknownMetadata.publishedDate != null && typeof unknownMetadata.publishedDate !== "object") {
    throw new Error("INVALID_BOOK_METADATA_PROPERTY");
  }

  const { creator, description, genre, publisher, rights } = unknownMetadata;

  for (const value of [creator, description, genre, publisher, rights]) {
    if (typeof value !== "string" && typeof value !== "undefined") {
      throw new Error("INVALID_BOOK_METADATA_PROPERTY");
    }
  }

  return true;
}
