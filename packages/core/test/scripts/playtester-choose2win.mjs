import readline from 'node:readline';
import { games, Match, players, utils } from '../../dist/core.es.mjs';

const { Choose2Win } = games;
const { RandomPlayer } = players;
const { ansiBold, NodeConsoleInterface } = utils;

async function main() {
  const ui = new NodeConsoleInterface({
    renderAction(action) {
      return action;
    },
    renderGame(game) {
      return `Turns left: ${game.isFinished ? `none` : game.turns}.`;
    },
  });
  await ui.init(readline);
  return (
    new Match({
      game: new Choose2Win(),
      players: [await ui.player(), new RandomPlayer()],
      spectators: [ui.spectator()],
    })
  ).playthrough();
} // function main

main().then(() => process.exit(0));
