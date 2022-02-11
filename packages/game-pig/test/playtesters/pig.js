const readline = require('readline');
const { NodeConsolePlayer } = require('@ludorum/core');
const { Pig } = require('../../dist/game-pig');

const bold = (x) => `\x1b[1m${x}\x1b[0m`;

async function main() {
  const nodeConsolePlayer = new NodeConsolePlayer({
    readline,
    gameString(game) {
      const {
        activeRole, goal, scores, rolls, rolling,
      } = game;
      const scoresString = Object.entries(scores)
        .map(([role, score]) => `${bold(role)} has ${score} points`)
        .join(' and ');
      return `${scoresString}, aiming for ${goal}. ${bold(activeRole)} has rolled ${
        rolls.join(', ')}`;
    },
  });
  const game = new Pig();
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
