import { Err, Ok } from 'neverthrow';
import { describe, expect, test } from 'vitest';
import { fails, pipeNonNull, rejecting, rejects, throwing } from './EffectUtil';

const throwableFn = (num: number) =>
  fails<Error>().run(() => {
    if (num < 0) {
      throw new Error('test.');
    }
    return num;
  });

const throwableAsyncFn = (num: number) =>
  rejects<Error>().run(async () => {
    if (num < 0) {
      throw new Error('test.');
    }
    return num;
  });

describe('ResultUtil', () => {
  test('failsはスローしうる関数を実行したり、実行中にスローされた結果をResultにラップするものである', () => {
    const throwable_ = fails<never>().run(() => 123);
    const throwable2 = fails<Error>().run(() => {
      throw new Error('this is a test');
    });

    expect(throwable_ instanceof Ok).toBe(true);
    expect(throwable2 instanceof Err).toBe(true);
  });

  test('rejectableはrejectしうるPromiseがresolve/rejectされた結果をResultにラップするものである', async () => {
    const throwable = await rejects<never>().run(async () => 123);
    const throwable2 = await rejects<Error>().run(async () => {
      throw new Error('this is a test');
    });

    expect(throwable instanceof Ok).toBe(true);
    expect(throwable2 instanceof Err).toBe(true);
  });

  test('throwingは、エラーが起きた時キャッチを諦めて、値を取り出す時に使う(1)', () => {
    expect(throwing(throwableFn(123))).toBe(123);
  });

  test('throwingは、エラーが起きた時キャッチを諦めて、値を取り出す時に使う(2)', () => {
    expect(() => throwing(throwableFn(-5))).toThrow(Error);
  });

  test('rejectingは、非同期のrejectが起きた時キャッチを諦めて、値を取り出す時に使う(1)', async () => {
    expect(await rejecting(throwableAsyncFn(123))).toBe(123);
  });

  test('rejectingは、非同期のrejectが起きた時キャッチを諦めて、値を取り出す時に使う(2)', async () => {
    await expect(() => rejecting(throwableAsyncFn(-5))).rejects.toThrow(Error);
  });

  test('pipeNonNullは、渡された値がNullでもUndefinedでもない時は値入りokが返り、NullかUndefinedの場合は空のerrを返すものである', () => {
    expect(pipeNonNull(123).isOk()).toBe(true);
    expect(pipeNonNull(123).unwrapOr(0)).toBe(123);

    expect(pipeNonNull(null).isOk()).toBe(false);
    expect(pipeNonNull(null).unwrapOr(0)).toBe(0);

    expect(pipeNonNull(undefined).isOk()).toBe(false);
    expect(pipeNonNull(undefined).unwrapOr(0)).toBe(0);
  });
});
