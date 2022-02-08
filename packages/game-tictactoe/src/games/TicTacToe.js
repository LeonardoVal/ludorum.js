import { Game } from '@ludorum/core';

const ROLE_X = 'Xs';
const ROLE_O = 'Os';

const EMPTY_BOARD = '_________';
const WIN_X = /^(?:XXX.{6}|...XXX...|.{6}XXX|(?:X..){3}|(?:.X.){3}|(?:..X){3}|X...X...X|..X.X.X..)$/;
const WIN_O = /^(?:OOO.{6}|...OOO...|.{6}OOO|(?:O..){3}|(?:.O.){3}|(?:..O){3}|O...O...O|..O.O.O..)$/;

const MAPPINGS = '210543876 678345012 630741852 258147036 876543210 852741630 036147258'
  .split(' ')
  .map((str) => str.split('').map((chr) => +chr));

/** Implementation of the traditional [Tic-Tac-Toe game](http://en.wikipedia.org/wiki/Tictactoe).
*/
class TicTacToe extends Game {
  /** @inheritdoc */
  static get name() {
    return 'TicTacToe';
  }

  /** Builds a new TicTacToe game state.
   *
   * @param {object} [args]
   * @param {string} [args.board=EMPTY_BOARD]
  */
  constructor(args = null) {
    const { board } = args || {};
    super();
    this
      ._prop('board', board, 'string', EMPTY_BOARD);
  }

  /** TicTacToe's roles are `'Xs'` and `'Os'`.
   *
   * @property {string[]}
  */
  get roles() {
    return [ROLE_X, ROLE_O];
  }

  /** A match ends with a victory for any player that has three marks in line,
   * or a draw if the board is full.
   *
   * @property {object}
  */
  get result() {
    const { board } = this;
    if (board.match(WIN_X)) { // Xs wins.
      return this.victory(ROLE_X);
    }
    if (board.match(WIN_O)) { // Os wins.
      return this.victory(ROLE_O);
    }
    if (board.indexOf('_') < 0) { // No empty squares means a tie.
      return this.tied();
    }
    return null; // The game continues.
  }

  /** The active player's `moves()` are the indexes of empty squares in the
   * board.
   *
   * @property {object}
  */
  get actions() {
    const { activeRole, board, result } = this;
    if (!result) {
      const roleActions = [...board]
        .map((chr, i) => (chr === '_' ? i : -1)).filter((i) => i >= 0);
      return { [activeRole]: roleActions };
    }
    return null;
  }

  /** Every action puts the mark of the active player in the square indicated by
   * its number.
   *
   * @param {object} actions
  */
  perform(actions) {
    const { activeRole, board } = this;
    const { [activeRole]: position } = actions;
    if (board.charAt(position) !== '_') {
      throw new Error(`Invalid actions ${JSON.stringify(actions)} for board ${board}!`);
    }
    const boardArray = [...board];
    boardArray[position] = activeRole === ROLE_X ? 'X' : 'O';
    this.board = boardArray.join('');
  }

  /** @inheritdoc
  */
  get activeRoles() {
    const markBalance = [...this.board]
      .reduce((b, sq) => b + (({ X: 1, O: -1 })?.[sq] ?? 0));
    return markBalance > 0 ? [ROLE_O] : [ROLE_X];
  }

  // Utility methods ___________________________________________________________

  /** A TicTacToe board is hashed by converting it to a integer in base 3.
   *
   * @property {number}
  */
  get hashCode() {
    const { board } = this;
    const squareValue = { _: 0, X: 1, O: 2 };
    const boardNumber = board.split('').map((chr) => squareValue[chr]).join('');
    return parseInt(boardNumber, 3);
  }

  /** The `equivalent` states to a game state have symmetrical or rotated (or
   * both) boards. This method returns a sorted list of equivalent of boards
   * (_strings_). There can be 7 equivalent states for every game state.
   *
   * @yieds {string}
  */
  * equivalent() {
    const { board } = this;
    for (const mapping of MAPPINGS) {
      const newBoard = mapping.map((i) => board.charAt(i)).join('');
      yield newBoard;
    }
  }

  /** Creates a text (ASCII) version of the board.
   *
   * @returns {string}
  */
  boardASCII() {
    const { board } = this;
    return [0, 3, 6]
      .map((i) => board.substr(i, 3).split('').join('|'))
      .join('\n-+-+-\n');
  }

  /** Builds an heuristic evaluation function from weights for each square in
   * the board. The result of the function is the weighted sum, empty squares
   * being ignored, opponent squares considered negative.
   *
   * @param {number[]} weights
   * @returns {function}
  */
  static heuristicFromWeights(weights = null) {
    weights = weights || [2, 1, 2, 1, 5, 1, 2, 1, 2];
    const weightSum = weights.reduce((s, w) => s + Math.abs(w), 0);
    const result = function heuristic(game, role) {
      const roleChar = role === ROLE_X ? 'X' : 'O';
      return [...game.board].reduce(
        (sum, square, i) => (
          sum + (square === '_' ? 0 : weights[i] * (square === roleChar ? 1 : -1))
        ),
        0,
      ) / weightSum;
    };
    result.weights = weights;
    result.weightSum = weightSum;
    return result;
  }
} // class TicTacToe

/** Serialization and materialization using Sermat.
*/
TicTacToe.defineSERMAT('board');

export default TicTacToe;
