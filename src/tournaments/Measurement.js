/** # Measurement

Measurement tournaments pit the player being measured against others in order
to assess that player's performance at a game. They are used to evaluate how 
well the players play by confronting them with the opponents, rotating their 
roles in the matches.
*/
tournaments.Measurement = declare(Tournament, {
	/** The constructor takes the `game` used in the contest, the `players`
	being evaluated, the `opponents` used to evaluate them, and the amount of
	matches each player will play (`matchCount`).
	*/
	constructor: function Measurement(game, players, opponents, matchCount) {
		Tournament.call(this, game, Array.isArray(players) ? players : [players]);
		this.opponents = Array.isArray(opponents) ? opponents : [opponents];
		raiseIf(this.opponents.length < game.players.length - 1, "Not enough opponents.");
		this.matchCount = isNaN(matchCount) ? game.players.length : +matchCount;
		this.__advance__ = this.__matches__().chain(Iterable.repeat(null)).__iter__();
	},

	/** A measurement tournament makes every player play `matchCount` matches 
	for each role in the game against all possible combinations of opponents.
	*/
	__matches__: function __matches__() {
		var game = this.game,
			playerCount = game.players.length,
			opponentCombinations = iterable(this.opponents);
		if (playerCount > 2) {
			opponentCombinations = opponentCombinations.product.apply(opponentCombinations, 
				Iterable.repeat(this.opponents, playerCount - 2).toArray());
		} else {
			opponentCombinations = opponentCombinations.map(function (p) {
				return [p];
			});
		}
		return iterable(this.players).product( 
			Iterable.range(playerCount),
			opponentCombinations,
			Iterable.range(this.matchCount)).map(function (tuple){
				var players = tuple[2].slice(0);
				players.splice(tuple[1], 0, tuple[0]);
				return new Match(game, players);
			});
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Measurement',
		serializer: function serialize_Measurement(obj) { //TODO Include statistics.
			return [obj.game, obj.players, obj.opponents, obj.matchCount];
		}
	}
}); //// declare Measurement.
