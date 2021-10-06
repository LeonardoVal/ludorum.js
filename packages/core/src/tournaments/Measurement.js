import { permutations } from '../utils/iterables';
import Tournament from './Tournament';

/** Measurement tournaments pit the player being measured against others in
 * order to assess that player's performance at a game. They are used to
 * evaluate how well the players play by confronting them with the opponents,
 * rotating their roles in the matches.
*/
class Measurement extends Tournament {
  /** The constructor takes the `game` used in the contest, the `players` being
   * evaluated, the `opponents` used to evaluate them, and the amount of matches
   * each player will play (`matchCount`).
  */
  constructor(args) {
    const { game, opponents, matchCount } = args || {};
    super(args);
    this
      ._prop('matchCount', matchCount, 'number', game.players.length)
      ._prop('opponents', opponents, Array);
    if (opponents.length < game.roles.length - 1) {
      throw new Error(`${opponents.length} are not enough opponents!`);
    }
  }

  /** A measurement tournament makes every player play `matchCount` matches for
   * each role in the game against all possible combinations of opponents.
  */
  async* matches() {
    const {
      game, players, opponents, matchCount,
    } = this;
    for (let i = 0; i < matchCount; i += 1) {
      for (const matchOpponents of permutations(opponents, game.roles.length - 1)) {
        for (let playerIndex = 0; playerIndex <= matchOpponents.length; playerIndex += 1) {
          for (const player of players) {
            const participants = [...matchOpponents];
            participants.splice(playerIndex, 0, player);
            yield this.newMatch(game, participants);
          }
        }
      }
    }
  }
} // class Measurement

/** Serialization and materialization using Sermat.
*/
Tournament.addSERMAT(Measurement, 'matchCount opponents');

export default Measurement;
