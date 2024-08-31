import readline from 'node:readline';
import { Match, players, utils } from '@ludorum/core';
import { OddsAndEvens } from '../../dist/game-oddsandevens.es.mjs';

const { NodeConsoleInterface } = utils;
const { RandomPlayer } = players;

async function main() {
  const ui = new NodeConsoleInterface({
    renderAction(action) {
      return action;
    },
    renderGame(game) {
      const { turns, points, roles } = game;
      return `  ${turns} left. ${roles
        .map((role) => `${role} has ${points[role]} points.`)
        .join(' ')}`;
    },
  });
  await ui.init(readline);
  return (
    new Match({
      game: new OddsAndEvens(),
      players: [await ui.player(), new RandomPlayer()],
      spectators: [ui.spectator()],
    })
  ).playthrough();
} // function main

main();
