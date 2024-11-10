import { copyFile, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { Stream } from "node:stream";
import { resolve as resolvePath } from "path";
import { Effect } from "effect";
import { catchIf, succeed, tryPromise } from "effect/Effect";
import { Case } from "../domain/enums/Case";
import { NodeErrorType } from "../domain/enums/NodeJsErrorType";
import { runThrowing } from "../util/EffectUtil";
import { FileIoError, FileNotFoundError } from "./error/FileIoError";

export type SupportedFileBuffer =
  | string
  | NodeJS.ArrayBufferView
  | Iterable<string | NodeJS.ArrayBufferView>
  | AsyncIterable<string | NodeJS.ArrayBufferView>
  | Stream;

/**
 * @internal
 * @param path path to directory
 * @returns filenames
 */
export const getList = (path: string) =>
  tryPromise({
    async try() {
      return readdir(path);
    },
    catch(e) {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(path, maybeNodeFsError.code as Case<typeof NodeErrorType>, e);
    },
  });

/**
 * @internal
 * @param path
 * @returns
 */
export const getListDetails = (path: string) =>
  tryPromise({
    async try() {
      return readdir(path, { withFileTypes: true });
    },
    catch(e) {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(path, maybeNodeFsError.code as Case<typeof NodeErrorType>, e);
    },
  });

/**
 * @internal
 * @param path
 * @returns
 */
export const existDir = (path: string) =>
  getList(path).pipe(
    Effect.map(() => true),
    catchIf(
      (e) => e instanceof FileNotFoundError,
      () => succeed(false),
    ),
  );

/**
 * ディレクトリ/ファイルの情報を取得します。
 * @param path ディレクトリまたはファイルのパス
 * @returns 結果。正常取得できたらファイル情報、できない場合はエラー
 * @internal
 */
export const getStat = (path: string) =>
  tryPromise({
    async try() {
      return stat(path);
    },
    catch(e) {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(path, maybeNodeFsError.code as Case<typeof NodeErrorType>, e);
    },
  });

/**
 * @internal
 * @param path
 * @returns
 */
export const makeDir = (path: string) =>
  tryPromise({
    async try() {
      return mkdir(path, { recursive: true });
    },
    catch(e) {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(path, maybeNodeFsError.code as Case<typeof NodeErrorType>, e);
    },
  });

/**
 * @internal
 * @param path
 * @returns
 */
export const removeDir = (path: string) =>
  tryPromise({
    async try() {
      return rm(path, { recursive: true });
    },
    catch(e) {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(path, maybeNodeFsError.code as Case<typeof NodeErrorType>, e);
    },
  });

/**
 * @internal
 * @param from
 * @param to
 * @returns
 */
export const move = (from: string, to: string) =>
  tryPromise({
    async try() {
      return rename(from, to);
    },
    catch(e) {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(`${from} | ${to}`, maybeNodeFsError.code as Case<typeof NodeErrorType>, e);
    },
  });

/**
 * @internal
 * @param path
 * @returns
 */
export const getFile = (path: string) =>
  tryPromise({
    async try() {
      return readFile(path);
    },
    catch(e) {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(path, maybeNodeFsError.code as Case<typeof NodeErrorType>, e);
    },
  });

/**
 * @internal
 * @param destination
 * @param content
 * @returns
 */
export const save = (destination: string, content: SupportedFileBuffer) =>
  tryPromise({
    async try() {
      if (!(await runThrowing(existDir(destination)))) {
        await runThrowing(makeDir(resolvePath(destination, "../")));
      }
      return writeFile(destination, content);
    },
    catch(e) {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(destination, maybeNodeFsError.code as Case<typeof NodeErrorType>, e);
    },
  });

/**
 * @internal
 * @param source
 * @param destination
 * @returns
 */
export const copy = (source: string, destination: string) =>
  tryPromise({
    async try() {
      return copyFile(source, destination);
    },
    catch(e) {
      const maybeNodeFsError = e as Record<string, string>;
      return FileIoError.from(`${source} | ${destination}`, maybeNodeFsError.code as Case<typeof NodeErrorType>, e);
    },
  });
