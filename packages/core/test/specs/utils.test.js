import {
  permutations,
} from '../../src/utils/iterables';

describe('utils', () => {
  it('iterables.permutations', () => {
    expect([...permutations([], 0)]).toEqual([]);
    expect(() => permutations([], 1)).toThrow();
    expect([...permutations('abc', 1)])
      .toEqual([...'abc'].map((chr) => [chr]));
    expect([...permutations('abc', 2)])
      .toEqual(['ab', 'ac', 'ba', 'bc', 'ca', 'cb'].map((chrs) => [...chrs]));
  });
}); // describe 'utils'
