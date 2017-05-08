/** # Odds & Evens

[Odds and evens](http://en.wikipedia.org/wiki/Odds_and_evens) is a classic child game, implemented 
as a simple example of a simultaneous game, i.e. a game in which more than one player can move at 
any given turn.
*/
games.OddsAndEvens = declare(Game, {
	name: 'OddsAndEvens',
	
	/** The constructor takes:
		+ `turns=1`: The number of turns remaining in the game.
		+ `points=<zero for every player>`: The scores for every player.
	*/
	constructor: function OddsAndEvens(turns, points) {
		Game.call(this, this.players); // Both players are active.
		this.turns = isNaN(turns) ? 1 : +turns;
		this.points = points || { Evens: 0, Odds: 0 };
	},
	
	/** Players for odds and evens are called like that: Evens and Odds.
	*/
	players: ['Evens', 'Odds'],

	/** Each turn both players draw either a 1 or a 2.
	*/
	moves: function moves() {
		return this.turns < 1 ? null : { Evens: [1, 2], Odds: [1, 2] };
	},

	/** The winner is the player with more points.
	*/
	result: function result() {
		var pointDifference = this.points.Evens - this.points.Odds;
		return this.turns > 0 ? null : {
			Evens: +pointDifference,
			Odds: -pointDifference
		};
	},

	/** The player matching the parity of the moves sum earns a point.
	*/
	next: function next(moves, haps, update) {
		raiseIf(typeof moves.Evens !== 'number' || typeof moves.Odds !== 'number',
			'Invalid moves '+ (JSON.stringify(moves) || moves) +'!');
		var parity = (moves.Evens + moves.Odds) % 2 === 0,
			points = {
				Evens: this.points.Evens + (parity ? 1 : 0),
				Odds: this.points.Odds + (parity ? 0 : 1)
			};
		if (update) {
			this.turns--;
			this.points = points;
			return this;
		} else {
			return new this.constructor(this.turns - 1, points);
		}
	},

	// ## Utility methods ##########################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'OddsAndEvens',
		serializer: function serialize_OddsAndEvens(obj) {
			return [obj.turns, obj.points];
		}
	}
}); // declare OddsAndEvens.
