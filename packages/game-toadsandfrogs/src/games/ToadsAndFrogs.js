import { Game } from '@ludorum/core';

const ROLE_TOADS = 'Toads';
const ROLE_FROGS = 'Frogs';

/** Implementation of the [Toads & Frogs](http://en.wikipedia.org/wiki/Toads_and_Frogs_%28game%29)
 * game.
*/
export class ToadsAndFrogs extends Game {
  /** TODO */
  static meta = {
    description: `Implementation of Toads & Frogs.`,
    name: 'ToadsAndFrogs',
    roles: [ROLE_TOADS, ROLE_FROGS],
  }

  /** A `board` builder for Toads & Frogs. These boards are single rows with a
   * given number of `chips` for each player (toads to the left and frogs to the
   * right) separated by the given number of empty spaces (`separation`).
   *
   * @param {number} [chips=3]
   * @param {number} [separation=2]
  */
  static board(chips = NaN, separation = NaN) {
    chips = Number.isNaN(chips) ? 3 : +chips;
    separation = Number.isNaN(separation) ? 2 : +separation;
    return 'T'.repeat(chips) + '_'.repeat(separation) + 'F'.repeat(chips);
  }

  /** The active players `moves` is a list of square indexes (integers) in the
   * board, where chips can be moved in one of the two ways possible in this
   * game.
   * 
   * The match finishes when one player cannot move, hence losing the game.
  */
  init(state = null) {
    const { roles } = this;
    const activeRole = state?.activeRole ?? roles[0];
    const board = state?.board ?? this.constructor.board();
    
    const movesRegExp = activeRole === roles[0] ? /TF?_/g : /_T?F/g;
    const moves = [];
    board.replace(movesRegExp, (m, i) => {
      moves.push(i);
      return m;
    });
    const isFinished = moves.length < 1;
    const actions = isFinished ? null : { [activeRole]: moves };
    const result = isFinished ? this.zeroSumResult(activeRole, -1) : null;
    super.init({
      actions, activeRole, board, isFinished, result,
    });
  }

  /** TODO */
  nextState(actions, haps) {
    this.confirmTransition(actions, haps);
    const { activeRole, board, roles } = this;
    const move = actions[activeRole];
    let newBoard = null;
    if (board.substr(move, 2) === 'T_') {
      newBoard = `${board.substring(0, move)}_T${board.substring(move + 2)}`;
    } else if (board.substr(move, 2) === '_F') {
      newBoard = `${board.substring(0, move)}F_${board.substring(move + 2)}`;
    } else if (board.substr(move, 3) === 'TF_') {
      newBoard = `${board.substring(0, move)}_FT${board.substring(move + 3)}`;
    } else if (board.substr(move, 3) === '_TF') {
      newBoard = `${board.substring(0, move)}FT_${board.substring(move + 3)}`;
    } else {
      throw new Error(`Invalid actions ${JSON.stringify(actions)} for ${this}!`);
    }
    const opponent = roles[(roles.indexOf(activeRole) + 1) % 2];
    return { board: newBoard, activeRole: opponent };
  }
} // class ToadsAndFrogs
