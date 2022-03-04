import { Game } from '@ludorum/core';
import { ListCheckerboard } from '@ludorum/utils-checkerboards';

const ROLES = ['Uppercase', 'Lowercase'];

const DEFAULT_SCORE = { [ROLES[0]]: 0, [ROLES[1]]: 0 };

const INITIAL_BOARD = ['BBABB', 'BBBBB', '.....', 'bbbbb', 'bbabb'].join('');

const CHECKERBOARD = new ListCheckerboard({ dimensions: [5, 5], emptySquare: '.' });

const COORD_MAP = [...CHECKERBOARD.coordinates()].reduce((map, coord) => {
  const coordString = CHECKERBOARD.coord(coord, 'string');
  map.set(`${coord}`, coordString);
  map.set(coordString, coord);
  return map;
}, new Map());

// Regular expressions used to optimize result calculations. They match if the
// player has no A piece or if its opponent has an A piece in its rank.
const PLAYER_ENDGAME_RE = {
  [ROLES[0]]: /^[.Bab]+$|^.{0,4}[a]/,
  [ROLES[1]]: /^[.bAB]+$|[A].{0,4}$/,
};

// Shortcut for calculating the moves of each piece of each player.
const pieceMoves = {
  [ROLES[0]](value, [x, y]) {
    return ({
      A: [[x - 1, y + 1], [x, y - 1], [x + 1, y + 1]],
      B: [[x - 1, y + 1], [x + 1, y + 1]],
    })[value] ?? [];
  },
  [ROLES[1]](value, [x, y]) {
    return ({
      a: [[x - 1, y - 1], [x, y + 1], [x + 1, y - 1]],
      b: [[x - 1, y - 1], [x + 1, y - 1]],
    })[value] ?? [];
  },
};

/** Bahab is a game invented for Ludorum as a simple example of a chess like
 * board game.
*/
class Bahab extends Game {
  /** @inheritdoc */
  static get name() {
    return 'Bahab';
  }

  /** The initial board has two ranks of pieces for each player. All B pieces
   * except one A piece at the center of the first rank.
  */
  static get initialBoard() {
    return INITIAL_BOARD;
  }

  /** Builds a new Bahab game state:
   *
   * @param {string} [args.activeRole='Uppercase'] - The active player,
   *   Uppercase by default.
   * @param {string} [args.board=initialBoard] - A string with the current board
   *   state. The initial board is assumed by default.
  */
  constructor(args = null) {
    const { activeRole = 0, board } = args || {};
    super({ activeRoles: [activeRole] });
    this
      ._prop('board', board, 'string', this.constructor.initialBoard);
  }

  get checkerboard() {
    return CHECKERBOARD.with([...this.board]);
  }

  /** Roles are `Uppercase` and `Lowercase`.
   *
   * @property {string[]}
  */
  get roles() {
    return [...ROLES];
  }

  /** All pieces move one square forward. Piece A can move straight backwards or
   * diagonally forward, and B pieces move only diagonally forward. Pieces can
   * move to any square that is empty or occupied by an opponent's piece of the
   * same type. If the piece moves to an occupied square, it captures the piece
   * in it.
   *
   * @property {object}
  */
  get actions() {
    const { activeRole, checkerboard } = this;
    const moves = [];
    const activeRolePieces = activeRole === ROLES[0] ? 'AB' : 'ab';
    for (const [value, coordFrom] of checkerboard.squares()) {
      if (value !== '.') {
        const coordFromString = COORD_MAP.get(`${coordFrom}`);
        for (const coordTo of pieceMoves[activeRole](value, coordFrom)) {
          const coordToString = COORD_MAP.get(`${coordTo}`);
          if (coordToString) {
            const squareTo = checkerboard.square(coordTo);
            if (!activeRolePieces.includes(squareTo)) {
              moves.push(coordFromString + coordToString);
            }
          }
        }
      }
    }
    return moves.length > 0 ? { [activeRole]: moves } : null;
  }

  /** A player wins when it moves its A piece to the opponent's first rank, and
   * loses when its A piece is captured by the opponent.
   *
   * @property {object}
  */
  get result() {
    const { activeRole, board, roles } = this;
    for (const role of roles) {
      if (PLAYER_ENDGAME_RE[role].test(board)) {
        return this.defeat(role);
      }
    }
    return this.actions ? null : this.defeat(activeRole);
  }

  /** Valid move for this game are pairs of coordinates (`[row, column]`), the
   * first one being where the moving piece starts, and the second one being
   * where the moving piece ends.
   *
   * @param {object} actions
   * @param {object} haps
   * @return {Game}
  */
  perform(actions, haps) {
    if (haps) {
      throw new Error(`Haps are not required (given ${JSON.stringify(haps)})!`);
    }
    const { activeRole } = this;
    const { [activeRole]: action } = actions;
    const [coordFrom, coordTo] = (
      /^([a-e][1-5])([a-e][1-5])$/.exec((action ?? '').trim()) || [0, 0, 0]
    ).slice(1).map((s) => COORD_MAP.get(s));
    if (!coordFrom || !coordTo) {
      throw new Error(`Invalid actions ${JSON.stringify(actions)} for ${this}!`);
    }
    this.activateRoles(this.opponent(activeRole));
    this.board = this.checkerboard.move(coordFrom, coordTo).squareValues.join('');
    return this;
  }
} // class Bahab

Game.cachedProperties(Bahab);

/** Serialization and materialization using Sermat.
*/
Bahab.defineSERMAT('activeRole board');

export default Bahab;
