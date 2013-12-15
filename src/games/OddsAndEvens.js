/** ludorum/src/games/OddsAndEvens.js:
	Classic child game, implemented as a simple example of a simultaneous game.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
games.OddsAndEvens = basis.declare(Game, {
	/** new games.OddsAndEvens(turns=1, points=<cero for both players>):
		Odds and evens is a very simple simultaneous game. Each turn both 
		players draw either a one or a two.
	*/
	constructor: function OddsAndEvens(turns, points) {
		Game.call(this, this.players); // Both players are active.
		this.turns = isNaN(turns) ? 1 : +turns;
		this.points = points || { Evens: 0, Odds: 0 };
	},

	/** games.OddsAndEvens.players=['Evens', 'Odds']:
		Players for odds and evens.
	*/
	players: ['Evens', 'Odds'],

	/** games.OddsAndEvens.moves():
		Moves always are 1 and 2.
	*/
	moves: function moves() {
		return this.turns < 1 ? null : { Evens: [1, 2], Odds: [1, 2] };
	},

	/** games.OddsAndEvens.result():
		The winner is the player with more points.
	*/
	result: function result() {
		var pointDifference = this.points.Evens - this.points.Odds;
		return this.turns > 0 ? null : {
			Evens: +pointDifference,
			Odds: -pointDifference
		};
	},

	/** games.OddsAndEvens.next(moves):
		The player matching the parity of the moves sum earns a point.
	*/
	next: function next(moves) {
		var parity = !((moves.Evens + moves.Odds) % 2);
		return new this.constructor(this.turns - 1, {
			Evens: this.points.Evens + (parity ? 1 : 0),
			Odds: this.points.Odds + (parity ? 0 : 1)
		});
	},
	
	args: function args() {
		return ['OddsAndEvens', this.turns, this.points];
	},
	
	toString: function toString() {
		return JSON.stringify(this.points);
	}
}); // declare OddsAndEvens.
