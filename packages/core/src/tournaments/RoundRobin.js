import { permutations } from '../utils/iterables';
import Tournament from './Tournament';

/** [Round-robins](http://en.wikipedia.org/wiki/Round-robin_tournament) are
 * tournaments where all players play against each other a certain number of
 * times.
*/
class RoundRobin extends Tournament {
  /** The constructor takes the `game` to be played, the `players` and the
   * amount of matches each player should play (`matchCount`).
  */
  constructor(args) {
    const { game, matchCount } = args || {};
    super(args);
    this
      ._prop('matchCount', matchCount, 'number', game.players.length);
  }

  /** Round-robin matches make every player plays `matchCount` matches for
  each role in the game against all the other opponents.
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

Tournament.addSERMAT(RoundRobin, 'matchCount');

export default RoundRobin;
