/* eslint-disable import/no-extraneous-dependencies */
const readline = require('readline');
const { NodeConsoleInterface, RandomPlayer } = require('@ludorum/core');
const { AlphaBetaPlayer } = require('@ludorum/players-minimax');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { ToadsAndFrogs } = require('../../dist/game-toadsandfrogs');

const squareT = '\x1b[93mT\x1b[0m';
const squareF = '\x1b[92mF\x1b[0m';
const emptySquare = (pos) => `\x1b[90m${pos}\x1b[0m`;

(new NodeConsoleInterface({
  readline,
  gameString(game) {
    const { board } = game;
    return [...board].map(
      (chr, i) => ({ T: squareT, F: squareF, _: emptySquare(i) })[chr],
    ).join('');
  },
})).play({
  module: require.main === module ? null : module,
  game() {
    return new ToadsAndFrogs();
  },
  player({ type, ui }) {
    if (!type || /^ran(dom)?$/i.test(type)) {
      return new RandomPlayer();
    }
    if (/^(ui|con(sole)?)$/i.test(type)) {
      return ui.player();
    }
    if (/^(?:minimax)$/i.test(type)) {
      return new AlphaBetaPlayer({ horizon: 6 });
    }
    throw new Error(`Unknown player type ${type}!`);
  },
});
