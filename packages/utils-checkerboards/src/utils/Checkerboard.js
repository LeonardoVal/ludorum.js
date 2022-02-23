/* eslint-disable max-classes-per-file */
import { BaseClass } from '@ludorum/core';
import { columnName } from './coordinates';

/** Base class for checkerboards representations based on several different data
 * structures.
*/
class Checkerboard extends BaseClass {
  /** Base constructor for all checkerboards.
   *
   * @param {object} [args]
   * @param {number[]} [args.dimensions]
   * @param {any} [args.emptySquare] - The value for empty squares that will be
   *   used in functions walking and traversing the board.
  */
  constructor(args) {
    const { dimensions } = args || {}; // TODO Allow override for arrayType.
    super();
    this
      ._prop('dimensions', this.arrayType.of(...dimensions));
  }

  /** The array type used for coordinates. By default is `Uint16Array`.
   *
   * @property {class<TypedArray>}
  */
  get arrayType() {
    return Uint16Array;
  }

  /** The checkerboard dimensions are defined by an array of numbers.
   *
   * @property {number[]}
  */
  get dimensions() {
    return this._unimplemented('dimensions');
  }

  /** The `size` is the amount of squares in the checkerboard.
   *
   * @property {number}
  */
  get size() {
    const { dimensions: [sizeX, sizeY] } = this;
    return sizeX * sizeY;
  }

  /** Shortcut for the first dimension of the checkeboard.
   *
   * @property {number}
  */
  get width() {
    return this.dimensions[0];
  }

  /** Shortcut for the second dimension of the checkerboard.
   *
   * @property {number}
  */
  get height() {
    return this.dimensions[1];
  }

  /** */
  coord(value, type = 'array') {
    if 
  }

  // Coordinates & lines _______________________________________________________



  /** Returns an index (i.e. possitive integer identifier) for the given
   * coordinate. If the coordinate is not valid, returns `outside`.
   *
   * @param {number[]} coord
   * @param {number} [outside] - If not provided, an invalid coordinate will
   *   raise an error. If provided this value will be returned in that case
   *   instead.
   * @returns {number}
  */
  coordToIndex(coord, outside) {
    const { dimensions: [sizeX, sizeY] } = this;
    if (!this.isValidCoord(coord)) {
      if (arguments.length > 1) {
        return outside;
      }
      throw new Error(`Invalid coord (${coord}) for checkerboard ${sizeX}x${sizeY}!`);
    }
    const [x, y] = coord;
    return x + y * sizeX;
  }

  /** Returns a string for the given coordinate, first a letter for the column
   * (`a` to `z`) and then a number for the row (starting by 1).
   *
   * @param {number[]} coord
   * @return {string}
  */
  coordToString(coord) {
    const { dimensions: [sizeX, sizeY] } = this;
    if (!this.isValidCoord(coord)) {
      throw new Error(`Invalid coord (${coord}) for checkerboard ${sizeX}x${sizeY}!`);
    }
    return `${columnName(coord[0])}${coord[1] + 1}`;
  }

  /** Returns the coordinate for the given index (i.e. possitive integer
   * identifier). If the index is not valid, returns `outside`.
   *
   * @param {number} index
   * @param {number[]} [outside] - If not provided, an invalid index will raise
   *   an error. If provided this value will be returned in that case instead.
   * @returns {number[]}
  */
  coordFromIndex(index, outside) {
    const { dimensions: [sizeX, sizeY] } = this;
    if (Number.isNaN(index) || index < 0 || index >= this.size) {
      if (arguments.length > 1) {
        return outside;
      }
      throw new Error(`Invalid index (${index}) for checkerboard ${sizeX}x${sizeY}!`);
    }
    return makeCoord(index % sizeX, index / sizeX);
  }

  /** All coordinates are represented by arrays. To check if a coordinate is
   * inside the board, use `isValidCoord(coord)`.
   *
   * @param {number[]} coord
   * @returns {boolean}
  */
  isValidCoord(coord) {
    const { dimensions: [sizeX, sizeY] } = this;
    const [x, y] = coord;
    return !Number.isNaN(x) && x >= 0 && x < sizeX
      && !Number.isNaN(y) && y >= 0 && y < sizeY;
  }

  /** Method `coordinates` returns the sequence of the board's valid positions.
   *
   * @yields {number[]}
  */
  * coordinates() {
    const { dimensions: [sizeX, sizeY] } = this;
    for (let x = 0; x < sizeX; x += 1) {
      for (let y = 0; y < sizeY; y += 1) {
        yield this.arrayType.of(x, y);
      }
    }
  }

  /** Generates all the horizontal lines (rows) in the board.
   *
   * @yields {number[][]}
  */
  * horizontalLines() {
    const { dimensions: [sizeX, sizeY] } = this;
    const rangeX = Array(sizeX).fill().map((_, i) => i);
    for (let y = 0; y < sizeY; y += 1) {
      yield rangeX.map((x) => makeCoord(x, y));
    }
  }

  /** Generates all vertical lines (columns) in the board.
   *
   * @yields {number[][]}
  */
  * verticalLines() {
    const { dimensions: [sizeX, sizeY] } = this;
    const rangeY = Array(sizeY).fill().map((_, i) => i);
    for (let x = 0; x < sizeX; x += 1) {
      yield rangeY.map((y) => makeCoord(x, y));
    }
  }

  /** Generates all the horizontal (rows) and vertical lines (columns) in the
   * board.
   *
   * @yields {number[][]}
  */
  * orthogonalLines() {
    yield* this.horizontalLines();
    yield* this.verticalLines();
  }

  /** Generates all the positive diagonals lines (those where row = k + column).
   *
   * @yields {number[][]}
  */
  * positiveDiagonalLines() {
    const { dimensions: [sizeX, sizeY] } = this;
    const count = sizeX + sizeY - 1;
    for (let i = 0; i < count; i += 1) {
      const x = Math.max(0, i - sizeY + 1);
      const y = Math.max(0, sizeY - i - 1);
      yield Array(Math.min(i + 1, count - i)).fill()
        .map((_, j) => makeCoord(x + j, y + j));
    }
  }

  /** Generates all the negative diagonals lines (those where row = k - column).
   *
   * @yields {number[][]}
  */
  * negativeDiagonalLines() {
    const { dimensions: [sizeX, sizeY] } = this;
    const count = sizeX + sizeY - 1;
    for (let i = 0; i < count; i += 1) {
      const x = Math.max(0, i - sizeY + 1);
      const y = Math.min(i, sizeY - 1);
      yield Array(Math.min(i + 1, count - i)).fill()
        .map((_, j) => makeCoord(x + j, y - j));
    }
  }

  /** Generates all the diagonal lines in the board.
   *
   * @yields {number[][]}
  */
  * diagonalLines() {
    yield* this.positiveDiagonalLines();
    yield* this.negativeDiagonalLines();
  }

  /** Generates all the horizontal, vertical and diagonal lines in the board.
   *
   * @yields {number[][]}
  */
  * lines() {
    yield* this.orthogonalLines();
    yield* this.diagonalLines();
  }

  /** The previous methods return the whole lines. Some times the game logic
   * demands checking lines of a certain length. These are sublines, and can be
   * calculated by `sublines`. It obviously filters lines which are shorter than
   * length.
   *
   * @param {number[][]} lines
   * @param {number} length
   * @yields {number[][]}
  */
  * sublines(lines, length) {
    for (const line of lines) {
      if (line.length >= length) {
        const startCap = line.length - length + 1;
        for (let start = 0; start < startCap; start += 1) {
          yield line.slice(start, start + length);
        }
      }
    }
  }

  /** A walk is a sequence of coordinates in the board that start at a given
   * point and advances in a certain direction. The `walk` method generates the
   * coordinates from `coord` and on, adding `delta`'s until going off the board.
   *
   * @param {number[]} coord
   * @param {number[]} delta
   * @param {function} [until]
   * @yields {number[]}
  */
  * walk(coord, delta, until = null) {
    coord = Uint16Array.from(coord);
    while (this.isValidCoord(coord) && (!until || until(coord))) {
      yield coord;
      coord = coord.map((n, i) => n + delta[i]);
    }
  }

  /** Convenient method `walks` can be used to get many walks from the same
   * origin.
   *
   * @param {number[]} coord
   * @param {number[][]} deltas
   * @param {function} [until]
   * @yields {number[]}
  */
  * walks(coord, deltas, until = null) {
    for (const delta of deltas) {
      yield [...this.walk(coord, delta, until)];
    }
  }

  /** Returns the valid `moves` from the given `coord` and the given `deltas`.
   *
   * @param {number[]} coord
   * @param {...number[]} deltas
   * @yield {number[]}
  */
  * moves(coord, ...deltas) {
    const [x, y] = coord;
    for (const [dx, dy] of deltas) {
      const m = Uint16Array.of(x + dx, y + dy);
      if (this.isValidCoord(m)) {
        yield m;
      }
    }
  }

  /** Frequently used deltas for walks are available at `DIRECTIONS`.
  */
  static DIRECTIONS = {
    HORIZONTAL: [[-1, 0], [+1, 0]],
    VERTICAL: [[0, -1], [0, +1]],
    ORTHOGONAL: [[0, -1], [0, +1], [-1, 0], [+1, 0]],
    DIAGONAL: [[-1, -1], [-1, +1], [+1, -1], [+1, +1]],
    EVERY: [[0, -1], [0, +1], [-1, 0], [+1, 0], [-1, -1], [-1, +1], [+1, -1], [+1, +1]],
  };

  // Board management __________________________________________________________

  /** Creates the representation of an empty board.
   *
   * @returns {any}
  */
  emptyBoard() {
    return this._unimplemented('emptyBoard');
  }

  /** Method `square` gets the contents at a given coordinate `coord`. If the
   * coordinate is off the board, an exception is raised.
   *
   * @param {any[]} repr - A list of square values.
   * @param {number[]} coord - Coordinate.
   * @returns {any}
  */
  square(_coord) {
    return this._unimplemented('square');
  }

  /** Sequence of tuples `[value, coord]` for all of the board's square.
   *
   * @yield {[any, number[]]}
  */
  * squares() {
    for (const coord of this.coordinates()) {
      yield [this.square(coord), coord];
    }
  }

  /** A square is assumed to be empty when its value is equal to `emptySquare`.
   *
   * @param {number[]} coord
   * @returns {boolean}
  */
  isEmptySquare(coord) {
    return this.square(coord) === this.emptySquare;
  }

  /** Finds the coordinate of the first square with the given value.
   *
   * @param {any} squareValue
   * @returns {number[]}
  */
  findFirst(squareValue) {
    for (const coord of this.findAll(squareValue)) {
      return coord;
    }
    throw new Error(`Value ${squareValue} was not found in board!`);
  }

  /** Iterates over the coordinates of squares with the given value.
   *
   * @param {any} squareValue
   * @yield {number[]}
  */
  * findAll(squareValue) {
    for (const [value, coord] of this.squares()) {
      if (value === squareValue) {
        yield coord;
      }
    }
  }

  /** Finds the coordinate of the first square with the given value, and checks
   * that no other square has the same value.
   *
   * @param {any} squareValue
   * @returns {number[]}
  */
  findOne(squareValue) {
    let result;
    for (const coord of this.findAll(squareValue)) {
      if (result !== undefined) {
        throw new Error(`There is more than one square with ${squareValue}!`);
      }
      result = coord;
    }
    if (result === undefined) {
      throw new Error(`Value ${squareValue} was not found!`);
    }
    return result;
  }

  /** Returns the list of square values corresponding to a list of board
   * coordinates.
   *
   * @param {number[][]} line - A list of board coordinates.
   * @returns {any[]}
  */
  lineValues(line) {
    return (line.map ? line : [...line]).map((coord) => this.square(coord));
  }

  /** Takes a generator of lines (i.e. coordinate lists) and returns a generator
   * that yield lists of square values.
   *
   * @param {iterable<number[]>} lines - An iterable with coordinates.
   * @yields {any[]} - Lists of square values.
  */
  * linesValues(lines) {
    for (const line of lines) {
      yield this.lineValues(line);
    }
  }

  /** Returns the concatenation of square values corresponding to a list of
   * board coordinates.
   *
   * @param {number[][]} line - A list of board coordinates.
   * @returns {string}
  */
  lineString(line) {
    const squareStrings = (line.map ? line : [...line])
      .map((coord) => `${this.square(coord)}`);
    return ''.concat(...squareStrings);
  }

  /** Takes a generator of lines (i.e. coordinate lists) and returns a generator
   * that yield strings of square values.
   *
   * @param {iterable<number[]>} lines - An iterable with coordinates.
   * @yields {string} - Strings with square values.
  */
  * linesStrings(lines) {
    for (const line of lines) {
      yield this.lineString(line);
    }
  }

  /** The first function to change the board is `place`. It places the value
   * at the given coordinate, replacing whatever was there.
   *
   * @param {number[]} coord
   * @param {any} value
   * @returns {Checkerboard} - This board.
  */
  place(_coord, _value) {
    return this._unimplemented('place');
  }

  /** Another usual operation is `move`. It moves the contents at
   * `coordFrom` to `coordTo`. Whatever is at `coordTo` gets replaced, and
   * `valueLeft` is placed at `coordFrom`. If `valueLeft` is not defined,
   * `emptySquare` is used.
   *
   * @param {number[]} coordFrom
   * @param {number[]} coordTo
   * @param {any} valueLeft
   * @returns {Checkerboard} - This board.
  */
  move(_coordFrom, _coordTo, _valueLeft) {
    return this._unimplemented('move');
  }

  /** The next board operation is `swap`, which moves the contents at
   * `coordFrom` to `coordTo`, and viceversa.
   *
   * @param {number[]} coordFrom
   * @param {number[]} coordTo
   * @returns {Checkerboard} - This board.
  */
  swap(_coordFrom, _coordTo) {
    return this._unimplemented('swap');
  }

  /** The `transform` builds a new board mapping coordinates of this board with
   * the given function.
   *
   * @param {function} coordinateMapping
   * @returns {Checkerboard} - This board.
  */
  transform(_coordinateMapping) {
    return this._unimplemented('transform');
  }

  /** Symmetries transform the whole board at once. The `horizontalSymmetry` of
   * the board flips it with a vertical axis at its center.
   *
   * @returns {Checkerboard} - This board.
  */
  horizontalSymmetry() {
    const { dimensions: [sizeX] } = this;
    return this.transform(([x, y]) => [sizeX - x - 1, y]);
  }

  /** Symmetries transform the whole board at once. The `verticalSymmetry` of
   * the board flips it with an horizontal axis at its center.
   *
   * @returns {Checkerboard} - This board.
  */
  verticalSymmetry() {
    const { dimensions: [, sizeY] } = this;
    return this.transform(([x, y]) => [x, sizeY - y - 1]);
  }

  /** Rotations also transform the whole board at once. The `clockwiseRotation`
   * of the board rotates in the direction that the hands of a clock.
   *
   * @returns {Checkerboard} - This board.
  */
  clockwiseRotation() {
    const { dimensions: [, sizeY] } = this;
    return this.transform(([x, y]) => [sizeY - y - 1, x]);
  }

  /** Rotations also transform the whole board at once. The
   * `counterClockwiseRotation` rotates it in the opposite direction that the
   * hands of a clock.
   *
   * @returns {Checkerboard} - This board.
  */
  counterClockwiseRotation() {
    const { dimensions: [sizeX] } = this;
    return this.transform(([x, y]) => [y, sizeX - x - 1]);
  }

  /** A `weightedSum` is an simple way of defining an heuristic board evaluation
   * function. Every position in the board is assigned a numerical _weight_, and
   * every possible value may be assigned a coefficient (usually player is 1,
   * opponent is -1, else is 0).
   *
   * Weights have to be in the same order that `coordinates()` enumerates the
   * board's positions. This function assumes the weights are normalized and
   * sufficient to cover the whole board.
   *
   * @param {Map<number[], number>} weights
   * @param {function} [coefficient] - All ones, by default.
   * @returns {number}
  */
  weightedSum(weights, coefficient = null) {
    coefficient ||= () => 1;
    let sum = 0;
    for (const [value, coord] of this.squares()) {
      const weight = weights.get(JSON.stringify(coord));
      sum += coefficient(value, weight) * weight || 0;
    }
    return sum;
  }

  /** Renders the checkerboard as text.
   *
   * @param {function} [squareText]
   */
  renderAsText(squareText = null) {
    return [...this.horizontalLines()]
      .map((row) => row.map((coord) => {
        const value = this.square(coord);
        return squareText?.(value) ?? `${value}`;
      }).join(''))
      .join('\n');
  }

  /** Renders the checkerboard as an HTML table using an `html` function for tagged templates
   * compatible [HTM's](https://github.com/developit/htm).
   *
   * @param {function} html
   * @param {object} [options]
  */
  renderAsHTMLTable(html, options = null) {
    // TODO CSS? clicks? on-hovers?
    return html`<table>${
      [...this.horizontals()].map((row) => html`<tr>${
        row.map((coord) => html`<td data-coord=${JSON.stringify(coord)}>${
          this.square(coord)
        }</td>`)
      }</tr>`)
    }</table>`;
  }
} // class Checkerboard

/** Serialization and materialization using Sermat.
*/
Checkerboard.defineSERMAT('dimensions emptySquare');

export default Checkerboard;
