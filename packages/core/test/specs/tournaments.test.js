import { describe, expect, test } from 'vitest';
import { Choose2Win } from '../../src/games';
import { StatsSpectator } from '../../src/matches/StatsSpectator';
import { TracePlayer } from '../../src/players/TracePlayer';
import { RoundRobinTournament, Tournament } from '../../src/tournaments';

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
    expect(typeof RoundRobinTournament).toBe('function');
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

  test('RoundRobinTournament with Choose2Win', async () => {
    const matchCount = 2;
    const tournament = new RoundRobinTournament({
      game: new Choose2Win(),
      matchCount,
      players: [
        tracePlayer('LoserPlayer', 'lose'),
        tracePlayer('PasserPlayer', 'pass'),
        tracePlayer('WinnerPlayer', 'win'),
      ],
    });
    const results = await tournament.playTournament();
    expect(results.LoserPlayer).toBe(-4 * matchCount);
    expect(results.PasserPlayer).toBe(0);
    expect(results.WinnerPlayer).toBe(4 * matchCount);
  }); // test 'RoundRobinTournament with Choose2Win'

  test('StatsSpectator with RoundRobinTournament & Choose2Win', async () => {
    const game = new Choose2Win();
    const matchCount = 2;
    const statsSpectators = new StatsSpectator();
    const tournament = new RoundRobinTournament({
      game,
      matchCount,
      players: [
        tracePlayer('LoserPlayer', 'lose'),
        tracePlayer('PasserPlayer', 'pass'),
        tracePlayer('WinnerPlayer', 'win'),
      ],
      spectators: [statsSpectators],
    });
    await tournament.playTournament();
    const { stats } = statsSpectators;
    for (const role of game.roles) {
      expect(stats.stat(`matches ${game.name} LoserPlayer ${role}`).count).toBe(2 * matchCount);
      expect(stats.stat(`matches ${game.name} PasserPlayer ${role}`).count).toBe(2 * matchCount);
      expect(stats.stat(`matches ${game.name} WinnerPlayer ${role}`).count).toBe(2 * matchCount);

      expect(stats.stat(`width ${game.name} LoserPlayer ${role}`).avg).toBeCloseTo(3);
      expect(stats.stat(`width ${game.name} PasserPlayer ${role}`).avg)
        .toBeCloseTo(role === 'This' ? 3 : 0);
      expect(stats.stat(`width ${game.name} WinnerPlayer ${role}`).avg).toBeCloseTo(3);

      expect(stats.stat(`result ${game.name} LoserPlayer ${role}`).sum).toBeCloseTo(-2 * matchCount);
      expect(stats.stat(`result ${game.name} PasserPlayer ${role}`).sum).toBeCloseTo(0);
      expect(stats.stat(`result ${game.name} WinnerPlayer ${role}`).sum).toBeCloseTo(2 * matchCount);

      expect(stats.stat(`defeats ${game.name} LoserPlayer ${role}`).sum).toBeCloseTo(-2 * matchCount);
      expect(stats.stat(`defeats ${game.name} PasserPlayer ${role}`).sum).toBeCloseTo(-1 * matchCount);
      expect(stats.stat(`defeats ${game.name} WinnerPlayer ${role}`).sum).toBeCloseTo(0);

      expect(stats.stat(`victories ${game.name} LoserPlayer ${role}`).sum).toBeCloseTo(0);
      expect(stats.stat(`victories ${game.name} PasserPlayer ${role}`).sum).toBeCloseTo(1 * matchCount);
      expect(stats.stat(`victories ${game.name} WinnerPlayer ${role}`).sum).toBeCloseTo(2 * matchCount);

      expect(stats.stat(`draws ${game.name} LoserPlayer ${role}`).sum).toBeCloseTo(0);
      expect(stats.stat(`draws ${game.name} PasserPlayer ${role}`).sum).toBeCloseTo(0);
      expect(stats.stat(`draws ${game.name} WinnerPlayer ${role}`).sum).toBeCloseTo(0);
    }
  }); // test 'RoundRobinTournament with Choose2Win'

}); // describe 'tournaments'
