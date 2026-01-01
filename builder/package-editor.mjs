import fs from 'fs/promises';

async function modifyPackageForGitHubPackages() {
  const packageJsonText = (await fs.readFile('package.json')).toString();
  const replaced = packageJsonText.replace(/(?<="name": ).*(?=,)/, '"@yuyasvx/epub-cooker"');
  await fs.writeFile('package.json', replaced, 'utf8');
}

async function updateVersion(versionStr) {
  const packageJsonText = (await fs.readFile('package.json')).toString();
  const replaced = packageJsonText.replace(/(?<="version": ).*(?=,)/, `"${versionStr}"`);
  await fs.writeFile('package.json', replaced, 'utf8');
}

async function main() {
  if (process.argv[2] === 'version') {
    if (process.argv[3] == null) {
      console.error('invalid parameter');
      process.exit(1);
    }
    await updateVersion(process.argv[3]);
    return;
  }
  if (process.argv[2] === 'github-package') {
    await modifyPackageForGitHubPackages();
  }
}

main();
