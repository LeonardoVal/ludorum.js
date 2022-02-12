/* eslint-disable max-classes-per-file */
import { BaseClass } from '@ludorum/core';

const makeCoord = (x, y) => Uint16Array.of(x, y);

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
    const {
      dimensions: [sizeX, sizeY],
      emptySquare,
    } = args || {};
    super();
    this
      ._prop('dimensions', makeCoord(sizeX, sizeY))
      ._prop('emptySquare', emptySquare, null);
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
        yield makeCoord(x, y);
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
   * @returns {any[]}
  */
  emptyBoard() {
    return Array(this.size).fill(this.emptySquare);
  }

  /** Method `square` gets the contents at a given coordinate `coord`. If the
   * coordinate is off the board, an exception is raised.
   *
   * @param {any[]} repr - A list of square values.
   * @param {number[]} coord - Coordinate.
   * @returns {any}
  */
  square(repr, coord) {
    const index = this.coordToIndex(coord);
    return repr[index];
  }

  /** A square is assumed to be empty when its value is equal to `emptySquare`.
   *
   * @param {any[]} repr - A list of square values.
   * @param {number[]} coord
   * @returns {boolean}
  */
  isEmptySquare(repr, coord) {
    return this.square(repr, coord) === this.emptySquare;
  }

  /** */
  findFirst(repr, squareValue) {
    for (const coord of this.findAll(repr, squareValue)) {
      return coord;
    }
    throw new Error(`Value ${squareValue} was not found in board ${repr}!`);
  }

  /** */
  * findAll(repr, squareValue) {
    for (let i = 0; i < repr.length; i += 1) {
      const v = repr[i];
      if (v === squareValue) {
        yield this.coordFromIndex(i);
      }
    }
  }

  /** */
  findOne(repr, squareValue) {
    let result;
    for (const coord of this.findAll(repr, squareValue)) {
      if (result === undefined) {
        result = coord;
      } else {
        throw new Error(`There is more than one square with ${squareValue} in board ${repr}!`);
      }
    }
    if (result === undefined) {
      throw new Error(`Value ${squareValue} was not found in board ${repr}!`);
    }
    return result;
  }

  /** Returns the list of square values corresponding to a list of board
   * coordinates.
   *
   * @param {any[]} repr - A list of square values.
   * @param {number[][]} line - A list of board coordinates.
   * @returns {any[]}
  */
  lineValues(repr, line) {
    return (line.map ? line : [...line]).map((coord) => this.square(repr, coord));
  }

  /** Takes a generator of lines (i.e. coordinate lists) and returns a generator
   * that yield lists of square values.
   *
   * @param {any[]} repr - A list of square values.
   * @param {iterable<number[]>} lines - An iterable with coordinates.
   * @yields {any[]} - Lists of square values.
  */
  * linesValues(repr, lines) {
    for (const line of lines) {
      yield this.lineValues(repr, line);
    }
  }

  /** Returns the concatenation of square values corresponding to a list of
   * board coordinates.
   *
   * @param {any[]} repr - A list of square values.
   * @param {number[][]} line - A list of board coordinates.
   * @returns {string}
  */
  lineString(repr, line) {
    const squareStrings = (line.map ? line : [...line])
      .map((coord) => `${this.square(repr, coord)}`);
    return ''.concat(...squareStrings);
  }

  /** Takes a generator of lines (i.e. coordinate lists) and returns a generator
   * that yield strings of square values.
   *
   * @param {any[]} repr - A list of square values.
   * @param {iterable<number[]>} lines - An iterable with coordinates.
   * @yields {string} - Strings with square values.
  */
  * linesStrings(repr, lines) {
    for (const line of lines) {
      yield this.lineString(repr, line);
    }
  }

  /** The first function to change the board is `place`. It places the value
   * at the given coordinate, replacing whatever was there.
   *
   * @param {any[]} repr - A list of square values.
   * @param {number[]} coord
   * @param {any} value
   * @returns {any[]} - Same as repr, updated.
  */
  place(repr, coord, value) {
    const index = this.coordToIndex(coord);
    repr[index] = value;
    return repr;
  }

  /** Another usual operation is `move`. It moves the contents at
   * `coordFrom` to `coordTo`. Whatever is at `coordTo` gets replaced, and
   * `valueLeft` is placed at `coordFrom`. If `valueLeft` is not defined,
   * `emptySquare` is used.
   *
   * @param {any[]} repr - A list of square values.
   * @param {number[]} coordFrom
   * @param {number[]} coordTo
   * @param {any} valueLeft
   * @returns {any[]} - Same as repr, updated.
  */
  move(repr, coordFrom, coordTo, valueLeft) {
    const indexFrom = this.coordToIndex(coordFrom);
    const indexTo = this.coordToIndex(coordTo);
    repr[indexTo] = repr[indexFrom];
    repr[indexFrom] = valueLeft ?? this.emptySquare;
    return repr;
  }

  /** The next board operation is `swap`, which moves the contents at
   * `coordFrom` to `coordTo`, and viceversa.
   *
   * @param {any[]} repr - A list of square values.
   * @param {number[]} coordFrom
   * @param {number[]} coordTo
   * @returns {any[]} - Same as repr, updated.
  */
  swap(repr, coordFrom, coordTo) {
    const indexFrom = this.coordToIndex(coordFrom);
    const indexTo = this.coordToIndex(coordTo);
    const valueTo = repr[indexTo];
    repr[indexTo] = repr[indexFrom];
    repr[indexFrom] = valueTo;
    return repr;
  }

  /** The `transform` builds a new board mapping coordinates of this board with
   * the given function.
   *
   * @param {any[]} repr - A list of square values.
   * @param {function} coordinateMapping
   * @returns {any[]} - Same as repr, updated.
  */
  transform(repr, coordinateMapping) {
    const oldRepr = [...repr];
    for (const position of this.coordinates()) {
      const newPosition = coordinateMapping([...position]);
      this.place(repr, newPosition, this.square(oldRepr, position));
    }
    return repr;
  }

  /** Symmetries transform the whole board at once. The `horizontalSymmetry` of
   * the board flips it with a vertical axis at its center.
   *
   * @param {any[]} repr - A list of square values.
   * @returns {any[]} - Same as repr, updated.
  */
  horizontalSymmetry(repr) {
    const { dimensions: [sizeX] } = this;
    return this.transform(repr, ([x, y]) => [sizeX - x - 1, y]);
  }

  /** Symmetries transform the whole board at once. The `verticalSymmetry` of
   * the board flips it with an horizontal axis at its center.
   *
   * @param {any[]} repr - A list of square values.
   * @returns {any[]} - Same as repr, updated.
  */
  verticalSymmetry(repr) {
    const { dimensions: [, sizeY] } = this;
    return this.transform(repr, ([x, y]) => [x, sizeY - y - 1]);
  }

  /** Rotations also transform the whole board at once. The `clockwiseRotation`
   * of the board rotates in the direction that the hands of a clock.
   *
   * @param {any[]} repr - A list of square values.
   * @returns {any[]} - Same as repr, updated.
  */
  clockwiseRotation(repr) {
    const { dimensions: [, sizeY] } = this;
    return this.transform(repr, ([x, y]) => [sizeY - y - 1, x]);
  }

  /** Rotations also transform the whole board at once. The
   * `counterClockwiseRotation` rotates it in the opposite direction that the
   * hands of a clock.
   *
   * @param {any[]} repr - A list of square values.
   * @returns {any[]} - Same as repr, updated.
  */
  counterClockwiseRotation(repr) {
    const { dimensions: [sizeX] } = this;
    return this.transform(repr, ([x, y]) => [y, sizeX - x - 1]);
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
   * @param {any[]} repr - A list of square values.
   * @param {number[]} weights
   * @param {function} [coefficient] - All ones, by default.
   * @returns {number}
  */
  weightedSum(repr, weights, coefficient = null) {
    const { size } = this;
    coefficient ||= () => 1;
    let sum = 0;
    for (let i = 0; i < size; i += 1) {
      const value = repr[i];
      const weight = weights[i];
      sum += coefficient(value, weight) * weight || 0;
    }
    return sum;
  }

  /** Renders the checkerboard as text.
   *
   * @param {any[]} repr
   * @param {function} [squareText]
   */
  renderAsText(repr, squareText = null) {
    const { dimensions: [sizeX], size } = this;
    squareText ||= (value) => `${value}`;
    let text = '';
    for (let i = 0; i < size; i += 1) {
      text += squareText(repr[i]);
      if (i > 0 && i % sizeX === 0) {
        text += '\n';
      }
    }
    return text;
  }

  /** Board games' user interfaces may be implemented using HTML & CSS. This is
   * the case of Ludorum's playtesters.
  * /
  renderAsHTMLTable(document, container, callback) {
    var board = this, // for closures.
      table = document.createElement('table');
    container.appendChild(table);
    board.horizontals().reverse().forEach(function (line) {
      var tr = document.createElement('tr');
      table.appendChild(tr);
      line.forEach(function (coord) {
        var square = board.square(coord),
          td = document.createElement('td'),
          data = {
            id: "ludorum-square-"+ coord.join('-'),
            className: "ludorum-square",
            square: square,
            coord: coord,
            innerHTML: base.Text.escapeXML(square)
          };
        if (callback) {
          data = callback(data) || data;
        }
        td['ludorum-data'] = data;
        td.id = data.id;
        td.className = data.className;
        td.innerHTML = data.innerHTML;
        if (data.onclick) {
          td.onclick = data.onclick;
        }
        tr.appendChild(td);
      });
    });
    return table;
  } /* */

  /** Returns an object with a similar interface, except that the methods that
   * have a `repr` arguments, use the given value. This is meant to simplify
   * chains of modifications, e.g.:
   *
   * ```(new Checkerboard({ dimensions: [3, 3], emptySquare: '.' }))
   * .with('X....XO..').place([2,2], 'O').repr.join('')
   * ```
   *
   * @param {any[]} repr - Board representation. Warning! It may get updated.
   * @returns {object}
   */
  with(repr) {
    const result = Object.create(this);
    result.repr = repr;
    Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach((n) => {
      const { withMethod } = this[n];
      if (withMethod) {
        Object.defineProperty(result, n, { value: withMethod });
      }
    });
    return result;
  }

  /** Shortcut for calling `with` with an empty board.
   *
   * @returns {object}
  */
  withEmptyBoard() {
    return this.with(this.emptyBoard());
  }
} // class Checkerboard

/** Serialization and materialization using Sermat.
*/
Checkerboard.defineSERMAT('dimensions emptySquare');

[ // Modification methods.
  'clockwiseRotation',
  'counterClockwiseRotation',
  'horizontalSymmetry',
  'move',
  'place',
  'swap',
  'transform',
  'verticalSymmetry',
].forEach((methodName) => {
  Checkerboard.prototype[methodName].withMethod = {
    [methodName](...args) {
      this.repr = Object.getPrototypeOf(this)[methodName](this.repr, ...args);
      return this;
    },
  }[methodName];
});

[ // Information methods.
  'findFirst',
  'findOne',
  'isEmptySquare',
  'lineString',
  'lineValues',
  'renderAsText',
  'square',
  'weightedSum',
].forEach((methodName) => {
  Checkerboard.prototype[methodName].withMethod = {
    [methodName](...args) {
      return Object.getPrototypeOf(this)[methodName](this.repr, ...args);
    },
  }[methodName];
});

[ // Generator methods.
  'findAll',
  'linesStrings',
  'linesValues',
].forEach((methodName) => {
  Checkerboard.prototype[methodName].withMethod = {
    * [methodName](...args) {
      yield* Object.getPrototypeOf(this)[methodName](this.repr, ...args);
    },
  }[methodName];
});

export default Checkerboard;
