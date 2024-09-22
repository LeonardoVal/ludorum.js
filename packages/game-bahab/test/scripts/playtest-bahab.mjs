import readline from 'node:readline';
import { Match, RandomPlayer, NodeConsoleInterface } from '@ludorum/core';
import { Bahab } from '../../dist/game-bahab.es.mjs';

const square = {
  '.': '\x1b[90m.\x1b[0m',
  A: '\x1b[1;93mA\x1b[0m',
  B: '\x1b[93mB\x1b[0m',
  a: '\x1b[1;92ma\x1b[0m',
  b: '\x1b[92mb\x1b[0m',
};

async function main() {
  const ui = new NodeConsoleInterface({
    renderAction(action) {
      return action;
    },
    renderGame(game) {
      const { activeRole, board } = game;
      let str = `Turn ${activeRole}`;
      for (let i = 0; i < board.length; i++) {
        str += (i % 5 === 0 ? '\n\t' : '') + square[board.charAt(i)];
      }
      return str;
    },
  });
  await ui.init(readline);
  return (
    new Match({
      game: new Bahab(),
      players: [await ui.player(), new RandomPlayer()],
      spectators: [ui.spectator()],
    })
  ).playthrough();
} // function main

main();
