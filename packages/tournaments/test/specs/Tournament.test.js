import { describe, expect, test } from 'vitest';
import { Choose2Win, TracePlayer } from '@ludorum/core';
import { Tournament } from '../../src/tournaments';

describe('tournaments', () => {
  function tracePlayer(name, action) {
    const trace = [Choose2Win.meta.roles.reduce((obj, role) => {
      obj[role] = action;
      return obj;
    }, {})];
    return new TracePlayer({ name, trace });
  }

  test('expected definitions', () => {
    expect(typeof Tournament).toBe('function');
  }); // test 'expected definitions'

  test('Tournament with Choose2Win', async () => {
    const matchCount = 3;
    for (const [action1, action2, result1, result2] of [
      ['win', 'lose', +matchCount, -matchCount],
      ['pass', 'win', -matchCount, +matchCount],
      ['pass', 'lose', +matchCount, -matchCount],
    ]) {
      const tournament = new Tournament({
        game: new Choose2Win(),
        matchCount,
        players: [
          tracePlayer('ThisPlayer', action1),
          tracePlayer('ThatPlayer', action2),
        ],
      });
      const results = await tournament.playTournament();
      expect(results.ThisPlayer).toBe(result1);
      expect(results.ThatPlayer).toBe(result2);
    }
  }); // test 'Tournament with Choose2Win'

}); // describe 'tournaments'
