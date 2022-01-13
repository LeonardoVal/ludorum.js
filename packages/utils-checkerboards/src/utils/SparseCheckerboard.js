import Checkerboard from './Checkerboard';

/** Checkerboard implementation represented by a list of pieces with a location
 * in the board.
*/
class SparseCheckerboard extends Checkerboard {
  // Board management __________________________________________________________

  /** Creates the representation of an empty board.
   *
   * @returns {Map}
  */
  emptyBoard() {
    return new Map();
  }

  /** Method `square` gets the contents at a given coordinate `coord`. If the
   * coordinate is off the board, an exception is raised.
   *
   * @param {Map} repr - A list of square values.
   * @param {number[]} coord - Coordinate.
   * @returns {any}
  */
  square(repr, coord) {
    const index = this.coordToIndex(coord);
    return repr.get(index) ?? this.emptySquare;
  }

  /** The first function to change the board is `place`. It places the value
   * at the given coordinate, replacing whatever was there.
   *
   * @param {Map} repr - A list of square values.
   * @param {number[]} coord
   * @param {any} value
   * @returns {Map} - Same as repr, updated.
  */
  place(repr, coord, value) {
    const index = this.coordToIndex(coord);
    repr.set(index, value);
    return repr;
  }

  /** Another usual operation is `move`. It moves the contents at
   * `coordFrom` to `coordTo`. Whatever is at `coordTo` gets replaced, and
   * `valueLeft` is placed at `coordFrom`. If `valueLeft` is not defined,
   * `emptySquare` is used.
   *
   * @param {Map} repr - A list of square values.
   * @param {number[]} coordFrom
   * @param {number[]} coordTo
   * @param {any} valueLeft
   * @returns {Map} - Same as repr, updated.
  */
  move(repr, coordFrom, coordTo, valueLeft) {
    const indexFrom = this.coordToIndex(coordFrom);
    const indexTo = this.coordToIndex(coordTo);
    repr.set(indexTo, repr.get(indexFrom));
    repr.set(indexFrom, valueLeft ?? this.emptySquare);
    return repr;
  }

  /** The next board operation is `swap`, which moves the contents at
   * `coordFrom` to `coordTo`, and viceversa.
   *
   * @param {Map} repr - A list of square values.
   * @param {number[]} coordFrom
   * @param {number[]} coordTo
   * @returns {Map} - Same as repr, updated.
  */
  swap(repr, coordFrom, coordTo) {
    const indexFrom = this.coordToIndex(coordFrom);
    const indexTo = this.coordToIndex(coordTo);
    const valueTo = repr.get(indexTo);
    repr.set(indexTo, repr.get(indexFrom));
    repr.set(indexFrom, valueTo);
    return repr;
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
   * @param {Map} repr - A list of square values.
   * @param {number[]} weights
   * @param {function} [coefficient] - All ones, by default.
   * @returns {number}
  */
  weightedSum(repr, weights, coefficient = null) {
    const { emptySquare, size } = this;
    coefficient ||= () => 1;
    let sum = 0;
    for (let i = 0; i < size; i += 1) {
      const value = repr.get(i) ?? emptySquare;
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
    const { dimensions: [sizeX], emptySquare, size } = this;
    squareText ||= (value) => `${value}`;
    let text = '';
    for (let i = 0; i < size; i += 1) {
      text += squareText(repr.get(i) ?? emptySquare);
      if (i > 0 && i % sizeX === 0) {
        text += '\n';
      }
    }
    return text;
  }
} // class SparseCheckerboard

export default SparseCheckerboard;
