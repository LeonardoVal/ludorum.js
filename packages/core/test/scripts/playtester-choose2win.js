const readline = require('readline');
const {
  Choose2Win, NodeConsoleInterface, RandomPlayer,
// eslint-disable-next-line import/extensions, import/no-unresolved
} = require('../../dist/core');

(new NodeConsoleInterface({
  readline,
  gameString(game, _role) {
    return `Turns left: ${game.winner ? `none. ${game.winner} won`
      : game.turns}.`;
  },
})).play({
  module: require.main === module ? null : module,
  game() {
    return new Choose2Win();
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
