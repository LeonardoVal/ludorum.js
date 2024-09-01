import { Game } from '@ludorum/core';

const ROLE_X = 'Xs';
const ROLE_O = 'Os';

const EMPTY_BOARD = '_________';

const WIN_X = /^(?:XXX.{6}|...XXX...|.{6}XXX|(?:X..){3}|(?:.X.){3}|(?:..X){3}|X...X...X|..X.X.X..)$/;
const WIN_O = /^(?:OOO.{6}|...OOO...|.{6}OOO|(?:O..){3}|(?:.O.){3}|(?:..O){3}|O...O...O|..O.O.O..)$/;

/** Implementation of the traditional [Tic-Tac-Toe game](http://en.wikipedia.org/wiki/Tictactoe).
*/
export class TicTacToe extends Game {
  /** TicTacToe's roles are `'Xs'` and `'Os'`. 
   * 
  */
  static meta = {
    description: `Implementation of the traditional Tic-Tac-Toe game.`,
    name: 'TicTacToe',
    roles: [ROLE_X, ROLE_O],
  }

  /** Builds a new TicTacToe game state. The board is represented by a string
   * with `'_'` for empty squares, and `'X'` or `'O'` for marked squares. 
   * 
   * The active player is determined by the amount of marks in the board, with
   * the first player being Xs. The active player's `actions` are the indexes of
   * empty squares in the board.
   * 
   * A match ends with a victory for any player that has three marks in line, or
   * a draw if the board is full.
   *
   * @param {object} [state=null]
   * @param {string} [state.board=EMPTY_BOARD]
  */
  init(state = null) {
    const board = state?.board ?? EMPTY_BOARD;
    const winner = board.match(WIN_X) ? ROLE_X
      : board.match(WIN_O) ? ROLE_O : null;
    const isFinished = !!winner || board.indexOf('_') < 0;

    let actions, activeRole, result;
    if (isFinished) {
      actions = null;
      result = this.zeroSumResult(winner ?? ROLE_X, winner ? 1 : 0);
    } else {
      result = null;
      const markBalance = [...board]
        .reduce((b, sq) => b + (({ X: 1, O: -1 })[sq] ?? 0), 0);
      activeRole = markBalance > 0 ? ROLE_O : ROLE_X;
      actions = {
        [activeRole]: [...board]
          .map((chr, i) => (chr === '_' ? i : -1)).filter((i) => i >= 0)
      };
    }
    
    super.init({ actions, activeRole, board, isFinished, result });
  }

  /** Every action puts the mark of the active player in the square indicated by
   * its number.
   *
   * @param {Record<string, number>} actions
  */
  nextState(actions, haps) {
    const { activeRole, board } = this;
    const { [activeRole]: position } = actions;
    const boardArray = [...board];
    boardArray[position] = activeRole === ROLE_X ? 'X' : 'O';
    return { board: boardArray.join('') };
  }

// Utilities ___________________________________________________________________

  /** @inheritdoc */
  get identifier() {
    return this.board;
  }

  /** @inheritdoc */
  features(role) {
    const squares = {
      X: role === ROLE_X ? 1 : -1,
      O: role === ROLE_X ? -1 : 1,
    };
    return new Int16Array(
      [...this.board].map((sq) => squares[sq] ?? 0),
    );
  }

  /** The `equivalent` states to a game state have symmetrical or rotated (or
   * both) boards. This method returns a sorted list of equivalent of boards
   * (_strings_). There can be 7 equivalent states for every game state.
   *
   * @param {string} board
   * @yieds {string}
  */
  static* equivalent(board) {
    const MAPPINGS = [
    //'012345678'     original
      '210543876', // horizontal symmetry
      '678345012', // vertical symmetry
      '630741852', // 90º clockwise
      '258147036', // 90º counter-clockwise 
      '876543210', // 180º
      '852741630', // 90º counter-clockwise + horizontal symmetry
      '036147258', // 90º clockwise + horizontal symmetry
    ].map((str) => [...str].map((n) => +n));
    for (const mapping of MAPPINGS) {
      const newBoard = mapping.map((i) => board.charAt(i)).join('');
      yield newBoard;
    }
  }

} // class TicTacToe
