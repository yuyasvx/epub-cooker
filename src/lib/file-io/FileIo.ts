import { err, ok } from 'neverthrow';
import { copyFile, mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import type { Stream } from 'node:stream';
import type { NodeErrorType } from '../../enums/NodeJsErrorType';
import { type ResolvedPath, resolvePath } from '../../value/ResolvedPath';
import { rejects } from '../util/EffectUtil';
import { FileIoError, FileNotFoundError } from './error/FileIoError';

/**
 * @internal
 */
export type SupportedFileBuffer =
  | string
  | NodeJS.ArrayBufferView
  | Iterable<string | NodeJS.ArrayBufferView>
  | AsyncIterable<string | NodeJS.ArrayBufferView>
  | Stream;

/**
 * @internal
 */
export const getList = (path: ResolvedPath) =>
  rejects<unknown>()
    .run(() => readdir(path))
    .mapErr((e) => {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(path, maybeNodeFsError.code as NodeErrorType, e);
    });

/**
 * @internal
 */
export const getListDetails = (path: ResolvedPath) =>
  rejects<unknown>()
    .run(() => readdir(path, { withFileTypes: true }))
    .mapErr((e) => {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(path, maybeNodeFsError.code as NodeErrorType, e);
    });

/**
 * @internal
 */
export const existDir = (path: ResolvedPath) =>
  getList(path)
    .map(() => true)
    .orElse((e) => {
      if (e instanceof FileNotFoundError) {
        return ok(false);
      } else {
        return err(e);
      }
    });

/**
 * ディレクトリ/ファイルの情報を取得します。
 * @param path ディレクトリまたはファイルのパス
 * @returns 結果。正常取得できたらファイル情報、できない場合はエラー
 * @internal
 */
export const getStat = (path: ResolvedPath) =>
  rejects<unknown>()
    .run(() => stat(path))
    .mapErr((e) => {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(path, maybeNodeFsError.code as NodeErrorType, e);
    });

/**
 * @internal
 */
export const makeDir = (path: ResolvedPath) =>
  rejects<unknown>()
    .run(() => mkdir(path, { recursive: true }))
    .mapErr((e) => {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(path, maybeNodeFsError.code as NodeErrorType, e);
    });

/**
 * @internal
 */
export const remove = (path: ResolvedPath) =>
  rejects<unknown>()
    .run(() => rm(path, { recursive: true }))
    .mapErr((e) => {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(path, maybeNodeFsError.code as NodeErrorType, e);
    });

/**
 * @internal
 */
export const move = (from: ResolvedPath, to: ResolvedPath) =>
  rejects<unknown>()
    .run(() => rename(from, to))
    .mapErr((e) => {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(`${from} | ${to}`, maybeNodeFsError.code as NodeErrorType, e);
    });

/**
 * @internal
 */
export const getFile = (path: ResolvedPath) =>
  rejects<unknown>()
    .run(() => readFile(path))
    .mapErr((e) => {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(path, maybeNodeFsError.code as NodeErrorType, e);
    });

/**
 * @internal
 */
export const save = (destination: ResolvedPath, content: SupportedFileBuffer) =>
  existDir(resolvePath(destination, '../'))
    .andThen((exist) => {
      if (!exist) {
        return makeDir(resolvePath(destination, '../'));
      }
      return ok(undefined);
    })
    .andThen(() => rejects<unknown>().run(() => writeFile(destination, content)))
    .mapErr((e) => {
      if (e instanceof FileIoError) {
        return e;
      }
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(destination, maybeNodeFsError.code as NodeErrorType, e);
    });

/**
 * @internal
 */
export const copyOne = (source: ResolvedPath, destination: ResolvedPath) =>
  existDir(resolvePath(destination, '../'))
    .andThen((exist) => {
      if (!exist) {
        return makeDir(resolvePath(destination, '../'));
      }
      return ok(undefined);
    })
    .andThen(() =>
      rejects<unknown>()
        .run(() => copyFile(source, destination))
        .mapErr((e) => {
          const maybeNodeFsError = e as Record<string, string>;
          return FileIoError.from(`${source} | ${destination}`, maybeNodeFsError.code as NodeErrorType, e);
        }),
    );
