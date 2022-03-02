const readline = require('readline');
const { NodeConsolePlayer } = require('@ludorum/core');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { Mutropas } = require('../../dist/game-mutropas');

const listString = (list) => {
  if (!list || list.length < 1) {
    return 'nothing';
  }
  return list.join(', ');
};

async function main() {
  const nodeConsolePlayer = new NodeConsolePlayer({
    readline,
    gameString(game) {
      const {
        actions, playedPieces, roles: [role0, role1], scores,
      } = game;
      return `Score is ${role0} ${scores[role0]} vs ${role1} ${
        scores[role1]}, having played ${listString(playedPieces)}. ${
        role0} has ${listString(actions?.[role0])}. ${
        role1} has ${listString(actions?.[role1])}.`;
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
