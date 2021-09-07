import Match from '../Match';
import Predefined from '../games/Predefined';

export const checkPlayer = async ({
  game,
  playerBuilder,
}) => {
  const players = game.roles.map((n) => playerBuilder(n));
  const match = new Match({ game, players });
  for await (const entry of match.run()) {
    expect(entry.game).toBeOfType(game.constructor);
  }
  return match;
}; // checkPlayer

export const checkPlayerWithPredefined = async ({
  length = 5,
  width = 6,
  matchCount = 5,
  playerBuilder,
}) => {
  for (let i = 0; i < matchCount; i += 1) {
    const result = {
      First: (i % 3) - 1,
      Second: 1 - (i % 3),
    };
    const game = new Predefined({
      activeRole: i % 2,
      height: length,
      width,
      result,
    });
    const { current, history } = await checkPlayer({ game, playerBuilder });
    expect(current.game.result).toEqual(result);
    expect(history.length).toBe(length + 1);
  }
}; // checkPlayerWithPredefined

export default {
  checkPlayer,
  checkPlayerWithPredefined,
};