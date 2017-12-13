A simple deterministic turn-based game: _TicTacToe_
===================================================

The classic game of [TicTacToe](http://en.wikipedia.org/wiki/Tic-tac-toe) is played by two players in a 3 by 3 grid, which starts empty. The first player plays as _Xs_, while the second plays as _Os_. Players take turns drawing an X or an O in any free square in the grid. The first player to align three of their letters wins, and the other loses. If the board gets full before this happens, the game is a tie.

## Implementation with Ludorum #####################################################################

The first decision to make is how to represent the game state's data. In this case a string of nine characters will be used to represent the board, each being either a `'X'`, an `'O'` or a space `' '`. The board's squares will be ordered first by column and then by row. The active player must be indicated in a separate property.

The constructor of the new `TicTacToe` will receive the active player and the board. Its prototype will inherit from `Game`. If no arguments are given, it assumes default values which define the initial game state. The active player is set by the constructor of `Game`, and is assumed to be `'X'` by default. Here we also add the simple class properties of `name` and `players`.

```javascript
var TicTacToe = ludorum.Game.make({
	constructor: function TicTacToe(activePlayer, board) {
		ludorum.Game.call(this, activePlayer || 'X');
		this.board = board || '         '; // Nine spaces.
	},
	name: 'TicTacToe',
	players: ['X', 'O']
});
```

After that we add the game ending check. First we must look for three X or O aligned. Since the board is represented with a string, regular expressions can be used to easily and quickly check for this lines. If no line is found, and the game has no empty squares, then we can say the match is drawn, and the result is `{X: 0, O: 0}`. Otherwise the game is not finished and hence it does not have a result, so we return `null`.

```javascript
TicTacToe.prototype.result = function result() {
	if (/^(XXX......|...XXX...|......XXX|X..X..X..|.X..X..X.|..X..X..X|X...X...X|..X.X.X..)$/.test(this.board)) {
		return this.victory('X');
	} else if (/^(OOO......|...OOO...|......OOO|O..O..O..|.O..O..O.|..O..O..O|O...O...O|..O.O.O..)$/.test(this.board)) {
		return this.victory('O');
	} else if (this.board.indexOf(' ') < 0) {
		return this.tied();
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
			console.log('['+ game.board +']\tmoves: '+ JSON.stringify(moves));
		});
	}
	match.events.on('end', function (game, result) {
		console.log('['+ game.board +']\tresult: '+ JSON.stringify(result));
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

Tictactoe is a deterministic game, i.e. the flow of the game is only determined by the player's actions. Not all games are like this. Some games use dice, roulettes or shuffled card decks. This _random variables_ also affect the game. How to include random variables of these sorts is explained in the next section.

[Next - A simple non deterministic turn-based game: _Pig_](tutorial-game-02.md.html)

_By [Leonardo Val](http://github.com/LeonardoVal)_.