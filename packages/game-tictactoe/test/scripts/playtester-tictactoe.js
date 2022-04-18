/* eslint-disable import/no-extraneous-dependencies */
const readline = require('readline');
const { NodeConsoleInterface, RandomPlayer } = require('@ludorum/core');
const { AlphaBetaPlayer } = require('@ludorum/players-minimax');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { TicTacToe } = require('../../dist/game-tictactoe');

const squareX = '\x1b[93mX\x1b[0m';
const squareO = '\x1b[92mO\x1b[0m';
const emptySquare = (pos) => `\x1b[90m${pos}\x1b[0m`;

(new NodeConsoleInterface({
  readline,
  gameString(game) {
    const { board } = game;
    const boardString = [...board].map(
      (chr, i) => ({ X: squareX, O: squareO, _: emptySquare(i) })[chr],
    );
    return [0, 3, 6]
      .map((i) => boardString.slice(i, i + 3).join('|'))
      .join('\n-+-+-\n');
  },
})).play({
  module: require.main === module ? null : module,
  game() {
    return new TicTacToe();
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
