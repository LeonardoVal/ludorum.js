import nodeFS from 'node:fs/promises';
import nodePath from 'node:path';
import nodeURL from 'node:url';
import { spawn } from 'node:child_process';

export function modulePaths(importMetaURL) {
  const __filename = nodeURL.fileURLToPath(importMetaURL);
  const __dirname = nodePath.dirname(__filename);
  return {
    __dirname, __filename,
  };
} // function modulePaths

export async function readJSON(filePath) {
  const fileContent = await nodeFS.readFile(filePath, { encoding: 'utf-8' });
  return JSON.parse(fileContent);
} // function readJSON

export async function exec(cwd, ...cmd) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(cmd[0], cmd.slice(1), {
      cwd,
      stdio: 'inherit',
    });
    childProcess.once('exit', (code, _signal) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error(`Exit with error code: ${code}`));
      };
    });
    childProcess.once('error', (err) => {
      reject(err);
    });
  });
} // function exec
