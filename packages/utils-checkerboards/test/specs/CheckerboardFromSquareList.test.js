import { describe, expect, test } from 'vitest';
import { CheckerboardFromSquareList } from '../../src/index';

describe('CheckerboardFromSquareList', () => {
  test('is defined', () => {
    expect(CheckerboardFromSquareList).toBeTypeOf('function');
  });

  test('square() & squares() work as expected', () => {
    const board3x3 = new CheckerboardFromSquareList({
      emptySquare: ' ', height: 3, width: 3,
    });
    const testBoard = [...'012345678'];
    expect(board3x3.square(testBoard, [1, 1])).toEqual('4');
    expect(board3x3.square(testBoard, [0, 0])).toEqual('0');
    expect(board3x3.square(testBoard, [1, 2])).toEqual('7');
    expect(() => board3x3.square(testBoard, [3, 1])).toThrow();

    const squares = [...board3x3.squares(testBoard)];
    expect(squares.map(([v]) => v)).toEqual([...testBoard]);
    expect(squares.map(([,c]) => c)).toEqual([...board3x3.coordinates()]);
  });

  test('place() works as expected', () => {
    const board3x3 = new CheckerboardFromSquareList({
      emptySquare: ' ', height: 3, width: 3,
    });
    const testBoard = [...'012345678'];
    expect(board3x3.place(testBoard, [1, 1], 'X')).toEqual([...'0123X5678']);
    expect(board3x3.place(testBoard, [0, 0], 'X')).toEqual([...'X12345678']);
    expect(board3x3.place(testBoard, [1, 2], 'X')).toEqual([...'0123456X8']);
    expect(() => board3x3.place(testBoard, [3, 1], 'X')).toThrow();
  });

  test('move() works as expected', () => {
    const board3x3 = new CheckerboardFromSquareList({
      emptySquare: ' ', height: 3, width: 3,
    });
    const testBoard = [...'012345678'];
    expect(board3x3.move(testBoard, [1, 1], [2, 2])).toEqual([...'0123 5674']);
    expect(board3x3.move(testBoard, [0, 0], [2, 2], '!')).toEqual([...'!12345670']);
    expect(board3x3.move(testBoard, [0, 0], [0, 0])).toEqual([...'012345678']);
    expect(() => board3x3.move(testBoard, [3, 1], [1, 1])).toThrow();
    expect(() => board3x3.move(testBoard, [1, 1], [1, 3])).toThrow();
  });

  test('swap() works as expected', () => {
    const board3x3 = new CheckerboardFromSquareList({
      emptySquare: ' ', height: 3, width: 3,
    });
    const testBoard = [...'012345678'];
    expect(board3x3.swap(testBoard, [1, 1], [2, 2])).toEqual([...'012385674']);
    expect(board3x3.swap(testBoard, [0, 0], [2, 2])).toEqual([...'812345670']);
    expect(board3x3.swap(testBoard, [0, 0], [0, 0])).toEqual([...'012345678']);
    expect(() => board3x3.swap(testBoard, [3, 1], [1, 1])).toThrow();
    expect(() => board3x3.swap(testBoard, [1, 1], [1, 3])).toThrow();
  });

}); // describe 'CheckerboardFromSquareList'
