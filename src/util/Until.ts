/**
 * predicateがtrueになるまで、一定間隔で繰り返しpredicate関数を実行し続けます。
 *
 * @param predicate booleanを返す関数。非同期でもOK
 * @returns 非同期
 */
export function until(predicate: () => boolean | Promise<boolean>, intervalMs = 500) {
  let timerId: NodeJS.Timeout | undefined = undefined;
  let limitCount = 0;

  return new Promise<void>((resolve, reject) => {
    timerId = setInterval(() => {
      if (limitCount >= 10) {
        clearInterval(timerId);
        resolve();
        return;
      }
      const resultOrFlag = predicate();
      if (typeof resultOrFlag === "boolean") {
        limitCount += 1;
        if (resultOrFlag) {
          clearInterval(timerId);
          resolve();
        }
        return;
      }
      if (typeof resultOrFlag !== "boolean") {
        resultOrFlag.then((flag) => {
          limitCount += 1;
          if (flag) {
            clearInterval(timerId);
            resolve();
          }
          return;
        });
      }
    }, intervalMs);
  });
}
