/** Simple reference games with a predefined outcome, mostly for testing 
	purposes.
*/
games.__Predefined__ = declare(Game, {
	/** new games.__Predefined__(activePlayer, results, height=5, width=5):
		A pseudogame used for testing purposes. It will give width amount of 
		moves for each player until height moves pass. Then the match is 
		finished with the given results, or a tie as default.
	*/
	constructor: function __Predefined__(activePlayer, results, height, width) {
		if (results) {
			this.__results__ = results;
			this.players = Object.keys(results);
		}
		Game.call(this, activePlayer);
		this.height = isNaN(height) ? 5 : +height;
		this.width = isNaN(width) ? 5 : +width;
	},

	name: '__Predefined__',
	
	/** games.__Predefined__.players:
		Default players for __Predefined__: A and B.
	*/
	players: ['A', 'B'],

	/** games.__Predefined__.__results__:
		Default results for __Predefined__: a tie between A and B.
	*/
	__results__: {'A': 0, 'B': 0},

	/** games.__Predefined__.moves():
		Moves for a __Predefined__ are numbers from 1 to this.width. 
	*/
	moves: function moves() {
		if (this.height > 0) {
			return obj(this.activePlayer(), 
				Iterable.range(1, this.width + 1).toArray()
			);
		}
	},

	/** games.__Predefined__.result():
		Returned the predefined results if height is zero or less.
	*/
	result: function result() {
		return this.height > 0 ? null : this.__results__;
	},

	/** games.__Predefined__.next(moves):
		Moves are completely irrelevant. They only advance in the match.
	*/
	next: function next() {
		return new this.constructor(this.opponent(), this.__results__, this.height - 1, this.width);
	},
	
	args: function args() {
		return [this.name, this.activePlayer(), this.results, this.height, this.width];
	},
	
	toString: function toString() {
		return '__Predefined__('+ [this.activePlayer(), this.__results__,
			this.height, this.width].map(JSON.stringify).join(', ') +')';
	}
}); // declare __Predefined__.
