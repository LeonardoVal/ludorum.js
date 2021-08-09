/** # Pig.

[Pig](http://en.wikipedia.org/wiki/Pig_%28dice_game%29) is a simple dice betting game, used as an 
example of a game with random variables.
*/
games.Pig = declare(Game, {
	name: 'Pig',
	
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
	
	/** Since it involves dice, Pig is not a deterministic game. 
	*/
	isDeterministic: false,
	
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
	is roll, a die is rolled. A roll of 1 stops the this turn and the active player earns no 
	points. A roll of 2 or up, makes the turn continue.
	
	For this game mechanic, an [contingent game state](../Contingent.js.html) is used. If the move 
	is `roll`, an instance of this class is build and returned using the [dice shotcuts](
	../aleatories/dice.js.html) as random variables. This aleatoric game state will call the `next` 
	method again with the same moves and the values of the random variables, and then the match will
	continue.
	*/
	next: function next(moves, haps, update) {
		var activePlayer = this.activePlayer(),
			move = moves && moves[activePlayer];
		raiseIf(!move, 'No move for active player ', activePlayer, ' at ', this, '!');
		var nextPlayer = this.opponent(),
			nextScores = this.__scores__,
			nextRolls = [];
		if (move === 'hold' || move === 'roll') {
			if (move === 'hold') {
				nextScores = copy(nextScores);
				nextScores[activePlayer] += iterable(this.__rolls__).sum();
			} else { // if (move === 'roll') {
				var roll = (haps && haps.die)|0;
				if (!roll) { // Dice has not been rolled.
					return new Contingent(this, moves, { die: aleatories.dice.D6 }, update);
				} else if (roll > 1) { // Dice has been rolled.
					nextPlayer = activePlayer;
					nextRolls = this.__rolls__.concat(roll);
					return new this.constructor(activePlayer,  this.goal, this.__scores__, this.__rolls__.concat(roll));
				}
			}
			if (update) {
				this.activatePlayers(nextPlayer);
				this.__scores__ = nextScores;
				this.__rolls__ = nextRolls;
				return this;
			} else {
				return new this.constructor(nextPlayer, this.goal, nextScores, nextRolls);
			}
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
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Pig',
		serializer: function serialize_Pig(obj) {
			return [obj.activePlayer(), obj.goal, obj.__scores__, obj.__rolls__];
		}
	}
}); // Pig.
