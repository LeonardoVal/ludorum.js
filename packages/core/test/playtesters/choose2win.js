const readline = require('readline');
const {
  Choose2Win, NodeConsolePlayer,
} = require('../../dist/core');

async function main() {
  const nodeConsolePlayer = new NodeConsolePlayer({
    readline,
    gameString(game, _role) {
      return `Turns left: ${game.winner ? `none. ${game.winner} won`
        : game.turns}.`;
    },
  });
  const game = new Choose2Win();
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
