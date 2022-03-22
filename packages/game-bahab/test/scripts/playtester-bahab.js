const readline = require('readline');
const {
  NodeConsolePlayer, RandomPlayer,
} = require('@ludorum/core');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { Bahab } = require('../../dist/game-bahab');

const square = {
  '.': '\x1b[90m.\x1b[0m',
  A: '\x1b[1;93mA\x1b[0m',
  B: '\x1b[93mB\x1b[0m',
  a: '\x1b[1;92ma\x1b[0m',
  b: '\x1b[92mb\x1b[0m',
  '\n': '\n',
};

const CONSOLE_PLAYER = new NodeConsolePlayer({
  readline,
  gameString({ checkerboard }) {
    return [...checkerboard.renderAsText()]
      .map((chr) => square[chr]).join('');
  },
});

NodeConsolePlayer.playtest({
  game() {
    return new Bahab();
  },
  module: require.main === module ? null : module,
  player(_game, role, name) {
    if (!name) {
      if (CONSOLE_PLAYER.role) {
        return new RandomPlayer();
      }
      CONSOLE_PLAYER.role = role;
      return CONSOLE_PLAYER;
    }
    if (/^ran(dom)?$/i.test(name)) {
      return new RandomPlayer();
    }
    if (/^con(sole)$/i.test(name)) {
      return CONSOLE_PLAYER;
    }
    throw new Error(`Unknown player type ${name}!`);
  },
});
