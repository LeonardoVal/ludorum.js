import { BaseClass } from '@ludorum/core';

const DEFAULT_COORD_ARRAY_TYPE = Int16Array;

/** */
export class CheckerBoard extends BaseClass {

  /** */
  constructor(args) {
    super();
    this.__props({
      coordArrayType: args.coordArrayType ?? DEFAULT_COORD_ARRAY_TYPE,
      emptySquare: args.emptySquare ?? null,
      height: args.height,
      width: args.width,
    });
  }

// Coordinates _________________________________________________________________

  /** TODO */
  static fromAN(coordString, coordArrayType = DEFAULT_COORD_ARRAY_TYPE) {
    let match = /^([a-z])(\d+)$/i.exec(coordString);
    if (match) {
      return coordArrayType.of(match[1].charCodeAt(0) - 97, match[2] - 1);
    }
    throw new Error(`Unrecognized coordinate ${JSON.stringify(coordString)}!`);
  }

  /** TODO */
  fromAN(coordString) {
    return this.constructor.fromAN(coordString, this.coordArrayType);
  }

  /** Returns a string for a given coordinate in chess' Algebraic Notation.
   *
   * @param {[number, number]} coord
   * @returns {string}
  */
  static toAN([x, y]) {
    if (x < 0 || y < 0 || y >= 26) {
      throw new Error(`Cannot stringify coordinate [${x}, ${y}]!`);
    }
    return `${String.fromCharCode(x + 97)}${y + 1}`;
  }

  /** TODO */
  toAN(coord) {
    return this.constructor.toAN(coord);
  }

// Board information ___________________________________________________________

  /** The `size` is the amount of squares in the checkerboard.
   *
   * @property {number}
  */
  get size() {
    return this.height * this.width;
  }

  /** Method `coordinates` returns the sequence of the board's valid positions.
   *
   * @yields {number[]}
  */
  * coordinates() {
    const { coordArrayType, height, width } = this;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        yield coordArrayType.of(x, y);
      }
    }
  }

  /** TODO */
  isInside([x, y]) {
    const { height, width } = this;
    return 0 <= x && x < width && 0 <= y && y < height;
  }

  /** TODO */
  mustBeInside(coord) {
    if (!this.isInside(coord)) {
      throw new Error(`${coord} is not inside the board!`);
    }
    return coord;
  }

  /** Square value for the given board at the given coordinate.
   *
   * @param {any} board
   * @param {[number, number]}
   * @returns {any}
  */
  square(_board, _coord) {
    this.__undefined(`${this.constructor.name}.square`)
  }

  /** Sequence of tuples `[value, coord]` for all of the board's square.
   *
   * @param {any} board
   * @param {function} [callback=null]
   * @yield {any}
  */
  * squares(board, callback = null) {
    for (const coord of this.coordinates()) {
      const square = this.square(board, coord);
      const value = callback ? callback(square, coord) : [square, coord];
      if (value !== undefined) {
        yield value;
      }
    }
  }

  /** TODO */
  delta([x, y], [dx, dy], checkFn = null) {
    const { coordArrayType } = this;
    const newCoord = coordArrayType.of(x + dx, y + dy);
    if (this.isInside(newCoord) && (!checkFn || checkFn(newCoord))) {
      return newCoord;
    }
    return null;
  }

  /** TODO 
   * 
   * @param {[number, number]} coord
   * @param {[number, number][]} offsets
   * @param {function} [checkFn=null]
   * @yields {[number, number]}
  */
  * deltas([x, y], offsets, checkFn = null) {
    const { coordArrayType } = this;
    for (const [dx, dy] of offsets) {
      const newCoord = coordArrayType.of(x + dx, y + dy);
      if (this.isInside(newCoord) && (!checkFn || checkFn(newCoord))) {
        yield newCoord;
      }
    }
  }

  /** TODO 
   * 
   * @param {[number, number]} coord
   * @param {[number, number]} offset
   * @param {function} [checkFn=null]
   * @yields {[number, number]}
  */
  * slide([x, y], [dx, dy], checkFn = null) {
    const { coordArrayType } = this;
    let newCoord = coordArrayType.of(x + dx, y + dy);
    while (this.isInside(newCoord) && (!checkFn || checkFn(newCoord))) {
      yield newCoord;
      newCoord = coordArrayType.of(newCoord[0] + dx, newCoord[1] + dy);
    }
  }

// Board transformation ________________________________________________________

  /** Places the value at the given coordinate, replacing whatever was there.
   *
   * @param {T} board
   * @param {number[]} coord
   * @param {any} value
   * @returns {T} - New board.
  */
  place(_board, _coord, _value) {
    return this.__undefined(`${this.constructor.name}.place`);
  }

  /** Moves the contents at `coordFrom` to `coordTo`. Whatever is at `coordTo`
   * gets replaced, and `valueLeft` is placed at `coordFrom`. If `valueLeft` is
   * not defined, `emptySquare` is used.
   *
   * @param {T} board
   * @param {number[]} coordFrom
   * @param {number[]} coordTo
   * @param {any} [valueLeft=emptySquare]
   * @returns {T} - New board.
  */
  move(_board, _coordFrom, _coordTo, _valueLeft) {
    return this.__undefined(`${this.constructor.name}.move`);
  }

  /** Moves the contents at `coordFrom` to `coordTo`, and viceversa.
   *
   * @param {T} board
   * @param {number[]} coordFrom
   * @param {number[]} coordTo
   * @returns {T} - New board.
  */
  swap(_board, _coordFrom, _coordTo) {
    return this.__undefined(`${this.constructor.name}.swap`);
  }

// Actions generation __________________________________________________________

  /** TODO */
  * moveActions(board, generator) {
    const fn = typeof generator === 'function' ? generator
      : generator instanceof Map ? (v) => generator.get(v)
      : typeof generator === 'object' ? (v) => generator[v]
      : null;
    for (const [value, coordFrom] of this.squares(board)) {
      const coordsTo = fn?.(value)?.(coordFrom, value);
      if (coordsTo) {
        for (const coordTo of coordsTo) {
          yield [coordFrom, coordTo, value];
        }
      }
    }
  }

} // class CheckerBoard
