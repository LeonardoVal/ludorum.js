A simple non deterministic turn-based game: _Pig_
=================================================

[Pig](http://en.wikipedia.org/wiki/Pig_%28dice_game%29) is a simple dice betting game. Each turn the active player rolls a die repeatedly, until rolling a 1 or choosing to hold. Players that hold add to their score the sum of the rolls they got to make. Players that roll a 1 don't add any points. The game goes on until one player gets to 100 or some other predefined amount of points.

## Implementation with Ludorum #####################################################################

Pig is a good exemplar of a game with random variables. Because of how artificial players work, game states of stochastic games have to be split in two types: the normal game states where players can decide and make moves, and the contingent states where random variables are instantiated (i.e. given a value). The first type is represented as before, but for the second one the `Aleatory` class is used.

Lets start the game implementation with the `Pig` class to represent normal game states. The constructor receives the active player, the current scores for both players and the amount of points the active player has accumulated in previous rolls in the current turn.

```javascript
function Pig(activePlayer, scores, points) {
	ludorum.Game.call(this, activePlayer || 'One');
	this.__scores__ = scores || {One: 0, Two: 0};
	this.points = points || 0;
}

Pig.prototype = Object.create(ludorum.Game.prototype);
Pig.prototype.constructor = Pig;
(Object.setPrototypeOf || function (constructor, parent) {
    constructor.__proto__ = parent;
})(Pig, ludorum.Game);

Pig.prototype.name = 'Pig';
Pig.prototype.players = ['One', 'Two'];

Pig.prototype.scores = function scores() {
	return this.__scores__;
};
```

The ending of the game is easy to decide, by checking if any player has 100 points. The actual result is defined as the difference between the scores. So the best victory has a result of 100, and the worst defeat of -100.

```javascript
Pig.prototype.result = function result() {
	var scores = this.scores(),
		goal = this.resultBounds()[1];
	if (scores.One >= goal) {
		return this.victory('One', Math.min(100, scores.One) - scores.Two);
	} else if (scores.Two >= goal) {
		return this.victory('Two', Math.min(100, scores.Two) - scores.One);
	} else {
		return null;
	}
};

Pig.prototype.resultBounds = function resultBounds() {
	return [-100, 100];
};
```

Moves are also fairly simple, since the player must only choose between rolling again or holding. To avoid the game going on forever, each player must roll at least once. Also, if a player has passed 100 points it must hold to stop the game.

```javascript
Pig.prototype.moves = function moves() {
	var result = null,
		activePlayer = this.activePlayer(),
		goal = this.resultBounds()[1];
	if (!this.result()) {
		result = {};
		result[activePlayer] = this.points === 0 ? ['roll'] : 
			this.__scores__[activePlayer] + this.points >= goal ? ['hold'] : ['roll', 'hold'];
	}
	return result;
};
```

The most complicated part would be to calculate the next state given a game state and a move. This is not because the game logic is complex in itself, but because it involves a die, which is a random variable. Simply put, if the player decides to roll the game state's `next` method must return a `Contingent` state. By default, this instances hold references to the state and moves that originated them. They also have a set of `Aleatory` variables. The values of these random variables (called `haps`) resolve the indetermination in the flow of the game. Once determined the actual value of these haps, the `next` method is called again on the original state with the same moves and the values for the haps. The `next` method will then calculate the actual next state.

In this case, the only random variable involved is a six-sided die, which is already defined in `ludorum.aleatories.dice.D6`. If `haps` are provided, the `next` method calculates a game state; else it builds a contingent state. 

```javascript
Pig.prototype.next = function next(moves, haps) {
	var activePlayer = this.activePlayer(),
		move = moves[activePlayer];
	if (typeof move === 'undefined') { // Check if the active player is moving.
		throw new Error('No move for active player '+ activePlayer +' at '+ this +'!');
	}
	if (move === 'hold') {
		var scores = Object.assign({}, this.__scores__); // Copy scores object.
		scores[activePlayer] += this.points; // Add points to the active player's score.
		return new Pig(this.opponent(), scores, 0); // Pass the turn to the other player.
	} else if (move === 'roll') {
		var roll = (haps && haps.die)|0;
		if (!roll) { // Dice has not been rolled.
			return new ludorum.Contingent(this, moves, { die: ludorum.aleatories.dice.D6 });
		} else { // Dice has been rolled.
			return (roll > 1) ? 
				new Pig(activePlayer,  this.__scores__, this.points + roll) :
				new Pig(this.opponent(), this.__scores__, 0);
		}
	} else {
		throw new Error("Invalid moves "+ JSON.stringify(moves) +" at "+ this +"!");
	}
};
```

Again, to test our implementation of Pig we set up a match between random players. This time we use the equivalent shortcut `randomMatch` method.

```javascript
Pig.runTestMatch = function runTestMatch(showMoves) {
	var match = ludorum.Match.randomMatch(new Pig());
	if (showMoves) {
		match.events.on('move', function (game, moves) {
			console.log(JSON.stringify(game.__scores__) +' '+ game.activePlayer() +' has '+ game.points +
				', moves: '+ JSON.stringify(moves));
		});
	}
	match.events.on('end', function (game, result) {
		console.log(JSON.stringify(game.__scores__) +', result: '+ JSON.stringify(result));
	});
	return match.run();
};
```

Here we use a shortcut for setting up a match between random players, the `randomMatch` function of `Match`. Running the test (`Pig.runTestMatch(true)`) may leave something like this in the console:

```
{"One":0,"Two":0} One has 0, moves: {"One":"roll"}
{"One":0,"Two":0} One has 6, moves: {"One":"hold"}
{"One":6,"Two":0} Two has 0, moves: {"Two":"roll"}
...
{"One":94,"Two":84} One has 6, moves: {"One":"hold"}
{"One":100,"Two":84}, result: {"One":16,"Two":-16}
```

Both games treated so far have been strictly turn-based, what is usually known as _igougo_ (from _"I go, you go"_). In every turn, only one player can decide and move. Yet not all games are like this. In the next section, we will deal with games that allow more than one player to be active in a turn.

[Next - A simple deterministic simultaneous game: _Odds & Evens_](tutorial-game-03.md.html)

_By [Leonardo Val](http://github.com/LeonardoVal)_.