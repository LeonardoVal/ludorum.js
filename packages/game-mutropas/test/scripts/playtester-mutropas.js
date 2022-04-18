const readline = require('readline');
const { NodeConsoleInterface, RandomPlayer } = require('@ludorum/core');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { Mutropas } = require('../../dist/game-mutropas');

const listString = (list) => {
  if (!list || list.length < 1) {
    return 'nothing';
  }
  return list.join(', ');
};

(new NodeConsoleInterface({
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
})).play({
  module: require.main === module ? null : module,
  game() {
    return new Mutropas();
  },
  player({ type, ui }) {
    if (!type || /^ran(dom)?$/i.test(type)) {
      return new RandomPlayer();
    }
    if (/^(ui|con(sole)?)$/i.test(type)) {
      return ui.player();
    }
    throw new Error(`Unknown player type ${type}!`);
  },
});
