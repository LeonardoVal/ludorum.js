/** ludorum/src/tournaments/AllAgainstAll.js:
	Tournament where all players play against each other a certain number of
	times.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Measurement tournament. /////////////////////////////////////////////////////

tournaments.AllAgainstAll = basis.declare(Tournament, {
	/** new tournaments.AllAgainstAll(game, players, matchCount=game.players.length):
		A tournament that confronts all players against each other rotating 
		their roles in the matches.
	*/
	constructor: function AllAgainstAll(game, players, matchCount) {
		Tournament.call(this, game, players);
		this.matchCount = isNaN(matchCount) ? game.players.length : +matchCount;
	},

	/** tournaments.AllAgainstAll.matches():
		Every player plays matchCount matches for each role in the game against
		all the other opponents.
	*/
	matches: function matches() {
		var tournament = this,
			game = this.game,
			ms = basis.iterable(this.players);
		ms = ms.product.apply(ms, basis.Iterable.repeat(this.players, game.players.length - 1).toArray());
		return ms.filter(function (tuple) { // Check for repeated.
			for (var i = 1; i < tuple.length; i++) {
				for (var j = 0; j < i; j++) {
					if (tuple[i] === tuple[j]) {
						return false;
					}
				}
			}
			return true;
		}).product(basis.Iterable.range(this.matchCount)).map(function (tuple) {
			return new Match(game, tuple[0]);
		});
	}
}); // declare AllAgainstAll.
