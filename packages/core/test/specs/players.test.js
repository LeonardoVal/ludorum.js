import { describe, expect, test } from 'vitest';
import { Predefined } from '../../src/games';
import {
  Player, HeuristicPlayer, RandomPlayer, TracePlayer, UserInterfacePlayer,
} from '../../src/players';
import { TestSpectator } from '../../src/matches/TestSpectator';

async function checkPlayer({
  matchCount = 10,
  player,
  onMatchPlayed,
}) {
  expect(player.name)
    .toMatch(new RegExp(`^${player.constructor.name}`));
  for (let i = 0; i < matchCount; i += 1) {
    const game = new Predefined({
      height: 5,
      width: 6,
      winner: i < 2 ? i : null,
    });
    await TestSpectator.testGame({
      expect, game, player, onMatchPlayed, matchCount: 1,
    });
  }
}

describe('players', () => {
  test('expected definitions', () => {
    [
      Player, HeuristicPlayer, RandomPlayer, TracePlayer, UserInterfacePlayer,
    ].forEach((def) => {
      expect(typeof def).toBe('function');
    });
  });

  test('HeuristicPlayer with Predefined', async () => {
    const player = new HeuristicPlayer();
    await checkPlayer({ expect, player });
  });

  test('RandomPlayer with Predefined', async () => {
    const player = new RandomPlayer();
    await checkPlayer({ player });
  });

  test('TracePlayer with Predefined', async () => {
    const player = new TracePlayer({
      player: new RandomPlayer(),
      record: true,
    });
    expect(player.trace.length).toBe(0);
    await checkPlayer({
      matchCount: 2,
      player,
      onMatchPlayed({ match }) {
        const { First: p1, Second: p2 } = match.players;
        expect(p1.trace.length).toBe(3);
        expect(p2.trace.length).toBe(2);
      },
    });
  });

  test('UserInterfacePlayer with Predefined', async () => {
    const player = new UserInterfacePlayer();
    const intervalId = setInterval(() => {
      if (player.currentDecision) {
        const { game, role } = player.currentDecision;
        const decision = game.actions[role][0];
        player.choose(decision);
      }
    }, 5);
    try {
      await checkPlayer({ player });
    } finally {
      clearInterval(intervalId);
    }
  });
}); // describe 'players'
