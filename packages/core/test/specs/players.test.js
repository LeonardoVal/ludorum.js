import { Predefined } from '../../src/games';
import {
  Player, HeuristicPlayer, RandomPlayer, TracePlayer,
} from '../../src/players';

async function checkPlayer({
  matchCount = 10,
  player,
}) {
  const result = [];
  for (let i = 0; i < matchCount; i += 1) {
    const game = new Predefined({
      height: 5,
      width: 6,
      winner: i < 2 ? i : null,
    });
    result.push(
      await player.checkPlayer({ expect, game }),
    );
  }
  return result;
}

describe('players', () => {
  test('expected definitions', () => {
    [Player, RandomPlayer].forEach((def) => {
      expect(def).toBeOfType('function');
    });
  });

  test('HeuristicPlayer with Predefined', async () => {
    await checkPlayer({
      player: new HeuristicPlayer(),
    });
  });

  test('RandomPlayer with Predefined', async () => {
    await checkPlayer({
      player: new RandomPlayer(),
    });
  });

  test('TracePlayer with Predefined', async () => {
    const player = new TracePlayer({
      player: new RandomPlayer(),
    });
    // await checkPlayer({ matchCount: 2, player });
    expect(player.trace.length).toBe(0);
    player.record = true;
    (await checkPlayer({ matchCount: 2, player }))
      .forEach(({ First: p1, Second: p2 }) => {
        expect(p1.trace.length).toBe(3);
        expect(p2.trace.length).toBe(2);
      });
  });
}); // describe 'players'
