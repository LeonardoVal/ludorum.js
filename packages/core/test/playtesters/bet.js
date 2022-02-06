const readline = require('readline');
const {
  games: { Bet },
  players: { NodeConsolePlayer },
} = require('../../dist/core');

const bold = (x) => `\x1b[1m${x}\x1b[0m`;

async function main() {
  const nodeConsolePlayer = new NodeConsolePlayer({
    readline,
    gameString(game, role) {
      const { goal, points } = game;
      return `${bold(role)} has ${points} of ${bold(goal)} points.`;
    },
  });
  const game = new Bet();
  return nodeConsolePlayer.playAgainstRandoms(game, game.roles[0]);
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err.message);
      process.exit(1);
    },
  );
} else {
  module.exports = main;
}
