import readline from 'node:readline';
import { games, Match, utils } from '../../dist/core.es.mjs';

const { Bet } = games;
const { ansiBold, NodeConsoleInterface } = utils;

async function main() {
  const ui = new NodeConsoleInterface({
    renderHaps(haps) {
      return `${String.fromCharCode(9855 + haps.die)} ${haps.die}`;
    },
    renderGame(game) {
      const { goal, points } = game;
      return game.roles.map(
        (role) => `${ansiBold(role)} has ${points} of ${ansiBold(goal)} points.`,
      ).join(' and ');
    },
  });
  await ui.init(readline);
  return (
    new Match({
      game: new Bet(),
      players: [await ui.player()],
      spectators: [ui.spectator()],
    })
  ).playthrough();
} // function main

main();
