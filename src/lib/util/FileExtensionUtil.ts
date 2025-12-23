import type { ResolvedPath } from '../../value/ResolvedPath';

/**
 * @internal
 * @param fullPath
 * @param toExtension
 * @returns
 */
export function changeFileExtension<P extends string | ResolvedPath>(fullPath: P, toExtension: string): P {
  const tokens = fullPath.split('.');
  if (tokens.length === 0) {
    return fullPath;
  }
  if (tokens.length === 1) {
    return `${fullPath}.${toExtension}` as P;
  }
  tokens.pop();
  tokens.push(toExtension);
  return tokens.join('.') as P;
}

/**
 * @internal
 * @param fullPath
 * @returns
 */
export function removeExtension(fullPath: string): string {
  const tokens = fullPath.split('.');
  if (tokens.length === 0) {
    return fullPath;
  }
  if (tokens.length === 1) {
    return tokens[0]!;
  }
  tokens.pop();
  return tokens.join('.');
}
