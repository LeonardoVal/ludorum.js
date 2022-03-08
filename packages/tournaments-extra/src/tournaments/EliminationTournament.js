import { Tournament } from '@ludorum/core';

/** Playoffs or sudden death kind of contests, also known as [elimination tournaments](http://en.wikipedia.org/wiki/Single-elimination_tournament).
 * In this tournaments players get randomly matched in successive brackets, each
 * match's winner passing to the next round until the final match. Games are
 * assumed to have only one winner per match.
*/
class EliminationTournament extends Tournament {
  /** @inheritdoc */
  static get name() {
    return 'EliminationTournament';
  }

  /** The constructor takes the `game` to be played, the `players` and the
   * amount of matches that make each playoff (`matchCount`, 1 by default).
  */
  constructor(args) {
    const { game, matchCount } = args || {};
    super(args);
    this
      ._prop('matchCount', matchCount, 'number', game.roles.length);
  }

  /** @inheritdoc */
  async* matches() {
    const { game, players } = this;
    for (let roundPlayers = players; roundPlayers.length >= game.roles.length;) {
      const winners = []; // TODO Event onRound
      for (const { matches, winner } of this.round(roundPlayers)) {
        winners.push(winner);
        yield* matches;
      }
      roundPlayers = await Promise.all(winners);
    }
  }

  /** Each round is defined by partitioning the `players` in groups of the
   * size required by the game (usually two). If there are not enough players,
   * some players get reassigned. The bracket includes `matchCount` matches
   * between these participants, rotating roles if possible.
   *
   * @param {Player[]} players
   * @return {object} - An object with a `matches` array and a `winner` promise.
  */
  * round(players) {
    const { game, matchCount } = this;
    const roleCount = game.roles.length;
    const getPlayer = (_, i) => (
      players[i % players.length] // Fill by repeating players if necessary.
    );
    if (players.length >= roleCount) {
      for (let i = 0; i < players.length; i += roleCount) {
        const matchupPlayers = players.slice(i, i + roleCount);
        const matchupMatches = [];
        for (let m = 0; m < matchCount; m += 1) {
          // Rotate partipants roles.
          const participants = [...matchupPlayers, ...matchupPlayers]
            .slice(m, m + roleCount); // FIXME
          const match = this.newMatch(game, participants);
          matchupMatches.push(match);
        }
        yield {
          matches: matchupMatches,
          winner: this.playoff(matchupMatches),
        };
      }
    }
  }

  /** TODO
  */
  async playoff(matches) {
    const matchResults = await Promise.all(matches.map((match) => match.wait()));
    const playerResults = new Map();
    let maxResult = -Infinity;
    matchResults.forEach((result, i) => {
      const { players: matchPlayers } = matches[i];
      Object.entries(matchPlayers).forEach(([role, player]) => {
        if (!playerResults.has(player.name)) {
          playerResults.set(player.name, { player, result: 0 });
        }
        const playerEntry = playerResults.get(player.name);
        playerEntry.result += result[role];
        maxResult = Math.max(maxResult, playerEntry.result);
      });
    });
    const winners = [...playerResults.values()]
      .filter(({ result }) => result === maxResult)
      .map(({ player }) => player);
    return this.random.choice(winners);
  }
} // class EliminationTournament

/** Serialization and materialization using Sermat.
*/
EliminationTournament.defineSERMAT('matchCount');

export default EliminationTournament;
