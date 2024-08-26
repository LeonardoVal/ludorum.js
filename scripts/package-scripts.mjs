import path from 'node:path';
import { exec } from './script-utils.mjs';

const PACKAGES = [
  'core',
  'game-tictactoe',
  'players-minimax',
];

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
