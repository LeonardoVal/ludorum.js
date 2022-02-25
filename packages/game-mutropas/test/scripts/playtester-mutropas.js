const readline = require('readline');
const { NodeConsolePlayer } = require('@ludorum/core');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { Mutropas } = require('../../dist/game-mutropas');

const square = {
  '.': '\x1b[90m.\x1b[0m',
  A: '\x1b[1;93mA\x1b[0m',
  B: '\x1b[93mB\x1b[0m',
  a: '\x1b[1;92ma\x1b[0m',
  b: '\x1b[92mb\x1b[0m',
  '\n': '\n',
};

async function main() {
  const nodeConsolePlayer = new NodeConsolePlayer({
    readline,
    gameString(game) {
      const { checkerboard } = game;
      return [...checkerboard.renderAsText()].map((chr) => square[chr]).join('');
    },
  });
  const game = new Mutropas();
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
