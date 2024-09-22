import { Game } from '@ludorum/core';
import { CheckerboardFromSquareList } from '@ludorum/utils-checkerboards';

const ROLES = ['Uppercase', 'Lowercase'];

const CHECKERBOARD = new CheckerboardFromSquareList({
  emptySquare: '.',
  height: 5,
  width: 5,
});

const INITIAL_BOARD = [
  'BBABB',
  'BBBBB',
  '.....',
  'bbbbb',
  'bbabb',
].join('');

/** Regular expressions used to optimize result calculations. They match if the
 * player has no A piece or if its opponent has an A piece in its rank.
*/
const PLAYER_ENDGAME_REGEXP = {
  [ROLES[0]]: /^[.Bab]+$|^.{0,4}[a]/,
  [ROLES[1]]: /^[.bAB]+$|[A].{0,4}$/,
};

/** TODO */
export class Bahab extends Game {
  /** TODO */
  static meta = {
    description: `Implementation of Bahab.`,
    name: 'Bahab',
    roles: [...ROLES],
  }

  /** TODO */
  static __actions(activeRole, board) {
    const moves = [...CHECKERBOARD.moveActions(
      board,
      activeRole === this.roles[0] ? {
        A: (c1) => CHECKERBOARD.deltas(c1,
          [[-1,+1], [ 0,-1], [+1,+1]],
          (c2) => !'AB'.includes(CHECKERBOARD.square(board, c2)),
        ),
        B: (c1) => CHECKERBOARD.deltas(c1,
          [[-1,+1], [+1,+1]],
          (c2) => !'AB'.includes(CHECKERBOARD.square(board, c2)),
        ),
      } : {
        a: (c1) => CHECKERBOARD.deltas(c1,
          [[-1,-1], [ 0,+1], [+1,-1]],
          (c2) => !'ab'.includes(CHECKERBOARD.square(board, c2)),
        ),
        b: (c1) => CHECKERBOARD.deltas(c1,
          [[-1,-1], [+1,-1]],
          (c2) => !'ab'.includes(CHECKERBOARD.square(board, c2)),
        ),
      }
    )].map(
      ([c1, c2]) => CHECKERBOARD.toAN(c1) + CHECKERBOARD.toAN(c2)
    );
    return moves.length > 0 ? { [activeRole]: moves } : null;
  }

  /** TODO */
  init(state = null) {
    const { constructor: thisClass } = this;
    const activeRole = state?.activeRole ?? thisClass.roles[0];
    const board = state?.board ?? INITIAL_BOARD;
    
    const loser = thisClass.roles.filter(
      (role) => PLAYER_ENDGAME_REGEXP[role].test(board)
    )[0];
    const actions = loser ? null : thisClass.__actions(activeRole, board);
    const result = !loser && actions ? null
      : this.zeroSumResult(loser ?? activeRole, -1);
    const isFinished = !!result;

    super.init({
      actions: isFinished ? null : actions,
      activeRole, board, isFinished, result,
    });
  }

  /** TODO */
  nextState(actions) {
    const { activeRole, board } = this;
    const { [activeRole]: move } = actions;
    const [coordFrom, coordTo] = /^([a-z]\d)([a-z]\d)$/.exec(move).slice(1, 3)
      .map((c) => CHECKERBOARD.fromAN(c));
    const newBoard = CHECKERBOARD.move(board, coordFrom, coordTo).join('');
    return {
      activeRole: this.nextRole(activeRole),
      board: newBoard,
    };
  }
} // class Bahab
