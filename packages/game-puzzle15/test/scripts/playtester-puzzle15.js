const readline = require('readline');
const { NodeConsolePlayer } = require('@ludorum/core');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { Puzzle15 } = require('../../dist/game-puzzle15');

async function main() {
  const nodeConsolePlayer = new NodeConsolePlayer({
    readline,
    gameString(game) {
      const { checkerboard } = game;
      return checkerboard.renderAsText();
    },
  });
  const game = new Puzzle15();
  return nodeConsolePlayer.playAgainst(game, game.roles[0]);
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
