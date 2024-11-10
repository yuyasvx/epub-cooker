import { Effect, pipe } from "effect";
import { catchAll, map, runPromise, runSync } from "effect/Effect";

/**
 * @internal
 * @param fn
 * @returns
 */
export const throws = <T, E>(fn: () => T): Effect.Effect<T, E> =>
  Effect.try<T, E>({
    try: fn,
    catch: (e) => e as E,
  });

/**
 * @internal
 * @param fn
 * @returns
 */
export const throwsAsync = <T, E>(fn: () => Promise<T>): Effect.Effect<T, E> =>
  Effect.tryPromise<T, E>({
    try: fn,
    catch: (e) => e as E,
  });

/**
 * @internal
 * @param effect
 * @returns
 */
export const runNullableSync = <T, E>(effect: Effect.Effect<T, E>): T | undefined =>
  runSync(
    pipe(
      effect,
      catchAll(() => Effect.succeed(undefined)),
    ),
  );

/**
 * @internal
 * @param effect
 * @returns
 */
export const runNullable = <T, E>(effect: Effect.Effect<T, E>): Promise<T | undefined> =>
  runPromise(
    pipe(
      effect,
      catchAll(() => Effect.succeed(undefined)),
    ),
  );

/**
 * @internal
 * @param effect
 * @returns
 */
export const runThrowing = <T, E>(effect: Effect.Effect<T, E>): Promise<T> =>
  runPromise(
    pipe(
      effect,
      map((r) => [true, r] as [true, T]),
      catchAll((e) => Effect.succeed([false, e] as [false, E])),
    ),
  ).then((res) => {
    if (res[0] === true) {
      return res[1];
    }
    throw res[1];
  });

/**
 * @internal
 * @param effect
 * @returns
 */
export const runThrowingSync = <T, E>(effect: Effect.Effect<T, E>): T => {
  const result = runSync(
    pipe(
      effect,
      map((r) => [true, r] as [true, T]),
      catchAll((e) => Effect.succeed([false, e] as [false, E])),
    ),
  );
  if (result[0] === true) {
    return result[1];
  }
  throw result[1];
};
