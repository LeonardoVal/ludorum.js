import { Game } from '@ludorum/core';

const ROLE_TOADS = 'Toads';
const ROLE_FROGS = 'Frogs';

/** Implementation of the [Toads & Frogs](http://en.wikipedia.org/wiki/Toads_and_Frogs_%28game%29)
 * game.
*/
class ToadsAndFrogs extends Game {
  /** @inheritdoc */
  static get name() {
    return 'ToadsAndFrogs';
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

  /** Builds a new ToadsAndFrogs game state:
   *
   * @param {object} [args]
   * @param {string} [args.board='TTT__FFF'] - The current board.
  */
  constructor(args = null) {
    const {
      activeRole = 0, board,
    } = args || {};
    super({ activeRoles: [activeRole] });
    this
      ._prop('board', board, 'string', 'TTT__FFF');
  }

  /** Players for Odds & Evens are named `Evens` and `Odds`.
   *
   * @property {string[]}
  */
  get roles() {
    return [ROLE_TOADS, ROLE_FROGS];
  }

  /** The active players `moves` is a list of square indexes (integers) in the
   * board, where chips can be moved in one of the two ways possible in this
   * game.
   *
   * @property {object}
  */
  get actions() {
    const { activeRole, board, roles } = this;
    const regExp = activeRole === roles[0] ? /TF?_/g : /_T?F/g;
    const moves = [];
    board.replace(regExp, (m, i) => {
      moves.push(i);
      return m;
    });
    return moves.length > 0 ? { [activeRole]: moves } : null;
  }

  /** The match finishes when one player cannot move, hence losing the game.
   *
   * @property {object}
  */
  get result() {
    const { actions, activeRole } = this;
    return actions ? null : this.defeat(activeRole);
  }

  /** TODO
   *
   * @param {object} actions
   * @param {object} haps
   * @return {Game}
  */
  perform(actions, haps) {
    const { activeRole, board } = this;
    if (haps) {
      throw new Error(`Haps are not required (given ${JSON.stringify(haps)})!`);
    }
    const move = actions[activeRole];
    if (board.substr(move, 2) === 'T_') {
      this.board = `${board.substring(0, move)}_T${board.substring(move + 2)}`;
    } else if (board.substr(move, 2) === '_F') {
      this.board = `${board.substring(0, move)}F_${board.substring(move + 2)}`;
    } else if (board.substr(move, 3) === 'TF_') {
      this.board = `${board.substring(0, move)}_FT${board.substring(move + 3)}`;
    } else if (board.substr(move, 3) === '_TF') {
      this.board = `${board.substring(0, move)}FT_${board.substring(move + 3)}`;
    } else {
      throw new Error(`Invalid actions ${JSON.stringify(actions)} for ${this}!`);
    }
    this.activateRoles(this.opponent(activeRole));
  }
} // class ToadsAndFrogs.

/** Serialization and materialization using Sermat.
*/
ToadsAndFrogs.defineSERMAT('activeRole board');

export default ToadsAndFrogs;
