import { Game } from '@ludorum/core';

const ROLE_EVENS = 'Evens';
const ROLE_ODDS = 'Odds';
const ACTIONS = ['even', 'odd'];

function byRoles(valueEvens, valueOdds) {
  return {
    [ROLE_EVENS]: valueEvens,
    [ROLE_ODDS]: valueOdds,
  };
}

/** [Odds and evens](http://en.wikipedia.org/wiki/Odds_and_evens) is a classic
 * child game, implemented as a simple example of a simultaneous game, i.e. a
 * game in which more than one player can move at any given turn.
*/
export class OddsAndEvens extends Game {
  static meta = {
    description: 'Implementation of odds and evens, a simple simultaneous game.',
    isSimultaneous: true,
    name: 'OddsAndEvens',
    roles: [ROLE_EVENS, ROLE_ODDS],
  }

  /** Builds a new OddsAndEvens game state:
   *
   * @param {object} [args]
   * @param {number} [args.turns=1] - Turns left for the current game.
   * @param {object} [args.points=[0, 0]] - The scores so far in the match.
  */
  init(state = null) {
    const turns = state?.turns ?? 1;
    const points = state?.points ?? [0, 0]; 

    const activeRoles = [...this.roles];
    const remainingTurns = turns - points[0] - points[1];
    const pointDifference = points[0] - points[1];
    const isFinished = remainingTurns < 1;
    const actions = isFinished ? null : byRoles([...ACTIONS], [...ACTIONS]);
    const scores = byRoles(+pointDifference, -pointDifference);
    const result = isFinished ? byRoles(
      Math.sign(+pointDifference), Math.sign(-pointDifference),
    ) : null;

    super.init({
      actions, activeRoles, isFinished, points, result, scores, turns,
    });
  }

  /** If both players play either even or odd, the Evens player earns a point.
   * Otherwise the Odds player earns a point.
   *
   * @param {object} actions
   * @param {object} haps
   * @return {Game}
  */
  nextState(actions, haps) {
    const { points, turns } = this;
    const { [ROLE_EVENS]: moveEvens, [ROLE_ODDS]: moveOdds } = actions;
    const newPoints = [...points];
    newPoints[+(moveEvens !== moveOdds)] += 1;
    return { points: newPoints, turns };
  }
} // class OddsAndEvens
