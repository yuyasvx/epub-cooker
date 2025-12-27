import { err, ok, type Result, ResultAsync } from 'neverthrow';

/** @internal */
export const fails = <E>() =>
  runner as {
    run<T>(fn: () => T): Result<T, E>;
  };

const runner = {
  run<T>(fn: () => T) {
    try {
      return ok<T, unknown>(fn());
    } catch (e) {
      return err<T, unknown>(e as unknown);
    }
  },
};

/** @internal */
export const rejects = <E>() =>
  asyncRunner as {
    run<T>(fn: () => Promise<T>): ResultAsync<T, E>;
  };

const asyncRunner = {
  run<T>(fn: () => Promise<T>) {
    return ResultAsync.fromThrowable(fn)();
  },
};

/** @internal */
export const throwing = <T, E>(result: Result<T, E>): T => {
  if (result.isErr()) {
    throw result.orElse((e) => ok(e as E)).unwrapOr(undefined) as E;
  }
  return result.unwrapOr(undefined) as T;
};

/** @internal */
export const rejecting = <T, E>(result: ResultAsync<T, E> | Promise<Result<T, E>>): Promise<T> => {
  const p = result.then((r) => {
    if (r.isErr()) {
      return Promise.reject(r.orElse((e) => ok(e as E)).unwrapOr(undefined) as E);
    }
    return r.unwrapOr(undefined) as T;
  });
  return p as Promise<T>;
};

/** @internal */
export const unwrap = <T>(result: Result<T, never>): T => result.unwrapOr(undefined) as T;

/** @internal */
export const pipe = <T>(value: T) => ok(value);

/** @internal */
export const pipeNonNull = <T>(value: NonNullable<T> | null | undefined): Result<NonNullable<T>, void> =>
  value == null ? err() : ok(value);

/** @internal */
export const runNullable = <T, E, R extends Result<T, E> | ResultAsync<T, E>>(resultAsync: R) =>
  resultAsync.unwrapOr(undefined) as typeof resultAsync extends ResultAsync<infer T, E>
    ? Promise<T | undefined>
    : T | undefined;
