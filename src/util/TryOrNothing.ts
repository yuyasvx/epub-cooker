export function tryOrNothing<T>(tryFn: () => T): T | undefined {
  try {
    return tryFn();
  } catch (_) {
    return undefined;
  }
}

export async function asyncTryOrNothing<T>(tryFn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await tryFn();
  } catch (_) {
    return undefined;
  }
}
