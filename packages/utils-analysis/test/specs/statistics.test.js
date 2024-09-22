import { describe, expect, test } from 'vitest';
import { Choose2Win, Match, RandomPlayer } from '@ludorum/core';
import { Statistics } from '../../src/utils/Statistics';

describe('Statistics', () => {
  test('accounts properly', () => {
    const stats = new Statistics();
    expect([...stats.map.keys()]).toEqual([]);
    expect(stats.entry('key')).toEqual({
      key: 'key',
      count: 0,
      min: NaN,
      max: NaN,
      sum: 0,
      sumSquares: 0,
    });
    expect([...stats.map.keys()]).toEqual(['key']);
    [
      [1, [1, 1, 1, 1]],
      [3, [1, 3, 4, 10]],
      [2, [1, 3, 6, 14]],
    ].forEach(([value, [min, max, sum, sumSquares]], valueIndex) => {
      stats.account('key', value);
      expect(stats.entry('key')).toEqual({
        key: 'key',
        count: valueIndex + 1,
        min,
        max,
        sum,
        sumSquares,
      });
    });
  }); // test 'accounts properly'

  test.skip('accounts matches', async () => {
    const game = new Choose2Win();
    const match = new Match({
      game,
      players: game.roles.map(() => new RandomPlayer()),
    });
    const stats = new Statistics();
    for await (const step of stats.accountMatch(match)) {
      expect(step.start ?? step.next ?? step.final).toBeInstanceOf(Choose2Win);
    }
  }); // test 'accounts matches'
}); // aleatories
