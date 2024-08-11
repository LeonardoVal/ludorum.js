import { Statistics } from '../utils/Statistics';

/** A tournament is a set of matches played between many players. This is an
 * abstract base class for many different types of contests.
*/
export class Tournament {
  /** The tournament always has one `game` state from which all matches start.
   *
   * @param {object} args
   * @param {Game} args.game
   * @param {Statistics} [args.stats]
  */
  constructor(args) {
    defProps(this, {
      game: args.game,
      stats: args.stats ?? new Statistics(),
    });
  }

  /** Generates arguments for each match of this tournament. It is not
   * implemented in this base class.
   *
   * @yields {object}
  */
  async* matchArgs() {
    throw new Error(`${this.constructor.name}.matchArgs() is not defined!`);
  }

  /** Generates the matches for this tournament.
   *
   * @yields {AsyncGenerator<object>}
  */
  async* matches() {
    for await (const args of this.matchArgs()) {
      yield new Match(args);
    }
  }

  /** Plays all the tournament's matches.
   *
   * @returns {Statistics}
  */
  async playTournament() {
    for await (const match of this.matches()) {
      this.stats.accountMatch(match);
    }
    return this.stats;
  }
} // class Tournament
