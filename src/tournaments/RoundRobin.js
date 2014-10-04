/** # RoundRobin

[Round-robins](http://en.wikipedia.org/wiki/Round-robin_tournament) are 
tournaments where all players play against each other a certain number of times.
*/
tournaments.RoundRobin = declare(Tournament, {
	/** The constructor takes the `game` to be played, the `players` and the 
	amount of matches each player should play (`matchCount`).
	*/
	constructor: function RoundRobin(game, players, matchCount) {
		Tournament.call(this, game, players);
		this.matchCount = isNaN(matchCount) ? game.players.length : +matchCount;
		this.__advance__ = this.__matches__().chain(Iterable.repeat(null)).__iter__();
	},

	/** Round-robin matches make every player plays `matchCount` matches for 
	each role in the game against all the other opponents.
	*/
	__matches__: function __matches__() {
		var tournament = this,
			game = this.game,
			ms = iterable(this.players);
		ms = ms.product.apply(ms, Iterable.repeat(this.players, game.players.length - 1).toArray());
		return ms.filter(function (tuple) { // Check for repeated.
			for (var i = 1; i < tuple.length; i++) {
				for (var j = 0; j < i; j++) {
					if (tuple[i] === tuple[j]) {
						return false;
					}
				}
			}
			return true;
		}).product(Iterable.range(this.matchCount)).map(function (tuple) {
			return new Match(game, tuple[0]);
		});
	}
}); //// declare RoundRobin.
