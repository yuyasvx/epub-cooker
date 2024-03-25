import { Result, ResultError, ResultOk } from "./TryAsResult";

function successFunction<T>(value: T): Result<unknown, T> {
  return new ResultOk(value);
}

function nestedOk<T>(value: T): Result<unknown, Result<unknown, T>> {
  return new ResultOk(new ResultOk(value));
}

function failedFunction<T>(value: T): Result<T, unknown> {
  return new ResultError(value);
}

describe("try as result", () => {
  it("OKなResultをMapしたら中身の値がアップデートされていること", () => {
    const result = successFunction("1234")
      .map((str) => str === "1234")
      .get();
    expect(result).toBe(true);
  });

  it("ErrorなResultをMapしたら中身の値がアップデートされないこと", () => {
    const result = failedFunction("1234")
      .map((str) => str === "1234")
      .get();
    expect(result).toBe("1234");
  });

  it("OKなResultをunwrapしたら普通に値を取り出せること", () => {
    const result = successFunction("1234").unwrap();
    expect(result).toBe("1234");
  });

  it("ErrorなResultをunwrapしたらスローされること", () => {
    const result = failedFunction(new Error("TEST"));
    expect(() => result.unwrap()).toThrow(Error);
  });

  it("OKなResultをgetOrUndefinedしたら普通に値を取り出せること", () => {
    const result = successFunction("1234").getOrUndefined();
    expect(result).toBe("1234");
  });

  it("ErrorなResultをgetOrUndefinedしたらundefinedを取得すること", () => {
    const result = failedFunction(new Error("TEST")).getOrUndefined();
    expect(result).toBeUndefined();
  });
});
