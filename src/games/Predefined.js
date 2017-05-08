/** # Predefined

Simple reference games with a predefined outcome, mostly for testing purposes.
*/
games.Predefined = declare(Game, {
	name: 'Predefined',
	height: 5,
	width: 5,
	
	/** `Predefined` is a pseudogame used for testing purposes. It will give `width` amount of 
	moves for each player until `height` moves pass. Then the match is finished with the given 
	`results`, or a tie as default.
	*/
	constructor: function Predefined(activePlayer, results, height, width) {
		if (results) {
			this.__results__ = results;
			this.players = Object.keys(results);
		}
		Game.call(this, activePlayer);
		if (!isNaN(height)) {
			this.height = +height;
		}
		if (!isNaN(width)) {
			this.width = +width;
		}
	},
	
	/** Default players for `Predefined`: A and B.
	*/
	players: ['A', 'B'],

	/** Default results for Predefined: a tie between A and B.
	*/
	__results__: {'A': 0, 'B': 0},

	/** Moves for a `Predefined` are numbers from 1 to this.width. 
	*/
	moves: function moves() {
		if (this.height > 0) {
			return obj(this.activePlayer(), 
				Iterable.range(1, this.width + 1).toArray()
			);
		}
	},

	/** Returned the predefined results if height is zero or less.
	*/
	result: function result() {
		return this.height > 0 ? null : this.__results__;
	},

	/** Moves are completely irrelevant. They only advance in the match.
	*/
	next: function next(moves, haps, update) {
		if (update) {
			this.height--;
			this.activatePlayers(this.opponent());
			return this;
		} else {
			return new this.constructor(this.opponent(), this.__results__, this.height - 1, this.width);
		}
	},
	
	// ## Utility methods ##########################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Predefined',
		serializer: function serialize_Predefined(obj) {
			return [obj.activePlayer(), obj.__results__, obj.height, obj.width];
		}
	}
}); // declare Predefined.
