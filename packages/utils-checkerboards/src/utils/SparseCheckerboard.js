import Checkerboard from './Checkerboard';

/** Checkerboard implementation represented by a list of pieces with a location
 * in the board.
*/
class SparseCheckerboard extends Checkerboard {
  /** Constructor for checkerboards based on a list for square values.
   *
   * @param {object} [args]
   * @param {any} [args.map] - A Map of coordinates to square values.
  */
  constructor(args) {
    const { squareValues } = args || {};
    super(args);
    this
      ._prop('squareValues', squareValues, Map);
  }

  // Board management __________________________________________________________

  /** @inheritdoc */
  emptyBoard() {
    return new Map();
  }

  /** @inheritdoc */
  square(coord) {
    const { squareValues } = this;
    const index = this.coord(coord, 'int');
    return squareValues.get(index) ?? this.emptySquare;
  }

  /** @inheritdoc */
  place(coord, value) {
    const { squareValues } = this;
    const index = this.coord(coord, 'int');
    squareValues.set(index, value);
    return this;
  }

  /** @inheritdoc */
  move(coordFrom, coordTo, valueLeft) {
    const { squareValues } = this;
    const indexFrom = this.coord(coordFrom, 'int');
    const indexTo = this.coord(coordTo, 'int');
    squareValues.set(indexTo, squareValues.get(indexFrom));
    squareValues.set(indexFrom, valueLeft ?? this.emptySquare);
    return this;
  }

  /** @inheritdoc */
  swap(coordFrom, coordTo) {
    const { squareValues } = this;
    const indexFrom = this.coord(coordFrom, 'int');
    const indexTo = this.coord(coordTo, 'int');
    const valueTo = squareValues.get(indexTo);
    squareValues.set(indexTo, squareValues.get(indexFrom));
    squareValues.set(indexFrom, valueTo);
    return this;
  }

  /** @inheritdoc */
  weightedSum(weights, coefficient = null) {
    const { emptySquare, size, squareValues } = this;
    coefficient ||= () => 1;
    let sum = 0;
    for (let i = 0; i < size; i += 1) {
      const value = squareValues.get(i) ?? emptySquare;
      const weight = weights[i];
      sum += coefficient(value, weight) * weight || 0;
    }
    return sum;
  }

  /** @inheritdoc */
  renderAsText(squareText = null) {
    const {
      dimensions: [sizeX], emptySquare, size, squareValues,
    } = this;
    squareText ||= (value) => `${value}`;
    let text = '';
    for (let i = 0; i < size; i += 1) {
      text += squareText(squareValues.get(i) ?? emptySquare);
      if (i > 0 && i % sizeX === 0) {
        text += '\n';
      }
    }
    return text;
  }
} // class SparseCheckerboard

export default SparseCheckerboard;
