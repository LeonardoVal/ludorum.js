import { ListCheckerboard } from '../../src/index';

describe('ListCheckerboard', () => {
  it('is defined as expected', () => {
    expect(ListCheckerboard).toBeOfType('function');
  });

  it('calculates lines properly', () => {
    const testLines = (
      dimensions, squareValues,
      horizontals, verticals, positiveDiags, negativeDiags,
    ) => {
      const board = new ListCheckerboard({
        dimensions, emptySquare: '.', squareValues,
      });
      const orthogonals = [...horizontals, ...verticals];
      const diagonals = [...positiveDiags, ...negativeDiags];
      const lines = [...orthogonals, ...diagonals];

      expect([...board.linesStrings(board.horizontalLines())])
        .toEqual(horizontals);
      expect([...board.linesStrings(board.verticalLines())])
        .toEqual(verticals);
      expect([...board.linesStrings(board.orthogonalLines())])
        .toEqual(orthogonals);
      expect([...board.linesStrings(board.positiveDiagonalLines())])
        .toEqual(positiveDiags);
      expect([...board.linesStrings(board.negativeDiagonalLines())])
        .toEqual(negativeDiags);
      expect([...board.linesStrings(board.diagonalLines())])
        .toEqual(diagonals);
      expect([...board.linesStrings(board.lines())])
        .toEqual(lines);
    };

    testLines([1, 1], '1',
      ['1'], ['1'], ['1'], ['1']);
    testLines([2, 1], '12',
      ['12'], ['1', '2'], ['1', '2'], ['1', '2']);
    testLines([1, 2], '12',
      ['1', '2'], ['12'], ['2', '1'], ['1', '2']);
    testLines([2, 2], '1234',
      ['12', '34'], ['13', '24'], ['3', '14', '2'], ['1', '32', '4']);
    testLines([3, 3], '123456789',
      ['123', '456', '789'], ['147', '258', '369'],
      ['7', '48', '159', '26', '3'], ['1', '42', '753', '86', '9']);
    testLines([4, 3], '123456789ABC',
      ['1234', '5678', '9ABC'], ['159', '26A', '37B', '48C'],
      ['9', '5A', '16B', '27C', '38', '4'], ['1', '52', '963', 'A74', 'B8', 'C']);
    testLines([3, 4], '123456789ABC',
      ['123', '456', '789', 'ABC'], ['147A', '258B', '369C'],
      ['A', '7B', '48C', '159', '26', '3'], ['1', '42', '753', 'A86', 'B9', 'C']);
  }); // it calculates lines properly.

  it('places pieces properly', () => {
    const board1x1 = () => new ListCheckerboard({
      dimensions: [1, 1], emptySquare: '.', squareValues: [...'1'],
    });
    expect(board1x1().place([0, 0], '.').squareValues.join('')).toBe('.');
    expect(board1x1().place([0, 0], '2').squareValues.join('')).toBe('2');
    expect(() => board1x1().place()).toThrow();
    expect(() => board1x1().place([])).toThrow();
    expect(() => board1x1().place(['3', 'b'])).toThrow();
    expect(() => board1x1().place([-1, 0])).toThrow();
    expect(() => board1x1().place([0, 2])).toThrow();

    const board3x3 = () => new ListCheckerboard({
      dimensions: [3, 3], emptySquare: '.', squareValues: [...'123456789'],
    });
    expect(board3x3().place([1, 1], '.').squareValues.join('')).toBe('1234.6789');
    expect(board3x3().place([1, 1], 'X').squareValues.join('')).toBe('1234X6789');
    expect(board3x3().place([1, 2], 'X').squareValues.join('')).toBe('1234567X9');
    expect(board3x3().place([2, 1], 'X').squareValues.join('')).toBe('12345X789');
    expect(board3x3().place([0, 0], 'X').squareValues.join('')).toBe('X23456789');
  }); // places pieces properly.

  it('moves pieces properly', () => {
    const board3x3 = () => new ListCheckerboard({
      dimensions: [3, 3], emptySquare: '.', squareValues: [...'123456789'],
    });
    expect(board3x3().move([1, 1], [0, 0]).squareValues.join('')).toBe('5234.6789');
    expect(board3x3().move([0, 0], [1, 1]).squareValues.join('')).toBe('.23416789');
    expect(board3x3().move([1, 2], [2, 1], 'X').squareValues.join('')).toBe('1234587X9');
    expect(board3x3().move([2, 0], [0, 2], 'X').squareValues.join('')).toBe('12X456389');

    expect(() => board3x3().move()).toThrow();
    expect(() => board3x3().move([])).toThrow();
    expect(() => board3x3().move([0, 0])).toThrow();
    expect(() => board3x3().move([0, 0], ['3', 'a'])).toThrow();
    expect(() => board3x3().move([0, 0], [-1, 0])).toThrow();
    expect(() => board3x3().move([0, 0], [0, 9])).toThrow();
  }); // moves pieces properly

  it('swaps pieces properly', () => {
    const board3x3 = () => new ListCheckerboard({
      dimensions: [3, 3], emptySquare: '.', squareValues: [...'123456789'],
    });
    expect(board3x3().swap([0, 0], [1, 1]).squareValues.join('')).toBe('523416789');
    expect(board3x3().swap([1, 1], [0, 0]).squareValues.join('')).toBe('523416789');
    expect(board3x3().swap([2, 1], [1, 2]).squareValues.join('')).toBe('123458769');
    expect(board3x3().swap([0, 2], [2, 0]).squareValues.join('')).toBe('127456389');

    expect(() => board3x3().swap()).toThrow();
    expect(() => board3x3().swap([])).toThrow();
    expect(() => board3x3().swap([0, 0])).toThrow();
    expect(() => board3x3().swap([0, 0], ['3', 'a'])).toThrow();
    expect(() => board3x3().swap([0, 0], [-1, 0])).toThrow();
    expect(() => board3x3().swap([0, 0], [0, 9])).toThrow();
  }); // swaps pieces properly

  it('whole board transformations', () => {
    const board3x3 = () => new ListCheckerboard({
      dimensions: [3, 3], emptySquare: '.', squareValues: [...'123456789'],
    });
    expect(board3x3().horizontalSymmetry().squareValues.join('')).toBe('321654987');
    expect(board3x3().verticalSymmetry().squareValues.join('')).toBe('789456123');
    expect(board3x3().horizontalSymmetry().verticalSymmetry().squareValues.join(''))
      .toBe('987654321');
    expect(board3x3().clockwiseRotation().squareValues.join('')).toBe('741852963');
    expect(board3x3().clockwiseRotation().clockwiseRotation().squareValues.join(''))
      .toBe('987654321');
    expect(board3x3().counterClockwiseRotation().squareValues.join(''))
      .toBe('369258147');
    expect(board3x3().counterClockwiseRotation().counterClockwiseRotation().squareValues.join(''))
      .toBe('987654321');
    expect(board3x3().clockwiseRotation().counterClockwiseRotation().squareValues.join(''))
      .toBe('123456789');
  }); // whole board transformations

  it('walks properly', () => {
    const board3x3 = new ListCheckerboard({
      dimensions: [3, 3], emptySquare: '.', squareValues: [...'123456789'],
    });
    expect(board3x3.lineString(board3x3.walk([0, 0], [+1, +1]))).toBe('159');
    expect(board3x3.lineString(board3x3.walk([1, 1], [+1, -1]))).toBe('53');
    expect(board3x3.lineString(board3x3.walk([2, 2], [-1, -1]))).toBe('951');
    expect(board3x3.lineString(board3x3.walk([2, 2], [+1, +1]))).toBe('9');
    expect(board3x3.lineString(board3x3.walk([3, 3], [+1, +1]))).toBe('');

    const walks = board3x3.walks([1, 1], [[+1, +1], [-1, -1]]);
    expect([...board3x3.linesStrings(walks)]).toEqual(['59', '51']);
  }); // walks properly
}); // describe ListCheckerboard
