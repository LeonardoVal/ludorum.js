const readline = require('readline');
const {
  Bet, NodeConsoleInterface, RandomPlayer,
// eslint-disable-next-line import/extensions, import/no-unresolved
} = require('../../dist/core');

const bold = (x) => `\x1b[1m${x}\x1b[0m`;

(new NodeConsoleInterface({
  readline,
  gameString(game, role) {
    const { goal, points } = game;
    return `${bold(role)} has ${points} of ${bold(goal)} points.`;
  },
})).play({
  module: require.main === module ? null : module,
  game() {
    return new Bet();
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
