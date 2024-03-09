export function changeExtension(fullPath: string, toExtension: string) {
  const tokens = fullPath.split(".");
  if (tokens.length === 0) {
    return fullPath;
  }
  if (tokens.length === 1) {
    return `${fullPath}.${toExtension}`;
  }
  tokens.pop();
  tokens.push(toExtension);
  return tokens.join(".");
}
