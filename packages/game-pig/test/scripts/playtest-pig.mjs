import readline from 'node:readline';
import { Match, RandomPlayer, utils } from '@ludorum/core';
import { Pig } from '../../dist/game-pig.es.mjs';

const { ansiBold, NodeConsoleInterface } = utils;

async function main() {
  const ui = new NodeConsoleInterface({
    renderAction(action) {
      return action;
    },
    renderHaps(haps) {
      return `Die rolled ${haps.die}`;
    },
    renderGame(game) {
      const { goal, scores } = game;
      return game.roles.map(
        (role) => `${ansiBold(role)} has ${scores[role]} of ${ansiBold(goal)} points.`,
      ).join(' and ');
    },
  });
  await ui.init(readline);
  return (
    new Match({
      game: new Pig(),
      players: [await ui.player(), new RandomPlayer()],
      spectators: [ui.spectator()],
    })
  ).playthrough();
} // function main

main();
