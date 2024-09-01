import nodePath from 'node:path';
import { exec, readJSON, modulePaths } from './script-utils.mjs';

const { __dirname } = modulePaths(import.meta.url);

async function workspaceMap(fn) {
  const mainPkg = await readJSON(nodePath.resolve(__dirname, '../package.json'));
  const result = [];
  for (const workspace of mainPkg.workspaces) {
    const workspacePath = nodePath.resolve(__dirname, '../', workspace);
    const workspacePkg = await readJSON(
      nodePath.resolve(workspacePath, './package.json')
    );
    const workspaceResult = await fn(workspacePkg, workspacePath);
    if (workspaceResult !== undefined) {
      result.push();
    }
  }
  return result;
} // function workspaceMap

// Main ________________________________________________________________________

async function main() {
  for (const arg of process.argv.slice(2)) {
    const [scriptName, pkgFilter] = arg.split(':');
    await workspaceMap(async (pkg, path) => {
      if (pkg.name.includes(pkgFilter ?? '')) {
        if (pkg.scripts[scriptName]) {
          await exec(path, 'npm', 'run', scriptName);
          return pkg.name;
        }
        console.info(`Package ${pkg.name} has not a ${scriptName} script.`);
      }
    });    
  }
} // function main

main().catch(() => { process.exit(1); });
