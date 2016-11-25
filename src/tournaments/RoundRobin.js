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
			game = this.game;
		return iterable(this.players)
			.permutations(game.players.length)
			.product(Iterable.range(this.matchCount)).map(function (tuple) {
				return new Match(game, tuple[0]);
			});
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'RoundRobin',
		serializer: function serialize_RoundRobin(obj) { //TODO Include statistics.
			return [obj.game, obj.players, obj.matchCount];
		}
	}
}); //// declare RoundRobin.
