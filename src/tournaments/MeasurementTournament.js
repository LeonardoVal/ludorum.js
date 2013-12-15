/** ludorum/src/tournaments/MeasurementTournament.js:
	Measurement tournament pit the player being measured against others in order
	to assess that player's performance at a game.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Measurement tournament. /////////////////////////////////////////////////////

tournaments.MeasurementTournament = basis.declare(Tournament, {
	/** new tournaments.Measurement(game, players, opponents, matchCount=game.players.length):
		A tournament used to evaluate how well the players play by confronting
		them with the opponents, rotating their roles in the matches.
	*/
	constructor: function Measurement(game, players, opponents, matchCount) {
		Tournament.call(this, game, Array.isArray(players) ? players : [players]);
		this.opponents = Array.isArray(opponents) ? opponents : [opponents];
		basis.raiseIf(this.opponents.length < game.players.length - 1, "Not enough opponents.");
		this.matchCount = isNaN(matchCount) ? game.players.length : +matchCount;
	},

	/** tournaments.Measurement.matches():
		Every player plays matchCount matches for each role in the game against
		all possible combinations of opponents.
	*/
	matches: function matches() {
		var game = this.game,
			playerCount = game.players.length,
			opponentCombinations = iterables.product.apply(this,
				iterables.repeat(this.opponents, playerCount - 1).toArray()
			);
		return iterables.product(this.players, 
			iterables.range(playerCount),
			opponentCombinations,
			iterables.range(this.matchCount)).map(function (tuple){
				var players = tuple[2].slice(0);
				players.splice(tuple[1], 0, tuple[0]);
				return new ludorum.Match(game, players);
			});
	}
}); // declare MeasurementTournament.
