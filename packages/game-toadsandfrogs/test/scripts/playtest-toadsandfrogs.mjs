import readline from 'node:readline';
import { Match, RandomPlayer, utils } from '@ludorum/core';
import { ToadsAndFrogs } from '../../dist/game-toadsandfrogs.es.mjs';

const { NodeConsoleInterface } = utils;

const squareT = '\x1b[93mT\x1b[0m';
const squareF = '\x1b[92mF\x1b[0m';
const emptySquare = (pos) => `\x1b[90m${pos}\x1b[0m`;

async function main() {
  const ui = new NodeConsoleInterface({
    renderGame(game) {
      const { board } = game;
      return [...board].map(
        (chr, i) => ({ T: squareT, F: squareF, _: emptySquare(i) })[chr],
      ).join('');
    },
  });
  await ui.init(readline);
  return (
    new Match({
      game: new ToadsAndFrogs(),
      players: [await ui.player(), new RandomPlayer()],
      spectators: [ui.spectator()],
    })
  ).playthrough();
} // function main

main();
