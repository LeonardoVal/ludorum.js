import { CheckerBoard } from "./Checkerboard";

export class CheckerboardFromSquareList extends CheckerBoard {

  /** @inheritdoc */
  squares(board, [x, y]) {
    return board[x + y * this.width];
  }

  /** @inheritdoc */
  * squares(board) {
    const { width } = this;
    for (const coord of this.coordinates()) {
      const [x, y] = coord;
      yield [board[x + y * width], coord];
    }
  }

  /** @inheritdoc */
  place(board, [x, y], value) {
    const newBoard = [...board];
    newBoard[x + y * this.width] = value;
    return newBoard;
  }

  /** @inheritdoc */
  move(board, [x1, y1], [x2, y2], valueLeft) {
    const { emptySquare, width } = this;
    const newBoard = [...board];
    newBoard[x2 + y2 * width] = newBoard[x1 + y1 * width];
    newBoard[x1 + y1 * width] = valueLeft ?? emptySquare;
    return newBoard;
  }

  /** @inheritdoc */
  swap(board, coordFrom, coordTo) {
    const [x2, y2] = coordTo;
    return this.move(board, coordFrom, board[x2 + y2 * this.width]);
  }

} // class CheckerBoardFromList
