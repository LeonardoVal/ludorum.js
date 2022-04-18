const readline = require('readline');
const { NodeConsoleInterface, RandomPlayer } = require('@ludorum/core');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { Pig } = require('../../dist/game-pig');

const bold = (x) => `\x1b[1m${x}\x1b[0m`;

(new NodeConsoleInterface({
  readline,
  gameString(game) {
    const { goal, scores } = game;
    return game.roles.map(
      (role) => `${bold(role)} has ${scores[role]} of ${bold(goal)} points.`,
    ).join(' and ');
  },
})).play({
  module: require.main === module ? null : module,
  game() {
    return new Pig();
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
