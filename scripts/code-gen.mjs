import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

// Common ______________________________________________________________________

function license(pkgName) {
  return `\
# The MIT License

Source code for package \`@ludorum/${pkgName}\` is Copyright (C) 2013-2024
[Leonardo Val](mailto:leonardo.val@creatartis.com).

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

**THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.**
`
} // function license

function packageJson(pkgName, gameName = null) {
  const pkg = {
    author: {
      email: 'leonardo.val@creatartis.com',
      name: 'Leonardo Val'
    },
    contributors: [],
    dependencies: {
      '@ludorum/core': '^0.3.0'
    },
    description: `${pkgName} for Ludorum.`,
    devDependencies: {
      '@ludorum/common-dev': '^1.0.0'
    },
    exports: {
      '.': {
        import: `./dist/${pkgName}.es.mjs`,
        require: `./dist/${pkgName}.umd.js`
      }
    },
    files: ['dist/', 'LICENSE.md', 'README.md'],
    keywords: ['board game', 'game'],
    license: 'MIT',
    main: `./dist/${pkgName}.umd.js`,
    module: `./dist/${pkgName}.es.js`,
    name: `@ludorum/${pkgName}`,
    repository: {
      type: 'git',
      url: 'http://github.com/LeonardoVal/ludorum.js'
    },
    scripts: {
      build: 'vite build',
      lint: 'eslint .',
      test: 'vitest'
    },
    version: '0.1.0'
  };
  if (gameName) {
    pkg.scripts.playtest = `node test/scripts/playtest-${gameName.toLowerCase()}.mjs`;
  }
  return JSON.stringify(pkg, null, '  ');
} // function packageJson

function readme(pkgName) {
  return `\
# ${pkgName} for Ludorum

Ludorum is a board game framework. It is not focused on graphics or user
interfaces, but on artificial players design, implementation and testing.

??

## License

Open source under an MIT license. See [LICENSE](LICENSE.md).
`;
} // function readme

function viteConfig() {
  return `\
import { defineConfig } from 'vite';
import { viteConfig } from '@ludorum/common-dev';

export default defineConfig(
  viteConfig(),
); // defineConfig
`;
} // function viteConfig

function dummySpecs() {
  return `\
import { describe, expect, test } from 'vitest';

describe(??, () => {
  test(??, () => {
    expect(true).toBe(false);
  });
}); // describe ?? 
`;
} // function dummySpecs

// Games _______________________________________________________________________

function gamePackageName(gameName) {
  return `game-${gameName.toLowerCase()}`;
} // function gamePackageName

function gameModule(gameName) {
  return `\
import { Game } from '@ludorum/core';

/** TODO */
export class ${gameName} extends Game {
  /** TODO */
  static meta = {
    description: \`Implementation of ${gameName}.\`,
    name: '${gameName}',
    roles: [?,?],
  }

  /** TODO */
  init(state = null) {
    throw new Error('${gameName} is WIP!');
  }

  /** TODO */
  nextState(actions, haps) {
    throw new Error('${gameName} is WIP!');
  }
} // class ${gameName}
`;
} // function gameModule

function gameIndex(gameName) {
  return `\
export { ${gameName} } from './games/${gameName}';
`;
} // function gameIndex

function gamePlaytester(gameName) {
  return `\
import readline from 'node:readline';
import { Match, RandomPlayer, utils } from '@ludorum/core';
import { ${gameName} } from '../../dist/${gamePackageName(gameName)}.es.mjs';

const { ansiBold, NodeConsoleInterface } = utils;

async function main() {
  const ui = new NodeConsoleInterface({
    renderAction(haps) {
      return ??;
    },
    renderHaps(haps) {
      return ??;
    },
    renderGame(game) {
      return ??;
    },
  });
  await ui.init(readline);
  return (
    new Match({
      game: new ${gameName}(),
      players: [await ui.player(), new RandomPlayer()],
      spectators: [ui.spectator()],
    })
  ).playthrough();
} // function main

main();
`;
} // function gamePlaytester

function gameSpecs(gameName) {
  return `\
import { describe, expect, expectTypeOf, test } from 'vitest';
import { TestSpectator } from '@ludorum/core';
import { ${gameName} } from '../../src/index';

const MATCH_COUNT = 15;

describe('${gameName}', () => {
  test('has the expected definitions', () => {
    expectTypeOf(${gameName}).toBeFunction();
  });

  test('${gameName} works like a game', async () => {
    await TestSpectator.testGame({
      expect,
      game: new ${gameName}(),
      matchCount: MATCH_COUNT,
    });
  });
}); // describe '${gameName}' 
`;
} // function gameSpecs

// Packages ____________________________________________________________________

async function genPackage(pkgName, gameName = null) {
  const pkgPath = path.resolve(
    path.dirname(url.fileURLToPath(import.meta.url)), `../packages/${pkgName}`,
  );
  const resPath = (relPath) => path.resolve(pkgPath, relPath);
  await fs.mkdir(pkgPath);
  await fs.writeFile(resPath('./LICENSE.md'), license(pkgName));
  await fs.writeFile(resPath('./package.json'), packageJson(pkgName, gameName));
  await fs.writeFile(resPath('./README.md'), readme(pkgName));
  await fs.writeFile(resPath('./vite.config.mjs'), viteConfig());

  await fs.mkdir(resPath('./src'));
  await fs.mkdir(resPath('./test'));
  await fs.mkdir(resPath('./test/specs'));
  if (!gameName) {
    await fs.writeFile(resPath(`./src/index.js`), '//TODO index\n');
    await fs.writeFile(
      resPath(`./test/specs/${pkgName}.test.js`), dummySpecs(),
    );
  }
} // function genGamePackage

async function genGamePackage(gameName) {
  const pkgName = gamePackageName(gameName);
  await genPackage(pkgName);
  const pkgPath = path.resolve(
    path.dirname(url.fileURLToPath(import.meta.url)), `../packages/${pkgName}`,
  );
  const resPath = (relPath) => path.resolve(pkgPath, relPath);

  await fs.writeFile(resPath('./src/index.js'), gameIndex(gameName));
  await fs.mkdir(resPath('./src/games'));
  await fs.writeFile(
    resPath(`./src/games/${gameName}.js`), gameModule(gameName),
  );
  await fs.writeFile(
    resPath(`./test/specs/${pkgName}.test.js`), gameSpecs(gameName),
  );
  await fs.mkdir(resPath('./test/scripts'));
  await fs.writeFile(
    resPath(`./test/scripts/playtest-${gameName.toLowerCase()}.mjs`),
    gamePlaytester(gameName),
  );
} // function genGamePackage

// Main ________________________________________________________________________

async function main() {
  const args = process.argv.slice(2);
  switch (args?.[0]) {
    case 'game': return genGamePackage(...args.slice(1));
    case 'pkg': return genPackage(...args.slice(1));
    default: {
      console.error(`Unknown gen type ${args?.[0]}!`);
    }
  }
} // function main

main();