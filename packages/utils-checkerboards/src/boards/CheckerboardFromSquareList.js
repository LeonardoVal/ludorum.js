import { CheckerBoard } from "./Checkerboard";

export class CheckerboardFromSquareList extends CheckerBoard {

  /** @inheritdoc */
  square(board, coord) {
    const [x, y] = this.mustBeInside(coord);
    return board[x + y * this.width];
  }

  /** @inheritdoc */
  * squares(board, callback = null) {
    const { width } = this;
    for (const coord of this.coordinates()) {
      const [x, y] = coord;
      const square = board[x + y * width];
      const value = callback ? callback(square, coord) : [square, coord];
      if (value !== undefined) {
        yield value;
      }
    }
  }

  /** @inheritdoc */
  place(board, coord, value) {
    const [x, y] = this.mustBeInside(coord);
    const newBoard = [...board];
    newBoard[x + y * this.width] = value;
    return newBoard;
  }

  /** @inheritdoc */
  move(board, coord1, coord2, valueLeft) {
    const [x1, y1] = this.mustBeInside(coord1);
    const [x2, y2] = this.mustBeInside(coord2);
    const { emptySquare, width } = this;
    const newBoard = [...board];
    const valueMoved = newBoard[x1 + y1 * width];
    newBoard[x1 + y1 * width] = valueLeft ?? emptySquare;
    newBoard[x2 + y2 * width] = valueMoved;
    return newBoard;
  }

  /** @inheritdoc */
  swap(board, coordFrom, coordTo) {
    const [x2, y2] = this.mustBeInside(coordTo);
    return this.move(board, coordFrom, coordTo, board[x2 + y2 * this.width]);
  }

} // class CheckerBoardFromList
