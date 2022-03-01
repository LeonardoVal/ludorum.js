import { Checkerboard } from '../../src/index';

describe('Checkerboard', () => {
  it('is defined as expected', () => {
    expect(Checkerboard).toBeOfType('function');
  });

  it('calculates coordinates properly', () => {
    const board1x1 = new Checkerboard({
      dimensions: [1, 1], emptySquare: '.',
    });
    expect(board1x1.coord([0, 0], 'boolean')).toBe(true);
    expect(board1x1.coord([0, 0], 'int')).toBe(0);
    expect(board1x1.coord([1, 1], 'boolean')).toBe(false);
    expect(() => board1x1.coord([1, 1], 'int')).toThrow();
    const board3x3 = new Checkerboard({
      dimensions: [3, 3], emptySquare: '.',
    });
    expect(board3x3.coord([0, 0], 'boolean')).toBe(true);
    expect(board3x3.coord([0, 0], 'int')).toBe(0);
    expect(board3x3.coord([1, 0], 'boolean')).toBe(true);
    expect(board3x3.coord([1, 0], 'int')).toBe(1);
    expect(board3x3.coord([0, 2], 'boolean')).toBe(true);
    expect(board3x3.coord([0, 2], 'int')).toBe(6);
    expect(board3x3.coord([3, 3], 'boolean')).toBe(false);
    expect(() => board3x3.coord([3, 3], 'int')).toThrow();
  }); // calculates coordinates properly.
}); // describe Checkerboard
