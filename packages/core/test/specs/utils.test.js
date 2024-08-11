import { describe, expect, test } from 'vitest';
import { bests, permutations } from '../../src/utils';
import { mapObject } from '../../src/utils';

describe('utils', () => {
  test('objects.mapObject', () => {
    expect(mapObject([], () => null)).toEqual({});
    expect(mapObject([...'abc'], (k) => k))
      .toEqual({ a: 'a', b: 'b', c: 'c' });
    expect(mapObject([...'yzx'], (_k, i) => i + 1))
      .toEqual({ y: 1, z: 2, x: 3 });
  }); // test 'objects.mapObject'

  test('iterables.bests', () => {
    expect(typeof bests).toBe('function');
    expect(bests([], () => 1)).toEqual([]);
    expect(bests(['a', 'bb', 'ccc', 'd'], (s) => s.length))
      .toEqual(['ccc']);
    expect(bests(['a', 'bb', 'c', 'dd'], (s) => s.length))
      .toEqual(['bb', 'dd']);
  }); // test 'iterables.bests'

  test('iterables.permutations', () => {
    expect(typeof permutations).toBe('function');
    expect([...permutations([], 0)]).toEqual([[]]);
    expect([...permutations('abc', 1)])
      .toEqual([...'abc'].map((chr) => [chr]));
    expect([...permutations('abc', 2)])
      .toEqual(['ab', 'ac', 'ba', 'bc', 'ca', 'cb'].map((chrs) => [...chrs]));
    expect(() => [...permutations([], 1)]).toThrow();
    expect(() => [...permutations('abc', 4)]).toThrow();
  }); // test 'iterables.permutations'

}); // describe 'utils'
