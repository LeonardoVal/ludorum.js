/** ludorum/src/games/Pig.js:
	Simple dice game, an example of a game with random variables. See
	<http://en.wikipedia.org/wiki/Pig_%28dice_game%29>.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
games.Pig = basis.declare(Game, {
	/** new games.Pig(activePlayer='One', scores, rolls):
		Pig is a dice betting game, where the active player rolls dice until it
		rolls one or passes its turn scoring the sum of previous rolls.
	*/
	constructor: function Pig(activePlayer, scores, rolls) {
		Game.call(this, activePlayer);
		this.__scores__ = scores || basis.iterable(this.players).zip([0, 0]).toObject();
		this.rolls = rolls || [];
	},

	/** games.Pig.goal=100:
		Amount of points a player has to reach to win the game.
	*/
	goal: 100,
	
	/** games.Pig.players=['One', 'Two']:
		Players for Pig.
	*/
	players: ['One', 'Two'],

	/** games.Pig.moves():
		The active player can either hold and pass the turn, or roll.
	*/
	moves: function moves() {
		if (!this.result()) {
			return basis.obj(this.activePlayer(), ['roll', 'hold']);
		}
	},

	/** games.Pig.result():
		Game finishes when one player reaches or passes the goal score. The 
		result for each player is the difference between its score and its
		opponent's score.
	*/
	result: function result() {
		if (this.__scores__[this.players[0]] >= this.goal || this.__scores__[this.players[1]] >= this.goal) {
			var r = {};
			r[this.players[0]] = this.__scores__[this.players[0]] - this.__scores__[this.players[1]];
			r[this.players[1]] = -r[this.players[0]];
			return r;
		}
	},

	/** games.Pig.next(moves):
		The player matching the parity of the moves sum earns a point.
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(),
			move = moves[activePlayer];
		if (move === 'hold') {
			var scores = basis.copy(this.__scores__);
			scores[activePlayer] += basis.iterable(this.rolls).sum();
			return new this.constructor(this.opponent(), scores, []);
		} else if (move === 'roll') {
			var game = this;
			return new aleatories.Dice(6, function (value) {
				return (value > 1) 
					? new game.constructor(activePlayer, game.__scores__, game.rolls.concat(value))
					: new game.constructor(game.opponent(), game.__scores__, []);
			});
		} else {
			throw new Error("Invalid moves: "+ JSON.stringify(moves));
		}
	},
	
	args: function args() {
		return ['Pig', this.activePlayer(), this.__scores__, this.rolls];
	}
}); // declare Pig.
