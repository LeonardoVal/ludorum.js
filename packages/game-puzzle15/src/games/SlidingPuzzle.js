/* eslint-disable max-classes-per-file */
import { Game } from '@ludorum/core';
import { ListCheckerboard } from '@ludorum/utils-checkerboards';

const ROLE = 'Player';

function shuffle(elems) {
  for (let i = elems.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [elems[i], elems[j]] = [elems[j], elems[i]];
  }
  return elems;
}

/** A [sliding puzzle](https://en.wikipedia.org/wiki/Sliding_puzzle) is a
 * combination puzzle, that consists in putting a set of pieces in order by
 * moving them to the only empty space in the frame.
 *
 * It is a good simple example of how to implement singleplayer games in
 * Ludorum. The only player in this game is `'Player'`.
 *
 * This is an abstract class. Subclasses must provide board dimensions and
 * maximum amount of moves.
*/
class SlidingPuzzle extends Game {
  /** @inheritdoc
  */
  static get name() {
    return 'SlidingPuzzle';
  }

  /** */
  static subclass(args) {
    const {
      height, width,
      maxMoves = Infinity,
      name = `${this.name}_${height}x${width}`,
      target = this.makeTarget(height, width),
    } = args || {};
    const checkerboard = new ListCheckerboard({
      dimensions: [width, height],
      emptySquare: ' ',
    });
    const result = class extends this {
      static get name() {
        return name;
      }

      get height() {
        return height;
      }

      get width() {
        return width;
      }

      get maxMoves() {
        return maxMoves;
      }

      get target() {
        return target;
      }

      get checkerboard() {
        return checkerboard.with([...this.board]);
      }
    };
    result.defineSERMAT('');
    return result;
  }

  /** Makes a target board.
   *
   * @param {number} width
   * @param {number} height
   * @param {string} [symbols]
   * @returns {string}
  */
  static makeTarget(width, height, symbols = null) {
    const target = Array(width * height - 1)
      .fill()
      .map((_, i) => symbols?.charAt(i) ?? i.toString(36))
      .join('')
      .toUpperCase();
    return `${target} `;
  }

  /** Builds a new SlidingPuzzle game state.
   *
   * @param {object} [args]
   * @param {string} [args.board]
   * @param {number} [args.moveNumber=0]
  */
  constructor(args = null) {
    const {
      board, moveNumber,
    } = args || {};
    super();
    this
      ._prop('moveNumber', moveNumber, 'number', 0)
      ._prop('board', board, 'string', shuffle([...this.target]).join(''));
  }

  /** The height of the board.
   *
   * @property {number}
  */
  get height() {
    return this._unimplemented('height');
  }

  /** The width of the board.
   *
   * @property {number}
  */
  get width() {
    return this._unimplemented('width');
  }

  /** The maximum amount of moves allowed to resolve the puzzle.
   *
   * @property {number}
  */
  get maxMoves() {
    return this._unimplemented('maxMoves');
  }

  /** SlidingPuzzle has only one player, and hence one role, called `'Player'`.
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

  /** Returns a `Checkerboard` instance for this puzzle.
   *
   * @property {Checkerboard}
  */
  get checkerboard() {
    const { height, width, board } = this;
    return new ListCheckerboard({
      dimensions: [width, height],
      emptySquare: ' ',
      squareValues: [...board],
    });
  }

  /** The player can move the empty square up, down, left or right. A move is
   * the coordinate where to move the empty square.
   *
   * @property {object}
  */
  get actions() {
    const { result } = this;
    if (result) {
      return null;
    }
    const { checkerboard } = this;
    const emptyCoord = checkerboard.findFirst(' ');
    const moves = [
      ...checkerboard.moves(emptyCoord, ...ListCheckerboard.DIRECTIONS.ORTHOGONAL),
    ];
    return {
      [ROLE]: moves.map((coord) => checkerboard.square(coord)),
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
    const { checkerboard } = this;
    const action = actions[ROLE];
    const emptyCoord = checkerboard.findFirst(' ');
    const actionCoord = checkerboard.findFirst(action);
    this.board = checkerboard.swap(emptyCoord, actionCoord).squareValues.join('');
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
} // class SlidingPuzzle

/** Serialization and materialization using Sermat.
*/
SlidingPuzzle.defineSERMAT('board moveNumber target');

export default SlidingPuzzle;
