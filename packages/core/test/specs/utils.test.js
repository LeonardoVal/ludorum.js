import {
  bests,
  cartesianProduct,
  cartesianProductObject,
  permutations,
} from '../../src/utils/iterables';

describe('utils', () => {
  test('iterables.bests', () => {
    expect(bests).toBeOfType('function');
    expect(bests([], () => 1)).toEqual([]);
    expect(bests(['a', 'bb', 'ccc', 'd'], (s) => s.length))
      .toEqual(['ccc']);
    expect(bests(['a', 'bb', 'c', 'dd'], (s) => s.length))
      .toEqual(['bb', 'dd']);
  });

  test('iterables.cartesianProduct', () => {
    expect(cartesianProduct).toBeOfType('function');
    expect([...cartesianProduct()])
      .toEqual([[]]);
    expect([...cartesianProduct('abc')])
      .toEqual([['a'], ['b'], ['c']]);
    expect([...cartesianProduct('ab', '01')])
      .toEqual([['a', '0'], ['a', '1'], ['b', '0'], ['b', '1']]);
    expect([...cartesianProduct([0, 1], [0, 1], [7])])
      .toEqual([[0, 0, 7], [0, 1, 7], [1, 0, 7], [1, 1, 7]]);
    expect([...cartesianProduct('xyz', '')]).toEqual([]);
  });

  test('iterables.cartesianProductObject', () => {
    expect(cartesianProductObject).toBeOfType('function');
    expect([...cartesianProductObject({})])
      .toEqual([{}]);
    expect([...cartesianProductObject({ x: 'abc' })])
      .toEqual([{ x: 'a' }, { x: 'b' }, { x: 'c' }]);
    expect([...cartesianProductObject({ x: 'ab', y: '01' })])
      .toEqual([
        { x: 'a', y: '0' }, { x: 'a', y: '1' }, { x: 'b', y: '0' },
        { x: 'b', y: '1' },
      ]);
    expect([...cartesianProductObject({ p: [0, 1], q: [0, 1], r: [7] })])
      .toEqual([
        { p: 0, q: 0, r: 7 }, { p: 0, q: 1, r: 7 },
        { p: 1, q: 0, r: 7 }, { p: 1, q: 1, r: 7 },
      ]);
    expect([...cartesianProductObject({ a: 'xyz', b: '' })]).toEqual([]);
  });

  test('iterables.permutations', () => {
    expect(permutations).toBeOfType('function');
    expect([...permutations([], 0)]).toEqual([[]]);
    expect([...permutations('abc', 1)])
      .toEqual([...'abc'].map((chr) => [chr]));
    expect([...permutations('abc', 2)])
      .toEqual(['ab', 'ac', 'ba', 'bc', 'ca', 'cb'].map((chrs) => [...chrs]));
    expect(() => [...permutations([], 1)]).toThrow();
    expect(() => [...permutations('abc', 4)]).toThrow();
  });
}); // describe 'utils'
