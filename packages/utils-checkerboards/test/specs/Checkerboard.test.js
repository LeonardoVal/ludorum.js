import { describe, expect, test } from 'vitest';
import { CheckerBoard } from '../../src/index';

const coordsCheck = (board) => (received, expected) => {
  const { coordArrayType } = board;
  const expectedArray = Array.isArray(expected) ? expected
    : /^((\d+,\d+\s*)+)$/.exec(expected)?.[1]?.split(/\s+/)
      ?.map((s) => s.split(',').map(Number)) ?? [];
  const expectedTypedArrays = expectedArray
    .map((c) => coordArrayType.of(...c));
  expect([...received]).toEqual(expectedTypedArrays);
};

describe('CheckerBoard', () => {
  test('is defined', () => {
    expect(CheckerBoard).toBeTypeOf('function');
  });

  test('coordinates can be parsed and unparsed', () => {
    Object.entries({
      a1: [0,0], b1: [1,0], a2: [0,1],
      c1: [2,0], c2: [2,1], c3: [2,2],
      z22: [25, 21],
    }).forEach(([k, v]) => {
      expect(CheckerBoard.toAN(v)).toBe(k);
      expect([...CheckerBoard.fromAN(k)]).toEqual(v);
    });

    ['', '  ', '1z', 'a1 ', ' b2'].forEach(
      (c) => expect(() => CheckerBoard.fromAN(c)).toThrow()
    );
    [[-1,0], [0,-1], [7,26]].forEach(
      (c) => expect(() => CheckerBoard.toAN(c)).toThrow()
    );
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

  test('delta is properly calculated', () => {
    const board3x3 = new CheckerBoard({ height: 3, width: 3 });
    expect(board3x3.delta([1, 1], [0, 0])).toEqual(board3x3.coordArrayType.of(1, 1));
    expect(board3x3.delta([1, 1], [1, 0])).toEqual(board3x3.coordArrayType.of(2, 1));
    expect(board3x3.delta([1, 1], [0,-1])).toEqual(board3x3.coordArrayType.of(1, 0));
    expect(board3x3.delta([1, 1], [0,-2])).toBeNull();
    expect(board3x3.delta([3, 3], [-1,-1])).toEqual(board3x3.coordArrayType.of(2, 2));
    expect(board3x3.delta([1, 1], [0, 0], () => false)).toBeNull();
    expect(board3x3.delta([2, 2], [1, 1], () => true)).toBeNull();
  });

  test('deltas coordinates are properly calculated', () => {
    const board3x3 = new CheckerBoard({ height: 3, width: 3 });
    const checkCoords = coordsCheck(board3x3);
    const orthoOffsets = [[-1, 0], [+1, 0], [0, -1], [0, +1]];
    checkCoords(board3x3.deltas([1, 1], orthoOffsets), '0,1 2,1 1,0 1,2');
    checkCoords(board3x3.deltas([0, 0], orthoOffsets), '1,0 0,1');
    checkCoords(board3x3.deltas([2, 2], orthoOffsets), '1,2 2,1');
    checkCoords(board3x3.deltas([0, 2], orthoOffsets), '1,2 0,1');
    checkCoords(board3x3.deltas([2, 0], orthoOffsets), '1,0 2,1');
    checkCoords(board3x3.deltas([1, 2], orthoOffsets), '0,2 2,2 1,1');
    checkCoords(board3x3.deltas([2, 1], orthoOffsets), '1,1 2,0 2,2');
    checkCoords(board3x3.deltas([3, 3], orthoOffsets), '');
    checkCoords(board3x3.deltas([1, 1], orthoOffsets, () => false), '');
  });

  test('slide coordinates are properly calculated', () => {
    const board3x3 = new CheckerBoard({ height: 3, width: 3 });
    const checkCoords = coordsCheck(board3x3);
    checkCoords(board3x3.slide([0, 0], [1, 1]), '1,1 2,2');
    checkCoords(board3x3.slide([2, 2], [-1,0]), '1,2 0,2');
    checkCoords(board3x3.slide([1, 1], [1, 0]), '2,1');
    checkCoords(board3x3.slide([0, 0], [1, 1], ([x,]) => x < 2), '1,1');
    checkCoords(board3x3.slide([0, 0], [0, 1], () => false), '');
    checkCoords(board3x3.slide([0, 0], [0, 1], () => true), '0,1 0,2');
    checkCoords(board3x3.slide([0, 0], [0,-1]), '');
    checkCoords(board3x3.slide([0, 0], [0,-1], () => true), '');
  });

}); // describe 'CheckerBoard'
