import { describe, expect, test } from 'vitest';
import { CheckerBoard } from '../../src/index';

describe('CheckerBoard', () => {
  test('is defined', () => {
    expect(CheckerBoard).toBeTypeOf('function');
  });

  test('constructor works as expected', () => {
    const board3x3 = new CheckerBoard({ height: 3, width: 3 });
    expect(board3x3.height).toBe(3);
    expect(board3x3.width).toBe(3);
    expect(board3x3.emptySquare).toBeNull();
    expect(board3x3.coordArrayType).toBe(Int16Array);
    expect(board3x3.size).toBe(9);
  });

  test('abstract methods fail when called', () => {
    const board3x3 = new CheckerBoard({ height: 3, width: 3 });
    const testBoard = '123456789';
    const testCoord1 = [1, 1];
    const testCoord2 = [2, 2];
    const testValue = 'X';

    expect(() => board3x3.square(testBoard, testCoord1)).toThrow();
    expect(() => [...board3x3.squares(testBoard)]).toThrow();
    expect(() => board3x3.place(testBoard, testCoord1, testValue)).toThrow();
    expect(() => board3x3.move(testBoard, testCoord1, testCoord2)).toThrow();
    expect(() => board3x3.swap(testBoard, testCoord1, testCoord2)).toThrow();
  });

  test('coordinates works as expected', () => {
    const board3x3 = new CheckerBoard({ height: 3, width: 3 });
    const coordsArray = [...board3x3.coordinates()];
    expect(coordsArray.length).toBe(board3x3.size);
    coordsArray.forEach((c) => {
      expect(c).toBeInstanceOf(board3x3.coordArrayType);
      expect(board3x3.isInside(c)).toBe(true);
    });
    const coordsSet = new Set(coordsArray.map((c) => c.join(',')));
    expect(coordsSet.size).toBe(board3x3.size);
  });

  test('coordinates outside of the board are marked as such', () => {
    const board3x3 = new CheckerBoard({ height: 3, width: 3 });
    [
      [-1, 1], [1, -1], [-1, -1],
      [3, 1], [1, 3], [3, 3],
    ].forEach((c) => expect(board3x3.isInside(c)).toBe(false));
  });

  test('deltas coordinates are properly calculated', () => {
    const board3x3 = new CheckerBoard({ height: 3, width: 3 });
    const orthoOffsets = [[-1, 0], [+1, 0], [0, -1], [0, +1]];
    expect([...board3x3.deltas([1, 1], orthoOffsets)]).toEqual([
      [0, 1], [2, 1], [1, 0], [1, 2],
    ].map(([x, y]) => board3x3.coordArrayType.of(x, y)));
    expect([...board3x3.deltas([0, 0], orthoOffsets)]).toEqual([
      [1, 0], [0, 1],
    ].map(([x, y]) => board3x3.coordArrayType.of(x, y)));
    expect([...board3x3.deltas([2, 2], orthoOffsets)]).toEqual([
      [1, 2], [2, 1],
    ].map(([x, y]) => board3x3.coordArrayType.of(x, y)));
    expect([...board3x3.deltas([0, 2], orthoOffsets)]).toEqual([
      [1, 2], [0, 1],
    ].map(([x, y]) => board3x3.coordArrayType.of(x, y)));
    expect([...board3x3.deltas([2, 0], orthoOffsets)]).toEqual([
      [1, 0], [2, 1],
    ].map(([x, y]) => board3x3.coordArrayType.of(x, y)));
    expect([...board3x3.deltas([1, 2], orthoOffsets)]).toEqual([
      [0, 2], [2, 2], [1, 1],
    ].map(([x, y]) => board3x3.coordArrayType.of(x, y)));
    expect([...board3x3.deltas([2, 1], orthoOffsets)]).toEqual([
      [1, 1], [2, 0], [2, 2],
    ].map(([x, y]) => board3x3.coordArrayType.of(x, y)));
    expect([...board3x3.deltas([3, 3], orthoOffsets)]).toEqual([]);
    expect([...board3x3.deltas([1, 1], orthoOffsets, () => false)]).toEqual([]);
  });

}); // describe 'CheckerBoard'
