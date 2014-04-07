/** # Class `Elimination`

Playoffs or sudden death kind of contests, also known as 
[elimination tournaments](http://en.wikipedia.org/wiki/Single-elimination_tournament).
In this tournaments players get randomly matched in successive brackets, each 
match's winner passing to the next round until the final match. Games are 
assumed to have only one winner per match.
*/
tournaments.Elimination = declare(Tournament, {
	/** The constructor takes the `game` to be played, the `players` and the 
	amount of matches that make each playoff (`matchCount`, 1 by default).
	*/
	constructor: function Elimination(game, players, matchCount) {
		Tournament.call(this, game, players);
		this.matchCount = isNaN(matchCount) ? 1 : +matchCount >> 0;
	},

	/** Each bracket is defined by partitioning the `players` in groups of the
	size required by the game (usually two). If there are not enough players,
	some players get reassigned. The bracket includes `matchCount` matches 
	between these participants, rotating roles if possible.
	*/
	__bracket__: function __bracket__(players) {
		var game = this.game,
			matchCount = this.matchCount,
			roleCount = this.game.players.length;
		players = players || this.players;
		if (players.length < roleCount) {
			return [];
		} else {
			return Iterable.range(0, players.length, roleCount).map(function (i) {
				var participants = Iterable.range(i, i + roleCount).map(function (j) {
					return players[j % players.length]; // Fill by repeating players if necessary.
				}).toArray();
				return Iterable.range(matchCount).map(function (i) {
					participants.unshift(participants.pop()); // Rotate partipants roles.
					return new Match(game, participants);
				}).toArray();
			}).toArray();
		}
	},
	
	/** A playoff is resolved by aggregating the results of all its matches. The
	winner of the playoff is the one with the greater result sum.
	*/
	__playoff__: function __playoff__(matches) {
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
			})
		});
		var winnerName = iterable(playoffResult).greater(function (pair) {
			return pair[1];
		})[0][0];
		return players[winnerName];
	},
	
	/** The elimination tournament runs until there is less players in the next
	bracket than the amount required to play the game. Since this amount is 
	usually two, the contest ends with one player at the top.
	*/
	__advance__: function __advance__() {
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
}); //// declare Elimination.
