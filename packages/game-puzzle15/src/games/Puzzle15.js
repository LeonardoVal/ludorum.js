import Game from '@ludorum/core/games/Game';

const ROLE = 'Player';
const MAX_MOVES = 81;

function* orthogonals([row, col], width, height) {
  if (row > 0) yield [row - 1, col];
  if (row < height - 1) yield [row + 1, col];
  if (col > 0) yield [row, col - 1];
  if (col < width - 1) yield [row, col + 1];
}

function shuffle(elems) {
  for (let i = elems.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [elems[i], elems[j]] = [elems[j], elems[i]];
  }
  return elems;
}

/** The [15 puzzle](https://en.wikipedia.org/wiki/15_puzzle) is a simple sliding
 * puzzle, that consists in putting a set of pieces in order by moving them to
 * the only empty space in the frame.
 *
 * It is included here as a test of the support in Ludorum for singleplayer
 * games. The only player in this game is `'Player'`.
*/
class Puzzle15 extends Game {
  /** @inheritdoc
  */
  static get name() {
    return 'Puzzle15';
  }

  /** The puzzle usually starts with a `randomBoard`.
   *
   * @param {number} [width=4]
   * @param {number} [height=4]
   * @returns {string}
  */
  static makeTarget(width = 4, height = 4) {
    const symbols = Array(width * height - 1)
      .fill()
      .map((_, i) => i.toString(36)).join('')
      .toUpperCase();
    return `${symbols} `;
  }

  /** Builds a new Puzzle15 game state.
   *
   * @param {object} [args]
   * @param {number} [args.width=4]
   * @param {string} [args.board]
   * @param {number} [args.maxMoves=81]
   * @param {number} [args.moveNumber=0]
   * @param {number} [args.target]
  */
  constructor(args = null) {
    const {
      board, maxMoves, moveNumber, target, width,
    } = args || {};
    super();
    this
      ._prop('width', width, 'number', 4)
      ._prop('maxMoves', maxMoves, 'number', MAX_MOVES)
      ._prop('moveNumber', moveNumber, 'number', 0)
      ._prop('target', target, 'string', this.constructor.makeTarget(this.width, this.width))
      ._prop('board', board, 'string', shuffle([...this.target]).join(''));
  }

  /** The height of the `board`, given its length and `width`.
   *
   * @property {number}
  */
  get height() {
    const { board, width } = this;
    return board.length / width;
  }

  /** Puzzle15 has only one player, and hence one role, called `'Player'`.
   *
   * @property {string[]}
  */
  get roles() {
    return [ROLE];
  }

  /** The puzzle is finished when the pieces and the empty square are arranged
   * in the `target` configuration.
   *
   * @param {string} target
  */
  differences(target) {
    const { board } = this;
    const result = [...board]
      .reduce((sum, sq, i) => sum + (sq === target[i] ? 0 : 1));
    return result;
  }

  /** The puzzle can only end in victory, or remain unsolved.
   *
   * @property {object}
  */
  get result() {
    const { maxMoves, moveNumber, target } = this;
    if (this.differences(target) === 0) {
      return { [ROLE]: +1 };
    }
    if (moveNumber >= maxMoves) {
      return { [ROLE]: -1 };
    }
    return null;
  }

  /** The moves of the player are defined by the position of the empty square.
   *
   * @property {number[]}
  */
  get emptyCoord() {
    const { board, width } = this;
    const i = board.indexOf(' ');
    return [Math.floor(i / width), i % width];
  }

  /** The player can move the empty square up, down, left or right. A move is
   * the coordinate where to move the empty square.
   *
   * @property {object}
  */
  get actions() {
    const {
      emptyCoord, result, width, height,
    } = this;
    if (result) {
      return null;
    }
    const moves = [...orthogonals(emptyCoord, width, height)];
    return {
      [ROLE]: moves.map(([row, col]) => row * width + col),
    };
  }

  /** The next game state is calculated simply by swapping the contents of the
   * empty square and the given position in the board.
   *
   * @param {object} actions
   * @param {object} haps
  */
  perform(actions, haps) {
    if (haps) {
      throw new Error(`Haps are not required (given ${JSON.stringify(haps)})!`);
    }
    const { board } = this;
    const action = actions[ROLE];
    const emptyCoord = board.indexOf(' ');
    const nextBoard = [...board];
    nextBoard[emptyCoord] = nextBoard[action];
    nextBoard[action] = ' ';
    this.board = nextBoard.join('');
    this.moveNumber += 1;
  }

  /** @inheritdoc
  */
  get activeRoles() {
    return [...this.roles];
  }

  /** The score of the player is the number of remaining moves.
  */
  get scores() {
    const { maxMoves, moveNumber } = this;
    return { [ROLE]: maxMoves - moveNumber };
  }
} // class Puzzle15

/** Serialization and materialization using Sermat.
*/
Puzzle15.defineSERMAT('board maxMoves moveNumber target width');

export default Puzzle15;
