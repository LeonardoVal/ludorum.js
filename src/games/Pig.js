/* Pig is a simple dice game, used here as an example of a game with random 
	variables.
*/
games.Pig = declare(Game, {
	/** new games.Pig(activePlayer='One', goal=100, scores, rolls):
		[Pig](http://en.wikipedia.org/wiki/Pig_%28dice_game%29) is a dice 
		betting game, where the active player rolls dice until it rolls one or 
		passes its turn scoring the sum of previous rolls.
	*/
	constructor: function Pig(activePlayer, goal, scores, rolls) {
		Game.call(this, activePlayer);
		/** games.Pig.goal=100:
			Amount of points a player has to reach to win the game.
		*/
		this.goal = isNaN(goal) ? 100 : +goal;
		/** games.Pig.__scores__:
			Current players' scores.
		*/
		this.__scores__ = scores || iterable(this.players).zip([0, 0]).toObject();
		/** games.Pig.__rolls__:
			Active player's rolls.
		*/
		this.__rolls__ = rolls || [];
	},
	
	name: 'Pig',
	
	/** games.Pig.players=['One', 'Two']:
		Players for Pig.
	*/
	players: ['One', 'Two'],

	/** games.Pig.moves():
		The active player can either hold and pass the turn, or roll.
	*/
	moves: function moves() {
		if (!this.result()) {
			var activePlayer = this.activePlayer(),
				currentScore = this.__scores__[activePlayer] + iterable(this.__rolls__).sum();
			return obj(activePlayer, currentScore < this.goal ? ['roll', 'hold'] : ['hold']);
		}
	},

	/** games.Pig.result():
		Game finishes when one player reaches or passes the goal score. The 
		result for each player is the difference between its score and its
		opponent's score.
	*/
	result: function result() {
		var score0 = this.__scores__[this.players[0]],
			score1 = this.__scores__[this.players[1]];
		if (score0 >= this.goal || score1 >= this.goal) {
			var r = {};
			r[this.players[0]] = score0 - score1;
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
			var scores = copy(this.__scores__);
			scores[activePlayer] += iterable(this.__rolls__).sum();
			return new this.constructor(this.opponent(), this.goal, scores, []);
		} else if (move === 'roll') {
			var game = this;
			return new aleatories.Dice(function (value) {
				return (value > 1) 
					? new game.constructor(activePlayer,  game.goal, game.__scores__, game.__rolls__.concat(value))
					: new game.constructor(game.opponent(), game.goal, game.__scores__, []);
			});
		} else {
			throw new Error("Invalid moves: "+ JSON.stringify(moves));
		}
	},
	
	args: function args() {
		return [this.name, this.activePlayer(), this.goal, this.__scores__, this.__rolls__];
	}
}); // declare Pig.
