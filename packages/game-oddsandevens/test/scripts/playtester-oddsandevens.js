const readline = require('readline');
const { NodeConsolePlayer } = require('@ludorum/core');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { OddsAndEvens } = require('../../dist/game-oddsandevens');

const bold = (x) => `\x1b[1m${x}\x1b[0m`;

async function main() {
  const nodeConsolePlayer = new NodeConsolePlayer({
    readline,
    gameString(game) {
      const { turns, points, roles } = game;
      return `  ${turns} left. ${roles
        .map((role) => `${role} has ${points[role]} points.`)
        .join(' ')}`;
    },
  });
  const game = new OddsAndEvens({ turns: 5 });
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
