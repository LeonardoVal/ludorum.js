/* eslint-disable import/no-extraneous-dependencies */
const readline = require('readline');
const {
  NodeConsolePlayer, RandomPlayer,
} = require('@ludorum/core');
const { AlphaBetaPlayer } = require('@ludorum/players-minimax');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { ToadsAndFrogs } = require('../../dist/game-toadsandfrogs');

const squareT = '\x1b[93mT\x1b[0m';
const squareF = '\x1b[92mF\x1b[0m';
const emptySquare = (pos) => `\x1b[90m${pos}\x1b[0m`;

async function main(player) {
  const nodeConsolePlayer = new NodeConsolePlayer({
    readline,
    gameString(game) {
      const { board } = game;
      return [...board].map(
        (chr, i) => ({ T: squareT, F: squareF, _: emptySquare(i) })[chr],
      ).join('');
    },
  });
  const game = new ToadsAndFrogs();
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
