const readline = require('readline');
const { NodeConsoleInterface, RandomPlayer } = require('@ludorum/core');
// eslint-disable-next-line import/extensions, import/no-unresolved
const { Puzzle15 } = require('../../dist/game-puzzle15');

(new NodeConsoleInterface({
  readline,
  gameString(game) {
    const { checkerboard } = game;
    return checkerboard.renderAsText();
  },
})).play({
  module: require.main === module ? null : module,
  game() {
    return new Puzzle15();
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
