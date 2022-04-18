const readline = require('readline');
const { NodeConsoleInterface, RandomPlayer } = require('@ludorum/core');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { OddsAndEvens } = require('../../dist/game-oddsandevens');

const bold = (x) => `\x1b[1m${x}\x1b[0m`;

(new NodeConsoleInterface({
  readline,
  gameString(game) {
    const { turns, points, roles } = game;
    return `  ${turns} left. ${roles
      .map((role) => `${role} has ${points[role]} points.`)
      .join(' ')}`;
  },
})).play({
  module: require.main === module ? null : module,
  game() {
    return new OddsAndEvens();
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
