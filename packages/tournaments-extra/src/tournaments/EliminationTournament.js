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

  /** .
  */
  async* matches() {
    const { players } = this;
    yield* this.brackets(players);
  }

  /** Each bracket is defined by partitioning the `players` in groups of the
   * size required by the game (usually two). If there are not enough players,
   * some players get reassigned. The bracket includes `matchCount` matches
   * between these participants, rotating roles if possible.
   *
   * @param {Player[]} players
   * @yields {Match}
  */
  * brackets(players) {
    const { game, matchCount } = this;
    const roleCount = game.roles.length;
    const getPlayer = (_, i) => (
      players[i % players.length] // Fill by repeating players if necessary.
    );
    if (players.length >= roleCount) {
      for (let i = 0; i < players.length; i += 1) {
        const bracketPlayers = Array(roleCount).fill().map(getPlayer);
        for (let m = 0; m < matchCount; m += 1) {
          // Rotate partipants roles.
          const participants = [...bracketPlayers, ...bracketPlayers]
            .slice(m, m + roleCount);
          yield this.newMatch(game, participants);
        }
      }
    }
  }

  /** A playoff is resolved by aggregating the results of all its matches. The
   * winner of the playoff is the one with the greater result sum.
  * /
  playoff(matches) {
    var playoffResult = {},
      players = {};
    matches.forEach(function (match) {
      var matchResult = match.result();
      if (!matchResult) {
        throw new Error('Unfinished match in playoff!');
      }
      iterable(match.players).forEach(function (tuple) {
        var role = tuple[0],
          playerName = tuple[1].name;
        playoffResult[playerName] = (+playoffResult[playerName] || 0) + matchResult[role];
        players[playerName] = tuple[1];
      });
    });
    var winnerName = iterable(playoffResult).greater(function (pair) {
      return pair[1];
    })[0][0];
    return players[winnerName];
  }

  /** The elimination tournament runs until there is less players in the next
  bracket than the amount required to play the game. Since this amount is
  usually two, the contest ends with one player at the top.
  * /
  advance() {
    if (!this.__matches__ || this.__matches__.length < 1) {
      if (!this.__currentBracket__) { // First bracket.
        this.__currentBracket__ = this.__bracket__(this.players);
      } else if (this.__currentBracket__.length < 1) { // Tournament is finished.
        return null;
      } else { // Second and on brackets.
        var players = this.__currentBracket__.map(this.__playoff__);
        this.__currentBracket__ = this.__bracket__(players);
      }
      this.__matches__ = iterable(this.__currentBracket__).flatten().toArray();
    }
    return this.__matches__.shift();
  }
  /* */
} // class EliminationTournament

/** Serialization and materialization using Sermat.
*/
EliminationTournament.defineSERMAT('matchCount');

export default EliminationTournament;
