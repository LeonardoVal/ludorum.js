import { Game } from '@ludorum/core';
import { CheckerboardFromSquareList } from '@ludorum/utils-checkerboards';

const ROLE = 'Player';
const ACTIONS = {
  down: [0, +1],
  left: [-1, 0],
  right: [+1, 0],
  up: [0, -1],
};

/** A [sliding puzzle](https://en.wikipedia.org/wiki/Sliding_puzzle) is a
 * combination puzzle, that consists in putting a set of pieces in order by
 * moving them to the only empty space in the frame.
 *
 * It is a good simple example of how to implement singleplayer games in
 * Ludorum. The only player in this game is `'Player'`.
*/
export class SlidingPuzzle extends Game {
  /** SlidingPuzzle has only one player, and hence one role, called `'Player'`.
  */
  static meta = {
    description: `Implementation of a sliding puzzle.`,
    name: 'SlidingPuzzle',
    roles: [ROLE],
  }

  /** Makes a target board.
   *
   * @param {number} width
   * @param {number} height
   * @param {string} [symbols]
   * @returns {string}
  */
  static __target(width, height, symbols = null) {
    return Array(width * height - 1).fill(0)
      .map((_, i) => symbols?.charAt(i % symbols.length) ?? (i % 36).toString(36))
      .join('') +' ';
  }

  /** TODO */
  static __board(target) {
    const result = [];
    for (const elems = [...target]; elems.length > 0; ) {
      result.push(elems.splice(Math.floor(Math.random() * elems.length), 1));
    }
    return result.join('');
  }

  /** TODO */
  static __actions(board, isFinished, height, width) {
    const checkerboard = new CheckerboardFromSquareList({
      emptySquare: ' ', height, width,
    });
    const [emptySquare] = [...checkerboard.squares(
      board, (square, coord) => square === ' ' ? coord : undefined,
    )];
    const actions = isFinished ? null : {
      [ROLE]: Object.keys(ACTIONS).filter((action) => (
        !!checkerboard.delta(emptySquare, ACTIONS[action])
      )),
    };
    return { actions, emptySquare };
  }

  /** The player can move the empty square up, down, left or right. A move is
   * the coordinate where to move the empty square.
  */
  init(state = null) {
    const { constructor: thisClass } = this;
    const height = state?.height ?? 4;
    const width = state?.width ?? height;
    const target = state?.target ?? thisClass.__target(width, height, state?.symbols);
    const turnCount = state?.turnCount 
      ?? Math.ceil(2 ** (height - 2) * height * 5.2); // Default assumes height = width.
    const turn = state?.turn ?? 0;
    const board = state?.board ?? thisClass.__board(target);

    const resolved = [...board].every((x, i) => x === target.charAt(i));
    const isFinished = resolved || turn >= turnCount;
    const { emptySquare, actions } = thisClass
      .__actions(board, isFinished, height, width);
    const result = isFinished ? { [ROLE]: resolved ? +1 : -1 } : null;

    super.init({
      actions, board, emptySquare, height, isFinished, result, target,
      turn, turnCount, width,
    });
  }

  /** The next game state is calculated simply by swapping the contents of the
   * empty square and the given position in the board.
  */
  nextState(actions) {
    const {
      board, emptySquare, height, width, target, turn, turnCount,
    } = this;
    const move = actions[ROLE];
    const checkerboard = new CheckerboardFromSquareList({
      emptySquare: ' ', height, width,
    });
    const moveCoord = checkerboard.delta(emptySquare, ACTIONS[move]);
    const newBoard = checkerboard.swap([...board], emptySquare, moveCoord)
      .join('');
    return {
      board: newBoard, height, width, target, turn: turn + 1, turnCount,
    };
  }

} // class SlidingPuzzle
