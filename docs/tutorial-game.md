Games in Ludorum
================

This is a simple tutorial on how to implement a game in [Ludorum](https://github.com/LeonardoVal/ludorum.js), a board game framework focused not on graphics or user interfaces, but on artificial players design, implementation and testing. The example games used come already implemented in the library, though not in the same way as shown here.

## Introduction ####################################################################################

A game in Ludorum is defined by a subclass of the `Game` class. Each object represents a game state, containing all the information necessary to:

+ Decide if the game has finished or not, and if that is the case which player won or lost.

+ Decide if which player can move (if the game has not finished) and what move he or she can perform. The players which can move are called _active or enabled players_.

+ Given a move, build the next game state resulting from perfoming it in the current state.

For these functions the Game class has the following members that must be overriden:

+ `result()` returns an object with the game's result if the game is final. Otherwise it must return `null` or `undefined`. Results are always numbers: possitive means a victory, negative a defeat and zero a tied match.
	
+ `moves()` returns an object with the possible moves for each active player in the game state, if the game is not finished. Otherwise it must return `null` or `undefined`. The moves must be arrays of objects which can be properly _"stringified"_ with [JSON](http://www.json.org/js.html).
	
+ `next(moves)` returns the next game state given the moves for each active player. If these moves are invalid, an `Error` must be raised. Game states in Ludorum must be _unmodifiable_. Every time a move is performed a new object must be created. This is done to simplify AI implementation.

Other members to be included are:

+ `name` is a class property holding this game's name as a string.

+ `players` is an class property containing an array of strings, one for each player.

+ `scores()` is like a relaxed version of `result()`. The sign of the scores don't have to represent victory or defeat, and they can be calculated for unfinished game states. If the game supports this notion, it may be useful for heuristic functions used in AI players, among other things.

+ `resultBounds()` calculates an array with the minimum and maximum possible results. By default `[-1, 1]` is returned, the usual for simple games. If the game has many different victories and defeats (better and worse), these numbers must be provided to some AI algorithms.

Displaying or rendering the game state in any way is not a concern for this framework. There is some really crude support for user interfaced based in HTML and CSS, but these are meant to be used for 
little more than just testing.

## A simple deterministic turn-based game: _TicTacToe_ #############################################

The classic game of [TicTacToe](http://en.wikipedia.org/wiki/Tic-tac-toe) is played by two players in a 3 by 3 grid, which starts empty. The first player plays as _Xs_, while the second plays as _Os_. Players take turns drawing an X or an O in any free location in the grid. The first player to align three of their letters wins, hence the other loses. If the board gets full before this happens, the game is drawed.

The first decision to make is how to represent the game state's data. In this case a string of nine characters will be used to represent the board, each being either a `'X'`, an `'O'` or a space `' '`. The board's squared will be ordered first by column and then by row. The active player must be indicated in a separate property.

The constructor of the new `TicTacToe` will receive the active player and the board. Its prototype will inherit from `Game`. If no arguments are given, it assumes default values which define the initial game state. The active player is set by the constructor of `Game`, and is assumed to be `'X'` by default.

The following code examples will use the [object oriented JavaScript conventions recomended by Mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript). Internally, Ludorum uses to this effect functions provided by [creatartis-base](https://github.com/LeonardoVal/creatartis-base).

```javascript
function TicTacToe(activePlayer, board) {
	ludorum.Game.call(this, activePlayer || 'X');
	this.board = board || '         '; // Nine spaces.
}

TicTacToe.prototype = Object.create(ludorum.Game.prototype);
TicTacToe.prototype.constructor = TicTacToe;
(Object.setPrototypeOf || function (constructor, parent) {
    constructor.__proto__ = parent; // ES5 polyfill for Object.setPrototypeOf.
})(TicTacToe, ludorum.Game);
```

First we add the simple class properties of `name` and `players`.

```javascript
TicTacToe.prototype.name = 'TicTacToe';
TicTacToe.prototype.players = ['X', 'O'];
```

After that we add the game ending check. If the game has no empty squares, then we can say the match is drawn, and the result is `{X: 0, O: 0}`. Else we must look for three X or O aligned. Since the board is represented with a string, regular expressions can be used to easily and quickly check for this lines.

```javascript
TicTacToe.prototype.result = function result() {
	if (this.board.indexOf(' ') < 0) {
		return this.draw();
	} else if (/^(XXX......|...XXX...|......XXX|X..X..X..|.X..X..X.|..X..X..X|X...X...X|..X.X.X..)$/.test(this.board)) {
		return this.victory('X');
	} else if (/^(OOO......|...OOO...|......OOO|O..O..O..|.O..O..O.|..O..O..O|O...O...O|..O.O.O..)$/.test(this.board)) {
		return this.victory('O');
	} else {
		return null; // Game continues.
	}
};
```

Next is the method that calculates the moves for the active player if the game is not finished. The result is an object with only one key for the active player, with an array of square indices. Moves in this implementation are integers from 0 to 7, indicating a square in the board.

```javascript
TicTacToe.prototype.moves = function moves() {
	var result = null;
	if (!this.result()) {
		result = {};
		result[this.activePlayer()] = this.board.split('').map(function (x, i) {
			return x === ' ' ? i : -1;
		}).filter(function (i) {
			return i >= 0
		});
	}
	return result;
};
```

Last (but not least) we add the method to build new game states, based on a current state and a move performed by a player. In this case is simply adding the X or O (depending on the player) in the corresponding place in the board and changing the active player.

```javascript
TicTacToe.prototype.next = function next(moves) {
	var activePlayer = this.activePlayer(),
		move = moves[activePlayer];
	if (typeof move === 'undefined') {
		throw new Error('TicTacToe: Active player '+ activePlayer +' has no moves in '+ JSON.stringify(moves) +'!');
	}
	if (this.board.charAt(move) !== ' ') {
		throw new Error('TicTacToe: Invalid move '+ move +' for '+ activePlayer +'!');
	}
	return new TicTacToe(this.opponent(), 
		this.board.substring(0, move) + activePlayer + this.board.substring(move + 1));
};
```

In order to test our code, we add a method to set up and run a match between two `RandomPlayer`.

```javascript
TicTacToe.runTestMatch = function runTestMatch(showMoves) {
	var players = [new ludorum.players.RandomPlayer(), new ludorum.players.RandomPlayer()],
		match = new ludorum.Match(new TicTacToe(), players);
	if (showMoves) {
		match.events.on('move', function (game, moves) {
			console.log('['+ game.board +']\n\tmoves: '+ JSON.stringify(moves));
		});
	}
	match.events.on('end', function (game, result) {
		console.log('['+ game.board +']\n\tresult: '+ JSON.stringify(result));
	});
	return match.run();
};
```

A random player is a player that chooses its moves randomly. A instance of `Match` is a controller of a game between the players. Since players may decide asynchronously, the `run()` methods returns a [promise](https://www.promisejs.org/). Yet the match also has many events that are fired at different times during the game. The events used in `runTestMatch` to log in the console are: `'move'` (whenever a move is about to be made) and `'end'` (when the game finishes).

Running `TicTacToe.runTestMatch(true)` should output something like this in the console:

```
[         ] moves: {"X":7}
[       X ] moves: {"O":3}
[   O   X ] moves: {"X":2}
[  XO   X ] moves: {"O":5}
[  XO O X ] moves: {"X":6}
[  XO OXX ] moves: {"O":8}
[  XO OXXO] moves: {"X":0}
[X XO OXXO] moves: {"O":4}
[X XOOOXXO] result: {"X":-1,"O":1}
```

Tictactoe is a deterministic game, i.e. the flow of the game is only determined by the player's actions. Not all games are like so. Some games use dice, roulettes or shuffled card decks (among others) that also affect the match. Including random variables of these sorts is explained in the next section.

## A simple stochastic turn-based game: _Pig_ ######################################################

[Pig](http://en.wikipedia.org/wiki/Pig_%28dice_game%29) is a simple dice betting game. Each turn the active player rolls a die repeatedly, until rolling a 1 or choosing to hold. Players that hold add to their score the sum of the rolls made. Players that roll a 1 don't add any points. The game goes on until one player gets to 100 or some other predefined amount of points.

Pig is a good exemplar of a game with random variables. Because of how artificial players work, game states of stochastic games have to be split in two types: the normal game states where players can decide and make moves, and the aleatory states where random variables are instantiated (i.e. given a value). The first type is represented as before, but for the second one the `Aleatory` class is used.

Lets start the game implementation with the `Pig` class to represent normal game states. The constructor receives the active player, the current scores for both players and the amount of points the active player has accumulated in previous rolls of the current turn.

```javascript
function Pig(activePlayer, scores, points) {
	ludorum.Game.call(this, activePlayer || 'One');
	this._scores = scores || {One: 0, Two: 0};
	this.points = points || 0;
}

Pig.prototype = Object.create(ludorum.Game.prototype);
Pig.prototype.constructor = Pig;
(Object.setPrototypeOf || function (constructor, parent) {
    constructor.__proto__ = parent; // ES5 polyfill for Object.setPrototypeOf.
})(Pig, ludorum.Game);

Pig.prototype.name = 'Pig';
Pig.prototype.players = ['One', 'Two'];

Pig.prototype.scores = function scores() {
	return this._scores;
};
```

The ending of the game is easy to decide, by checking if any player has 100 points. The actual result is defined as the difference between the scores. So the best victory has a result of 100, and the worst defeat of -100.

```javascript
Pig.prototype.result = function result() {
	var scores = this._scores;
	if (scores.One >= 100) {
		return this.victory('One', Math.min(100, scores.One) - scores.Two);
	} else if (scores.Two >= 100) {
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
		activePlayer = this.activePlayer();
	if (!this.result()) {
		result = {};
		result[activePlayer] = this.points === 0 ? ['roll'] : 
			this._scores[activePlayer] + this.points >= 100 ? ['hold'] : ['roll', 'hold'];
	}
	return result;
};
```

The most complicated part would be to calculate the next state given a game state and a move. This is not because the game logic is complex in itself, but because it involves a die, which is a random variable. Simply put, if the player decides to roll the game state's `next` method must return a `Contingent` state. By default, this instances hold references to the state and moves that originated them. They also have a set of `Aleatory` variables. The values of these random variables (called `haps`) resolved the indetermination in the flow of the game. Once determined the actual value of these haps, the `next` method is called again on the original state with the same moves and the values for the haps. The `next` method will then calculate the actual next state.

In this case, the only random variable involved is a six-sided die, which is already defined in `ludorum.aleatories.dice.D6`. If `haps` are provided, the `next` method calculates a game state; else it builds a contingent state. 

```javascript
Pig.prototype.next = function next(moves, haps) {
	var activePlayer = this.activePlayer(),
		move = moves[activePlayer];
	if (typeof move === 'undefined') { // Check if the active player is moving.
		throw new Error('No move for active player '+ activePlayer +' at '+ this +'!');
	}
	if (move === 'hold') {
		var scores = JSON.parse(JSON.stringify(this._scores)); // Copy scores object.
		scores[activePlayer] += this.points; // Add points to the active player's score.
		return new Pig(this.opponent(), scores, 0); // Pass the turn to the other player.
	} else if (move === 'roll') {
		var roll = (haps && haps.die)|0;
		if (!roll) { // Dice has not been rolled.
			return new Contingent({ die: ludorum.aleatories.dice.D6 }, this, moves);
		} else { // Dice has been rolled.
			return (roll > 1) ? 
				new this.constructor(activePlayer,  this.goal, this.__scores__, this.__rolls__.concat(roll)) :
				new this.constructor(this.opponent(), this.goal, this.__scores__, []);
		}
	} else {
		throw new Error("Invalid moves "+ JSON.stringify(moves) +" at "+ this +"!");
	}
};
```

Again, to test our implementation of Pig we set up a match between random players.

```javascript
Pig.runTestMatch = function runTestMatch(showMoves) {
	var players = [new ludorum.players.RandomPlayer(), new ludorum.players.RandomPlayer()],
		match = new ludorum.Match(new Pig(), players);
	if (showMoves) {
		match.events.on('move', function (game, moves) {
			console.log(JSON.stringify(game._scores) +' '+ game.activePlayer() +' has '+ game.points +
				'\n\tmoves: '+ JSON.stringify(moves));
		});
	}
	match.events.on('end', function (game, result) {
		console.log(JSON.stringify(game._scores) +'\n\tresult: '+ JSON.stringify(result));
	});
	return match.run();
};
```

Running the test may leave something like this in the console:

```
{"One":0,"Two":0} One has 0, moves: {"One":"roll"}
{"One":0,"Two":0} One has 6, moves: {"One":"hold"}
{"One":6,"Two":0} Two has 0, moves: {"Two":"roll"}
...
{"One":94,"Two":84} One has 6, moves: {"One":"hold"}
{"One":100,"Two":84}, result: {"One":16,"Two":-16}
```

Both games treated so far have been strictly turn-based, what is usually known as _igougo_ (from _"I go, you go"_). In every turn, only one player can decide and move. Yet not all games are like this. In the next section, we will deal with games that allow more than one player to be active in a turn.

## A simple deterministic simultaneous game: _Odds & Evens_ ########################################

[Odds and evens](http://en.wikipedia.org/wiki/Odds_and_evens) is a classic child game. Each turn each of the two players will chose at the same time either to play a 1 or a 2. If the sum of both numbers is even, the Evens player earns a point. Otherwise the Odds players earns a point. The game is played until one of the players reaches a certain amount of points, winning the game. This is a simple example of a simultaneous game, i.e. a game in which more than one player can move at any given turn. Another simple example is [Rock-Paper-Scissors](https://en.wikipedia.org/wiki/Rock-Paper-Scissors), and a much more complicated example would be [Diplomacy](http://en.wikipedia.org/wiki/Diplomacy_%28game%29).

A game state of Odds & Evens is very simple, since it must include the current scores. Both players are active every turn.

```javascript
function OddsAndEvens(scores) {
	ludorum.Game.call(this, this.players);
	this._scores = scores || {Odds: 0, Evens: 0};
}

OddsAndEvens.prototype = Object.create(ludorum.Game.prototype);
OddsAndEvens.prototype.constructor = OddsAndEvens;
(Object.setPrototypeOf || function (constructor, parent) {
    constructor.__proto__ = parent; // ES5 polyfill for Object.setPrototypeOf.
})(OddsAndEvens, ludorum.Game);

OddsAndEvens.prototype.name = 'Odds&Evens';
OddsAndEvens.prototype.players = ['Odds', 'Evens'];

OddsAndEvens.prototype.scores = function scores() {
	return this._scores;
};
```

Game ends when the points goal is reached by either player. Here we use a goal of 10 points. The match result is the difference of points.

```javascript
OddsAndEvens.prototype.result = function result() {
	var scores = this._scores;
	if (scores.Odds >= 10) {
		return this.victory('Odds', Math.min(10, scores.Odds) - scores.Evens);
	} else if (scores.Evens >= 10) {
		return this.victory('Evens', Math.min(10, scores.Evens) - scores.Odds);
	} else {
		return null;
	}
};

OddsAndEvens.prototype.resultBounds = function resultBounds() {
	return [-10, 10];
};
```

At every turn, both players can play either 1 or 2. The next game state simply adds one point to the proper player considering the parity of the sum of the moves.

```javascript
OddsAndEvens.prototype.moves = function moves() {
	if (this.result()) {
		return null;
	} else {
		return {Odds: [1, 2], Evens: [1, 2]};
	}
};

OddsAndEvens.prototype.next = function next(moves) {
	if (typeof moves.Odds !== 'number' || typeof moves.Evens !== 'number') { // Check both players played a number.
		throw new Error('Invalid moves ('+ JSON.stringify(moves) +') at '+ this +'!');
	}
	var newScores = JSON.parse(JSON.stringify(this._scores));
	if ((moves.Odds + moves.Evens) % 2 == 1) {
		newScores.Odds++;
	} else {
		newScores.Evens++;
	}
	return new OddsAndEvens(newScores);
};
```

As we did in all cases before, to test our implementation of OddsAndEvens we make matches between random players.

```javascript
OddsAndEvens.runTestMatch = function runTestMatch(showMoves) {
	var players = [new ludorum.players.RandomPlayer(), new ludorum.players.RandomPlayer()],
		match = new ludorum.Match(new OddsAndEvens(), players);
	if (showMoves) {
		match.events.on('move', function (game, moves) {
			console.log(JSON.stringify(game._scores) +'\n\tmoves: '+ JSON.stringify(moves));
		});
	}
	match.events.on('end', function (game, result) {
		console.log(JSON.stringify(game._scores) +'\n\tresult: '+ JSON.stringify(result));
	});
	return match.run();
};
```

The test's output in the console may look as follows:

```
{"Odds":0,"Evens":0} moves: {"Odds":1,"Evens":1}
{"Odds":0,"Evens":1} moves: {"Odds":2,"Evens":2}
...
{"Odds":9,"Evens":9} moves: {"Odds":2,"Evens":2}
{"Odds":9,"Evens":10} result: {"Odds":-1,"Evens":1}
```

Making a stochastic simultaneous game implies the combination of the two schemes. Aleatory variables don't collide with more than one active player per turn.

_By [Leonardo Val](http://github.com/LeonardoVal)_.