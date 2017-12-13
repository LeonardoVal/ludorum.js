Games in Ludorum
================

This is a simple tutorial on how to implement a game in [Ludorum](https://github.com/LeonardoVal/ludorum.js). Ludorum is a board game framework focused on artificial players design, implementation and testing, rather than graphics or user interfaces. The example games used here are available in the library, although they may be simplified for this tutorial.

## Introduction ####################################################################################

A game in Ludorum is defined by a subclass of the `Game` class. Each object represents a game state, containing all the information necessary to:

+ Decide if the game has finished or not, and if that is the case which player won and which player lost.

+ Decide which player (or players) can move if the game has not finished. Players that can move are called  _active players_.

+ List which moves can the active player (or players) perform.

+ Given a move, calculate the next game state resulting from perfoming this action in the current game state.

For these functions the `Game` class has the following members that must be defined:

+ `result()` returns an object with the game's result if the game is final. Otherwise it must return `null` or `undefined`. Results are always numbers: positive means a victory, negative a defeat and zero a tied match.
	
+ `moves()` returns an object with the possible moves for each active player in the game state. If the game is finished, it must return `null` or `undefined`. Moves must be represented by values which can be properly _"stringified"_ with [JSON](http://www.json.org/js.html). E.g. numbers, strings or arrays of numbers and strings.
	
+ `next(moves)` returns the next game state given the moves for each active player. If these moves are not valid, an `Error` must be raised. In Ludorum we recommend to make game states _unmodifiable_. I.e. every time a move is performed a new object must be created. This is done to simplify AI implementation and debugging.

Other members to be included are:

+ `name` is a class property holding this game's name as a string.

+ `players` is an class property containing an array of strings, one for each player.

+ `scores()` is a relaxed version of `result()`. The sign of the scores don't have to represent victory or defeat, and they can be calculated for unfinished game states. If the game supports this notion, it may be useful for heuristic functions used in AI players, among other things.

+ `resultBounds()` calculates an array with the minimum and maximum possible results. Bounds are `[-1, 1]` by default, which is the usual for simple games. If the game has many different victories and defeats (better and worse), these numbers must be provided to some AI algorithms.

Displaying or rendering the game state in any way is not a concern for this framework. There is some support for user interfaced based in HTML and CSS, but these are meant to be used for little more than just testing.

## Implementing a game #############################################################################

The first example game we will implement with Ludorum is probably the simplest game possible. We called it _Choose2Win_, because in their turn each of two player (called _This_ and _That_) must choose between winning the game or passing the turn to the other player.

The following code examples will use the [object oriented JavaScript conventions recomended by Mozilla, used with ECMAScript 5](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript). Internally, Ludorum uses to this effect functions provided by [creatartis-base](https://github.com/LeonardoVal/creatartis-base).

First, we declare the constructor function, and set it as a subclass of `ludorum.Game` using its `make` method. Two class properties are also added to the constructor's prototype: the `name` of the game and an array of `players`.

```javascript
var Choose2Win = ludorum.Game.make({
	name: 'Choose2Win',
	players: ['This', 'That'],

	constructor: function Choose2Win(activePlayer, winner) {
		ludorum.Game.call(this, activePlayer || this.players[0]);
		this.winner = winner || null;
	}
});
```

The game state only contains two data: which is the active player and which player won the game if the game is finished. The `winner` property is `null` if the game has not ended. The constructor by default builds a state for an unfinished game where the first player is active. It is conventional in Ludorum that game constructors must produce the initial game state when called with no arguments.

Deciding the `result` of the game is really easy. Check if there is a winner, and if so return a result of +1 for the winner and -1 for the loser. The `victory` method (inherited from `ludorum.Game`) builds a proper result given the victor.

```javascript
Choose2Win.prototype.result = function result() {
	if (this.winner) {
		return this.victory(this.winner);
	} else {
		return null;
	}
};
```

If the game has not a result, then the active player must be able to move. The `moves` method calculates the actions available for the active player. In this extremely simple case, these actions are always the same: _win_ or _pass_.

```javascript
Choose2Win.prototype.moves = function moves() {
	if (!this.result()) {
		var result = {};
		result[this.activePlayer()] = ['win', 'pass'];
		return result;
	} else {
		return null;
	}
};
```

Now that the active player has moves, the game state must be able to apply one of those actions to make the next game state in the match. This is done by the `next` method, which takes the `moves` object as argument.  This argument is not the same as the result of the `moves` method. It has one property per active player, with a move to execute. In this case it may be `{ This: 'win' }` or `{ That: 'pass' }`. It may seem overcomplicated, but it is done like so to allow for games with more than one active player per turn.

```javascript
Choose2Win.prototype.next = function next(moves) {
	var activePlayer = this.activePlayer(),
		winner = moves[activePlayer] === 'win' ? activePlayer : null;
	return new Choose2Win(this.opponent(), winner);
};
```

Our implementation for `next` always returns a new game state. The code shows to methods inherited from `ludorum.Game`. The `activePlayer` method returns the active player for the current game state. The `opponent` method returns the opponent for the given player, or for the active player by default.

```javascript
Choose2Win.prototype.toString = function toString() {
	return 'Choose2Win('+ JSON.stringify(this.activePlayer()) +','+ JSON.stringify(this.winner) +')';
};
```

The `toString` method is used to get a string representation of any object. This is useful for debugging purposes.

# Implementing a player ############################################################################

In Ludorum the agents that play a game are called _players_. All the different types of players extend the base class `Player`. Here we declare a player for `Choose2Win`:

```javascript
var Choose2WinPlayer = ludorum.Player.make({
	constructor: function Choose2WinPlayer(params) {
		ludorum.Player.call(this, params);
	}
});
```

The minimal implementation of a player overrides the `decision` method. Given a game instance and a role in the game, the player must decide which action (move) to take. Making a good player for `Choose2Win` is simple: just choose to win. Still, it is good to check the arguments.

```javascript
Choose2WinPlayer.prototype.decision = function decision(game, player) {
	var moves = game.moves();
	if (!moves || !moves[player] || (moves[player]+'').indexOf('win') < 0) {
		throw new Error('Cannot choose to win in game '+ game +'!');
	} else {
		return 'win';
	}
};
```

Players playing a game make a match. A `Match` instance is created with a `Game` instance and an array with the `Player` that will be playing the game. This object will control the game's flow, asking the active player to choose a move at each turn, until the game is over. Callbacks can be registered to be called on match events like: match's beginning or end, when a player takes an action, when the game advances by executing a player's action.

Here we define a method `runTestMatch` that sets up a match to test the `Choose2Win` implementation. The match's events are used to log the match progress in the Javascript console. If no players are given, by default the first player is a `RandomPlayer` and the second player is a `Choose2WinPlayer`. A `RandomPlayer` is a player that chooses its moves completely at random. Hence, the match should not go further than two turns.

```javascript
Choose2Win.runTestMatch = function runTestMatch(players) {
	players = players || [new ludorum.players.RandomPlayer(), new Choose2WinPlayer()];
	var match = new ludorum.Match(new Choose2Win(), players);
	match.events.on('move', function (game, moves) {
		console.log(game +'\tmoves: '+ JSON.stringify(moves));
	});
	match.events.on('end', function (game, result) {
		console.log(game +'\tresult: '+ JSON.stringify(result));
	});
	return match.run();
};
```

Running `Choose2Win.runTestMatch()` should output something like this in the console:

```
Choose2Win("This",null)	moves: {"This":"pass"}
Choose2Win("That",null)	moves: {"That":"win"}
Choose2Win("This","That")	result: {"This":-1,"That":1}
```

What we've seen is all the code necessary to implement a really simple game and a really simple player in Ludorum. The library bundles a similar (and slightly more complicated) version of this game. Of course, it is used only for testing purposes. The next example is real yet still simple game: _TicTacToe_.

[Next - A simple deterministic turn-based game: _TicTacToe_](tutorial-game-01.md.html)

_By [Leonardo Val](http://github.com/LeonardoVal)_.