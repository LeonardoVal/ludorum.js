/** ludorum/src/Tournament.js:
	A tournament is a set of matches played between many players. The whole 
	contest ranks the participants according to the result of the matches.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Base contest controller //////////////////////////////////////////////////////////

var Tournament = exports.Tournament = basis.declare({
	/** new Tournament(game, players):
		Base class of all tournament controllers.
	*/
	constructor: function Tournament(game, players) {
		/** Tournament.game:
			The game played at the tournament.
		*/
		this.game = game;
		/** Tournament.players:
			An array with the participants in the tournament.
		*/
		this.players = Array.isArray(players) ? players : iterables.iterable(players).toArray();
		/** Tournament.statistics:
			Tournament statistics. These include the accumulated score for 
			each player, indexed by name.
		*/
		this.statistics = new racconto.Statistics();
	},

	/** Tournament.account(match):
		Accounts the results of a finished match for the players' score.
	*/
	account: function account(match) {
		var results = match.result(), isDraw = false,
			stats = this.statistics;
		basis.raiseIf(!results, "Match doesn't have results. Has it finished?");
		// Player statistics.
		iterables.iterable(match.players).forEach(function (p) {
			var playerResult = results[p[0]];
			stats.add(p[0], playerResult);
			stats.add(p[1].name, playerResult);
			stats.add('.results', playerResult);
			if (playerResult > 0) {
				stats.add(p[0] +'.victories', playerResult);
			} else if (playerResult < 0) {
				stats.add(p[0] +'.defeats', playerResult);
			} else {
				isDraw = true;
			}
		});
		// Match statistics.
		if (isDraw) {
			stats.add('.matchDrawn', match.history.length - 1);
		}
		stats.add('.matchLength', match.history.length - 1); // Skip initial state.
		iterables.iterable(match.history).forEach(function (gameState) {
			var moves = gameState.moves(), 
				count = 0;
			for (var player in moves) {
				stats.add('.matchWidth.'+ player, moves[player].length);
				count += moves[player].length;
			}
			if (count > 0) { // (count == 0) happens at the final state.
				stats.add('.matchWidth', count);
			}
		});
	},

	/** Tournament.run(matches=this.matches()):
		Plays the given matches. This argument must be an Iterable of 
		ludorum.Match objects.
	*/
	run: function run(matches) {
		var tournament = this;
		matches = matches || this.matches();
		return basis.async.sequence(matches, function (match) {
			return match.run().then(function (match) {
				tournament.account(match);
				return tournament;
			});
		});
	},

	/** Tournament.matches():
		Returns the matches of this contest in an iterable. In this base 
		implementation this method raises an exception. It must be overriden.
	*/
	matches: function matches() {
		basis.raise("Tournament.matches is not implemented. Please override.");
	}
}); // declare Tournament

/** tournaments:
	Bundle of Tournament subclasses and related definitions.
*/
var tournaments = exports.tournaments = {};
