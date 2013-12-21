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
		this.statistics = new basis.Statistics();
	},

	/** Tournament.account(match):
		Accounts the results of a finished match for the players' score.
	*/
	account: function account(match) {
		var game = this.game,
			results = match.result(), 
			isDraw = false,
			stats = this.statistics;
		basis.raiseIf(!results, "Match doesn't have results. Has it finished?");
		// Player statistics.
		basis.iterable(match.players).forEach(function (p) {
			var role = p[0],
				player = p[1],
				playerResult = results[p[0]],
				keys = ['game:'+ game.name, 'role:'+ role, 'player:'+ player.name];
			stats.add(keys.concat('results'), playerResult);
			stats.add(keys.concat(playerResult > 0 ? 'victories' : playerResult < 0 ? 'defeats' : 'draws'), playerResult);
			stats.add(keys.concat('length'), match.ply()); //FIXME This may not be accurate if the game has random variables.
			match.history.forEach(function (entry) {
				if (typeof entry.moves === 'function') {
					var moves = entry.moves();	
					if (moves && moves.hasOwnProperty(role) && moves[role].length > 0) {
						stats.add(keys.concat('width'), moves[role].length);
					}
				}
			})
		});
	},

	/** Tournament.run(matches=this.matches()):
		Plays the given matches. This argument must be an Iterable of 
		ludorum.Match objects.
	*/
	run: function run(matches) {
		var tournament = this;
		matches = matches || this.matches();
		return basis.Future.sequence(matches, function (match) {
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
		throw new Error("Tournament.matches is not implemented. Please override.");
	}
}); // declare Tournament

/** tournaments:
	Bundle of Tournament subclasses and related definitions.
*/
var tournaments = exports.tournaments = {};
