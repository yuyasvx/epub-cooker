export type Result<E, T> = ResultError<E> | ResultOk<T>;
type FlatResultClass<T, T2, E2> = T extends Result<E2, T2> ? Result<E2, T2> : T;

export function tryAsResult<E, T>(tryFn: () => T): Result<E, T> {
  try {
    return new ResultOk<T>(tryFn());
  } catch (error) {
    return new ResultError<E>(error as E);
  }
}

export async function asyncTryAsResult<E, T>(tryFn: () => Promise<T>): Promise<Result<E, T>> {
  try {
    return new ResultOk<T>(await tryFn());
  } catch (err) {
    return new ResultError<E>(err as E);
  }
}

abstract class ResultClass<T> {
  protected constructor(
    public readonly ok: boolean,
    protected readonly value: T,
  ) {}

  abstract get(): T;

  /**
   * OKの場合はResultOkをアンラップし、Errorの場合はundefinedを返します。
   * @returns
   */
  getOrUndefined<E, T>(this: Result<E, T>): T | undefined {
    return isOk(this) ? (this.value as T) : undefined;
  }

  /**
   * OKの場合はResultOkでラップされた値を返します。Errorの場合はResultErrorでラップされた値をスローします。
   * @returns
   */
  unwrap<E, T>(this: Result<E, T>): T {
    if (isOk(this)) {
      return this.value as T;
    }
    throw this.value;
  }

  /**
   * ResultOkでラップされた値をマップします。ResultErrorに対しては何もしません。
   *
   * @param fn マップ関数
   * @returns マップ後のResult
   */
  map<E, T, U>(this: Result<E, T>, fn: (value: T) => U): Result<E, U> {
    if (isOk(this)) {
      return new ResultOk<U>(fn(this.value));
    }
    return this;
  }

  /**
   * ResultErrorでラップされた値をマップします。ResultOkに対しては何もしません。
   *
   * @param fn マップ関数
   * @returns マップ後のResult
   */
  mapError<E, T, F>(this: Result<E, T>, fn: (value: E) => F): Result<F, T> {
    if (!isOk(this)) {
      return new ResultError<F>(fn(this.value));
    }
    return this;
  }

  fold<E, U>(this: Result<E, T>, onOk: (value: T) => U, onError: (value: E) => U): U {
    if (isOk(this)) {
      return onOk(this.value);
    }
    return onError(this.value);
  }

  // flat<E1, T1, E2, T2>(this: Result<E1, T1 extends Result<E2, T2> ? Result<E2, T2> : T1>): FlatResult<E1, T1, E2, T2> {
  //   // : T1 extends Result<E2, T2> ? Result<E1, T2> : Result<E1, T1>
  //   // Result<string, Result<string, true>> | Result<Result<string, true>, boolean>>
  //   // Result<string, true>
  //   if (!isOk(this)) {
  //     return this as FlatResult<E1, T1, E2, T2>;
  //   }
  //   const v = this.value;
  //   if (v instanceof ResultOk) {
  //     return v.value as FlatResult<E1, T1, E2, T2>;
  //   }
  //   return this as FlatResult<E1, T1, E2, T2>;
  // }

  // flat2(this: ResultClass<T>) {
  //   // Ok(Ok("hello")); -> Ok("hello")
  //   // Ok(Err(6)); -> Err(6)
  //   // Err(6) -> Err(6)
  //   if (this.value instanceof ResultClass) {
  //     return this.value;
  //   }
  //   return this;
  // }
}

export class ResultOk<T> extends ResultClass<T> {
  constructor(value: T) {
    super(true, value);
  }

  get() {
    return this.value as T;
  }

  flat<E2, T2>(): FlatResultClass<T, T2, E2> {
    if (this.value instanceof ResultClass) {
      return this.value as FlatResultClass<T, T2, E2>;
    }
    return this as ResultClass<T> as FlatResultClass<T, T2, E2>;
  }
}

export class ResultError<E> extends ResultClass<E> {
  constructor(value: E) {
    super(false, value);
  }

  get() {
    return this.value as E;
  }

  flat<E2, T2>(): FlatResultClass<E, T2, E2> {
    if (this.value instanceof ResultClass) {
      return this.value as FlatResultClass<E, T2, E2>;
    }
    return this as ResultClass<E> as FlatResultClass<E, T2, E2>;
  }
}

export function isOk<E, T>(result: Result<E, T>): result is ResultOk<T> {
  return result.ok;
}
