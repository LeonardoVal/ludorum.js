Games in Ludorum
================

This is a simple tutorial on how to implement a game in [Ludorum](https://github.com/LeonardoVal/ludorum.js), a board game framework focused not on graphics or user interfaces, but on artificial players design, implementation and testing. The example games used in this tutorial come already implemented in the library, although maybe not in the same way as shown here.

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

First, we declare the constructor function. The following code examples will use the [object oriented JavaScript conventions recomended by Mozilla, used with ECMAScript 5](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript). Internally, Ludorum uses to this effect functions provided by [creatartis-base](https://github.com/LeonardoVal/creatartis-base).


```javascript
function Choose2Win(activePlayer, winner) {
	ludorum.Game.call(this, activePlayer || this.players[0]);
	this.winner = winner || null;
}
Choose2Win.prototype = Object.create(ludorum.Game.prototype);
Choose2Win.prototype.constructor = Choose2Win;
(Object.setPrototypeOf || function (constructor, parent) {
    constructor.__proto__ = parent; // ES5 polyfill for Object.setPrototypeOf.
})(TicTacToe, ludorum.Game);
```

The game state only contains two data: which is the active player and which player won the game if the game is finished. The `winner` property is `null` if the game has not ended. The constructor by default builds a state for an unfinished game where the first player is active. It is conventional in Ludorum that game constructors must produce the initial game state when called with no arguments.

Next we add two class properties to the constructor's prototype: the `name` of the game and an array of `players`.

```javascript
Choose2Win.prototype.name = 'Choose2Win';
Choose2Win.prototype.players = ['This', 'That'];
```

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
		return ['win', 'pass'];
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

What we've seen is all the code necessary to implement this really simple game in Ludorum. The library bundles a similar (and slightly more complicated) version of this game. Of course, it is used only for testing purposes.

[Next - A simple deterministic turn-based game: _TicTacToe_](tutorial-game-01.md.html)

_By [Leonardo Val](http://github.com/LeonardoVal)_.