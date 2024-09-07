import { BaseClass } from '@ludorum/core';

/** */
export class CheckerBoard extends BaseClass {

  /** */
  constructor(args) {
    super();
    this.__props({
      coordArrayType: args.coordArrayType ?? Int16Array,
      emptySquare: args.emptySquare ?? null,
      height: args.height,
      width: args.width,
    });
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
   * @yield {[any, number[]]}
  */
  * squares(_board) {
    this.__undefined(`${this.constructor.name}.squares`)
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

} // class CheckerBoard
