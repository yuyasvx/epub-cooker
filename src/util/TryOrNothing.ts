export function tryOrNothing<T, E = unknown>(tryFn: () => T, onFail?: (error: E) => void): T | undefined {
  try {
    return tryFn();
  } catch (error) {
    onFail?.(error as E);
    return undefined;
  }
}

export async function asyncTryOrNothing<T, E = unknown>(
  tryFn: () => Promise<T>,
  onFail?: (error: E) => void,
): Promise<T | undefined> {
  try {
    return await tryFn();
  } catch (error) {
    onFail?.(error as E);
    return undefined;
  }
}
