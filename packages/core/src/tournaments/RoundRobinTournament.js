import { permutations } from '../utils/iterables';
import Tournament from './Tournament';

/** [Round-robins](http://en.wikipedia.org/wiki/Round-robin_tournament) are
 * tournaments where all players play against each other a certain number of
 * times.
*/
class RoundRobinTournament extends Tournament {
  /** @inheritdoc */
  static get name() {
    return 'RoundRobin';
  }

  /** The constructor takes the `game` to be played, the `players` and the
   * amount of matches each player should play (`matchCount`).
   *
   * @param {object} [args]
   * @param {Game} [args.game]
   * @param {number} [args.matchCount] - Equal to the number of roles by default.
  */
  constructor(args) {
    const { game, matchCount } = args || {};
    super(args);
    this
      ._prop('matchCount', matchCount, 'number', game.roles.length);
  }

  /** Round-robin matches make every player plays `matchCount` matches for each
   * role in the game against all the other opponents.
   *
   * @yields {Match}
  */
  async* matches() {
    const { game, players, matchCount } = this;
    for (let i = 0; i < matchCount; i += 1) {
      for (const matchPlayers of permutations(players, game.roles.length)) {
        yield this.newMatch(game, matchPlayers);
      }
    }
  }
} // class RoundRobin

RoundRobinTournament.defineSERMAT('matchCount');

export default RoundRobinTournament;
