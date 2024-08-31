import readline from 'node:readline';
import { Match, players, utils } from '@ludorum/core';
import { TicTacToe } from '../../dist/game-tictactoe.es.mjs';

const { NodeConsoleInterface } = utils;
const { RandomPlayer } = players;

const squareX = '\x1b[93mX\x1b[0m';
const squareO = '\x1b[92mO\x1b[0m';
const emptySquare = (pos) => `\x1b[90m${pos}\x1b[0m`;

async function main() {
  const ui = new NodeConsoleInterface({
    renderGame(game) {
      const { board } = game;
    const boardString = [...board].map(
      (chr, i) => ({ X: squareX, O: squareO, _: emptySquare(i) })[chr],
    );
    return [0, 3, 6]
      .map((i) => boardString.slice(i, i + 3).join('|'))
      .join('\n-+-+-\n');
    },
  });
  await ui.init(readline);
  return (
    new Match({
      game: new TicTacToe(),
      players: [await ui.player(), new RandomPlayer()],
      spectators: [ui.spectator()],
    })
  ).playthrough();
} // function main

main();
