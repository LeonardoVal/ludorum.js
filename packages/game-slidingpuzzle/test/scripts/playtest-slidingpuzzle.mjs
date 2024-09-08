import readline from 'node:readline';
import { Match, RandomPlayer, NodeConsoleInterface } from '@ludorum/core';
import { SlidingPuzzle } from '../../dist/game-slidingpuzzle.es.mjs';

async function main() {
  const ui = new NodeConsoleInterface({
    renderAction(action) {
      return action;
    },
    renderGame(game) {
      const { board, width, turn, turnCount } = game;
      let str = `Turn ${turn}/${turnCount}`;
      for (let i = 0; i < board.length; i++) {
        str += (i % width === 0 ? '\n\t' : '') + board.charAt(i);
      }
      return str;
    },
  });
  await ui.init(readline);
  return (
    new Match({
      game: new SlidingPuzzle(),
      players: [await ui.player(), new RandomPlayer()],
      spectators: [ui.spectator()],
    })
  ).playthrough();
} // function main

main();
