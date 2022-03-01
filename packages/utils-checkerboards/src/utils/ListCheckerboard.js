/* eslint-disable max-classes-per-file */
import Checkerboard from './Checkerboard';

/** Base class for checkerboards representations based on several different data
 * structures.
*/
class ListCheckerboard extends Checkerboard {
  /** Constructor for checkerboards based on a list for square values.
   *
   * @param {object} [args]
   * @param {Iterable<any>} [args.squareValues] - A list of square values.
  */
  constructor(args) {
    const { squareValues } = args || {};
    super(args);
    const validSquareValues = squareValues === undefined
      || typeof squareValues[Symbol.iterator] === 'function';
    this._prop('squareValues', squareValues, validSquareValues);
  }

  get squareValues() {
    return this._unimplemented('squareValues');
  }

  /** Returns an object with the same interface, but with a new `squareValues`.
   *
   * @param {Iterable<any>} squareValues
   * @returns {ListCheckerboard}
  */
  with(squareValues) {
    const result = Object.create(this);
    const validSquareValues = typeof squareValues[Symbol.iterator] === 'function';
    result._prop('squareValues', squareValues, validSquareValues);
    return result;
  }

  /** Returns an object with the same interface, but with `squareValues` set to
   * the empty board.
   *
   * @returns {ListCheckerboard}
  */
  withEmptyBoard() {
    return this.with(this.emptyBoard());
  }

  // Board management __________________________________________________________

  /** @inheritdoc */
  emptyBoard() {
    return Array(this.size).fill(this.emptySquare);
  }

  /** @inheritdoc */
  square(coord) {
    const { squareValues } = this;
    const index = this.coord(coord, 'int');
    return squareValues[index];
  }

  /** @inheritdoc */
  * squares() {
    const { squareValues } = this;
    let i = 0;
    for (const value of squareValues) {
      yield [value, this.coord(i, 'array')];
      i += 1;
    }
  }

  /** @inheritdoc */
  place(coord, value) {
    const { squareValues } = this;
    const index = this.coord(coord, 'int');
    squareValues[index] = value;
    return this;
  }

  /** @inheritdoc */
  move(coordFrom, coordTo, valueLeft) {
    const { squareValues } = this;
    const indexFrom = this.coord(coordFrom, 'int');
    const indexTo = this.coord(coordTo, 'int');
    squareValues[indexTo] = squareValues[indexFrom];
    squareValues[indexFrom] = valueLeft ?? this.emptySquare;
    return this;
  }

  /** @inheritdoc */
  swap(coordFrom, coordTo) {
    const { squareValues } = this;
    const indexFrom = this.coord(coordFrom, 'int');
    const indexTo = this.coord(coordTo, 'int');
    const valueTo = squareValues[indexTo];
    squareValues[indexTo] = squareValues[indexFrom];
    squareValues[indexFrom] = valueTo;
    return this;
  }

  /** @inheritdoc */
  transform(coordinateMapping) {
    const { squareValues } = this;
    [...squareValues].forEach((squareValue, i) => {
      const newPosition = coordinateMapping(this.coord(i));
      this.place(newPosition, squareValue);
    });
    return this;
  }

  /** @inheritdoc */
  weightedSum(weights, coefficient = null) {
    const { size, squareValues } = this;
    coefficient ||= () => 1;
    let sum = 0;
    for (let i = 0; i < size; i += 1) {
      const value = squareValues[i];
      const weight = weights[i];
      sum += coefficient(value, weight) * weight || 0;
    }
    return sum;
  }

  /** @inheritdoc */
  renderAsText(squareText = null) {
    const { dimensions: [sizeX], size, squareValues } = this;
    let text = '';
    for (let i = 0; i < size; i += 1) {
      if (i > 0 && i % sizeX === 0) {
        text += '\n';
      }
      text += squareText?.(squareValues[i]) ?? `${squareValues[i]}`;
    }
    return text;
  }

  /** @inheritdoc */
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
} // class ListCheckerboard

/** Serialization and materialization using Sermat.
*/
ListCheckerboard.defineSERMAT('dimensions emptySquare');

export default ListCheckerboard;
