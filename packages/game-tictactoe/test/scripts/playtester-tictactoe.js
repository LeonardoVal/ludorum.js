/* eslint-disable import/no-extraneous-dependencies */
const readline = require('readline');
const {
  NodeConsolePlayer, RandomPlayer,
} = require('@ludorum/core');
const { AlphaBetaPlayer } = require('@ludorum/players-minimax');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { TicTacToe } = require('../../dist/game-tictactoe');

const squareX = '\x1b[93mX\x1b[0m';
const squareO = '\x1b[92mO\x1b[0m';
const emptySquare = (pos) => `\x1b[90m${pos}\x1b[0m`;

async function main(player) {
  const nodeConsolePlayer = new NodeConsolePlayer({
    readline,
    gameString(game) {
      const { board, activeRole, activeRoles } = game;
      const boardString = [...board].map(
        (chr, i) => ({ X: squareX, O: squareO, _: emptySquare(i) })[chr],
      );
      return [0, 3, 6]
        .map((i) => boardString.slice(i, i + 3).join('|'))
        .join('\n-+-+-\n');
    },
  });
  const game = new TicTacToe();
  const playerBuilder = (
    /^(?:|random)$/i.test(player) ? () => new RandomPlayer()
      : /^(?:minimax)$/i.test(player) ? () => new AlphaBetaPlayer({ horizon: 6 })
        : null
  );
  return nodeConsolePlayer.playAgainst(game, game.roles[0], playerBuilder);
}

if (require.main === module) {
  main(process.argv.slice(2)).then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
} else {
  module.exports = main;
}
