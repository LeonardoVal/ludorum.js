const readline = require('readline');
const { NodeConsoleInterface, RandomPlayer } = require('@ludorum/core');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { ConnectionGame } = require('../../dist/game-connection');

const square = {
  '.': '\x1b[90m.\x1b[0m',
  0: '\x1b[93mB\x1b[0m',
  1: '\x1b[92mb\x1b[0m',
  '\n': '\n',
};

(new NodeConsoleInterface({
  readline,
  actionString(action, game) {
    return game.checkerboard.coord(action, 'string');
  },
  gameString(game) {
    const { checkerboard } = game;
    return [...checkerboard.renderAsText()].map((chr) => square[chr]).join('');
  },
})).play({
  module: require.main === module ? null : module,
  game() {
    return new ConnectionGame();
  },
  player({ type, ui }) {
    if (!type || /^ran(dom)?$/i.test(type)) {
      return new RandomPlayer();
    }
    if (/^(ui|con(sole)?)$/i.test(type)) {
      return ui.player();
    }
    throw new Error(`Unknown player type ${type}!`);
  },
});
