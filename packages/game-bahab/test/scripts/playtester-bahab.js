const readline = require('readline');
const {
  NodeConsoleInterface, RandomPlayer,
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

(new NodeConsoleInterface({
  readline,
  gameString({ checkerboard }) {
    return [...checkerboard.renderAsText()]
      .map((chr) => square[chr]).join('');
  },
})).play({
  module: require.main === module ? null : module,
  game() {
    return new Bahab();
  },
  player(type, _game, _role, ui) {
    if (!type || /^ran(dom)?$/i.test(type)) {
      return new RandomPlayer();
    }
    if (/^(ui|con(sole)?)$/i.test(type)) {
      return ui.player();
    }
    throw new Error(`Unknown player type ${type}!`);
  },
});
