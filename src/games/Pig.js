/** # Pig.

[Pig](http://en.wikipedia.org/wiki/Pig_%28dice_game%29) is a simple dice betting game, used as an 
example of a game with random variables.
*/
games.Pig = declare(Game, {
	/** The constructor takes:
	
		+ `activePlayer='One'`: The active player.
		+ `goal=100`: The amount of points a player has to reach to win the game.
		+ `scores`: The scores so far in the match.
		+ `rolls`: The rolls the active player has made in his turn.
	*/
	constructor: function Pig(activePlayer, goal, scores, rolls) {
		Game.call(this, activePlayer);
		this.goal = isNaN(goal) ? 100 : +goal;
		this.__scores__ = scores || iterable(this.players).zip([0, 0]).toObject();
		this.__rolls__ = rolls || [];
	},
	
	name: 'Pig',
	
	/** Players for Pig are named `One`, `Two`.
	*/
	players: ['One', 'Two'],

	/** The active player can either hold and pass the turn, or roll.
	*/
	moves: function moves() {
		if (!this.result()) {
			var activePlayer = this.activePlayer(),
				currentScore = this.__scores__[activePlayer] + iterable(this.__rolls__).sum();
			return obj(activePlayer, this.__rolls__.length < 1 ? ['roll'] :
				currentScore >= this.goal ? ['hold'] : ['roll', 'hold']);
		}
	},

	/** A Pig match finishes when one player reaches or passes the goal score. The result for each 
	player is the difference between its score and its opponent's score.
	*/
	result: function result() {
		var score0 = this.__scores__[this.players[0]],
			score1 = this.__scores__[this.players[1]];
		if (score0 >= this.goal || score1 >= this.goal) {
			var r = {};
			r[this.players[0]] = Math.min(this.goal, score0) - Math.min(this.goal, score1);
			r[this.players[1]] = -r[this.players[0]];
			return r;
		}
	},

	/** If the active player holds, it earns the sum of the rolls made so in its turn. If the move 
	is roll, a dice is rolled. A roll of 1 stops the this turn and the active player earns no 
	points. A roll of 2 or up, makes the turn continue.
	
	For this game mechanic, an [aleatory](../Aleatory.js.html) is used. If the move is `roll`, an 
	instance of this class is build and returned using the [dice shotcuts](../aleatories/dice.js.html). 
	The function passed to aleatory makes the decision explained before, based on the value of the 
	dice.
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(),
			move = moves[activePlayer];
		raiseIf(typeof move === 'undefined', 'No move for active player ', activePlayer, ' at ', this, '!');
		if (move === 'hold') {
			var scores = copy(this.__scores__);
			scores[activePlayer] += iterable(this.__rolls__).sum();
			return new this.constructor(this.opponent(), this.goal, scores, []);
		} else if (move === 'roll') {
			var game = this;
			return new aleatories.dice.D6(function (value) {
				value = isNaN(value) ? this.value() : +value;
				return (value > 1) ? 
					new game.constructor(activePlayer,  game.goal, game.__scores__, game.__rolls__.concat(value)) :
					new game.constructor(game.opponent(), game.goal, game.__scores__, []);
			});
		} else {
			raise("Invalid moves ", JSON.stringify(moves), " at ", this, "!");
		}
	},
	
	// ## Utility methods ##########################################################################

	/** The `resultBounds` for a Pig game are estimated with the goals.
	*/
	resultBounds: function resultBounds() {
		return [-this.goal, +this.goal];
	},
	
	/** Serialization is used in the `toString()` method, but it is also vital 
	for sending the game state across a network or the marshalling between the 
	rendering thread and a webworker.
	*/	
	__serialize__: function __serialize__() {
		return [this.name, this.activePlayer(), this.goal, this.__scores__, this.__rolls__];
	}
}); // Pig.
