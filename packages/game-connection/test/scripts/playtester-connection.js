const readline = require('readline');
const { NodeConsolePlayer } = require('@ludorum/core');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { ConnectionGame } = require('../../dist/game-connection');

const square = {
  '.': '\x1b[90m.\x1b[0m',
  0: '\x1b[93mB\x1b[0m',
  1: '\x1b[92mb\x1b[0m',
  '\n': '\n',
};

async function main() {
  const nodeConsolePlayer = new NodeConsolePlayer({
    readline,
    actionString(action, game) {
      return game.checkerboard.coord(action, 'string');
    },
    gameString(game) {
      const { checkerboard } = game;
      return [...checkerboard.renderAsText()].map((chr) => square[chr]).join('');
    },
  });
  const game = new ConnectionGame();
  return nodeConsolePlayer.playAgainstRandoms(game, game.roles[0]);
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
} else {
  module.exports = main;
}
