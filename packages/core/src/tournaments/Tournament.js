import { Match } from '../games';
import { BaseClass } from '../utils';

/** A tournament is a set of matches played between many players. This is an
 * abstract base class for many different types of contests.
*/
export class Tournament extends BaseClass {
  /** The tournament always has one `game` state from which all matches start.
   *
   * @param {object} args
   * @param {Game} args.game
   * @param {number=10} args.matchCount
   * @param {Player[]} args.players
   * @param {Statistics} [args.stats]
  */
  constructor(args) {
    super();
    this.__props({
      game: args.game,
      players: args.players,
      matchCount: args.matchCount ?? 10,
      spectators: args.spectators,
    });
  }

  /** Generates arguments for each match of this tournament. In this base class
   * its just a repetition of `matchCount` matches.
   *
   * @yields {object}
  */
  async* matchArgs() {
    const { game, matchCount, players } = this;
    for (let i = 0; i < matchCount; i++) {
      yield { game, players };
    }
  }

  /** Generates the matches for this tournament.
   *
   * @yields {AsyncGenerator<object>}
  */
  async* matches() {
    for await (const args of this.matchArgs()) {
      const spectators = [...args.spectators ?? [], ...this.spectators ?? []];
      yield new Match({ ...args, spectators });
    }
  }

  /** Plays all the tournament's matches.
   *
   * @returns {Statistics}
  */
  async playTournament() {
    let playersResults = {};
    for await (const match of this.matches()) {
      const result = await match.playthrough();
      for (const [role, player] of Object.entries(match.players)) {
        playersResults[player.name] = (playersResults[player.name] ?? 0)
          + result[role];
      }
    }
    return playersResults;
  }
} // class Tournament
