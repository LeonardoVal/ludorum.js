import path from 'node:path';
import { spawn } from 'node:child_process';

// Utils _______________________________________________________________________

async function exec(cwd, ...cmd) {
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

// Scripts _____________________________________________________________________

const PACKAGES = ['core', 'game-tictactoe'];

async function runNpmScripts(filter, ...npmArgs) {
  const cwd = process.cwd();
  for (const pkg of PACKAGES) {
    if (!filter || pkg.includes(filter)) {
      await exec(path.resolve(cwd, `./packages/${pkg}/`), 'npm', ...npmArgs);
    }
  }
} // function test

// Main ________________________________________________________________________

async function main() {
  for (const arg of process.argv.slice(2)) {
    const parse = /(\w+)(?::(\w+))?/.exec(arg);
    switch (parse?.[1]) {
      case 'build': await runNpmScripts(parse[2], 'run', 'build'); break;
      case 'test': await runNpmScripts(parse[2], 'test'); break;
      default: {
        const errorMessage = `Unknown option ${arg}!`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    }
  }
} // function main

main().catch(() => { process.exit(1); });
