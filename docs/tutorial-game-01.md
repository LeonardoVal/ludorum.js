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

In order to test our code, we add a method to set up and run a match between two `RandomPlayer`s. 

```javascript
TicTacToe.prototype.toString = function toString() {
	return '['+ this.board +']';
};

TicTacToe.runTestMatch = function runTestMatch(player1, player2) {
	player1 = player1 || new ludorum.players.RandomPlayer();
	player2 = player2 || player1;
	var match = new ludorum.Match(new TicTacToe(), [player1, player2]);
	match.events.on('move', function (game, moves) {
		console.log(game +'\tmoves: '+ JSON.stringify(moves));
	});
	match.events.on('end', function (game, result) {
		console.log(game +'\tresult: '+ JSON.stringify(result));
	});
	return match.run();
};
```

A random player is a player that chooses its moves randomly. A instance of `Match` is a controller of a game between the players. Since players may decide asynchronously, the `run()` methods returns a [promise](https://www.promisejs.org/). Yet the match also has many events that are fired at different times during the game. The events used in `runTestMatch` to log in the console are: `'move'` (whenever a move is about to be made) and `'end'` (when the game finishes).

Running `TicTacToe.runTestMatch()` should output something like this in the console:

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

## Making a simple MiniMax player for TicTacToe ####################################################

[Minimax](https://chessprogramming.wikispaces.com/Minimax) is the algorithm in which most artificial players for chess (and similar games) are based. Many variants and optimizations exist, usually including or perfecting a technique called [alpha-beta pruning](https://chessprogramming.wikispaces.com/Alpha-Beta). Ludorum includes two players based on minimax: the `MiniMaxPlayer` uses pure Minimax while the `AlphaBetaPlayer` adds standard alpha-beta pruning. Both players may be used out of the box. The performance may not be the best, although it will be better than a random player. 

```javascript
TicTacToe.runTestMatch(new ludorum.players.RandomPlayer(), new ludorum.players.AlphaBetaPlayer());
```

Minimax players explore all possible future playthroughs of the current match, a certain number of moves ahead. This number of moves is called the `horizon` of the player. The player takes into consideration all future final game states within this limitation. The further the player is allowed to explore, the better it will assess which of the available actions is best. Yet also, as the horizon is increased the number of possible game states the player has to parse increases exponentially. A big horizon can make the player take an unacceptable time to choose its move. In TicTacToe it may take a few seconds, but in more complicated games like Chess, it may take several millennia.

```javascript
TicTacToe.runTestMatch(new ludorum.players.MiniMaxPlayer({ horizon: 9 }));
```

With small horizons (e.g. 2 or 4) a Minimax player will frequently have problems evaluating possible future playthroughs. Without arriving at a final game state, the player is not able to assess the chance of winning or losing. By default, a random value is assumed. A second way of improving the artificial player's performance is to include an approximate yet efficient way of evaluating non final game states. This is called an `heuristic` evaluation function.

Heuristic functions are specific of the game being played, and the player making the evaluation. A game state that is more convenient to the _Xs_ players will probably not be convenient to the _Os_ player. Therefore, all heuristic functions take a game state and a player's role as arguments.

A rule of thumb for playing TicTacToe tells that the center is always the best square to take, followed by the corners. Playing on the for squares on the sides of the board is usually a bad idea. We will define a function based on weights that will reflect these priorities. Since the function must return a single number, this weights will be summed. If the player owns a square, the weight of this square will be added to the evaluation. If the opponent owns a square, the weight will be subtracted.

We define a function `makeWeightHeuristic` that will take an array of weights for each square in the board, and return an heuristic function that uses them as explained before. Setting these weights properly is not trivial, and the ones provided by default are not meant to be the best ones. Finding a better set of weights is left as an exercise to the reader. 

```javascript
TicTacToe.makeWeightHeuristic = function makeWeightHeuristic(weights) {
	weights = weights || [+1,-1,+1,-1,+5,-1,+1,-1,+1]; // Default weights.
	return function weightHeuristic(game, role) {
		var squares = game.board.split(''),
			result = 0,
			sum = 0;
		for (var i = 0; i < weights.length && i < squares.length; i++) {
			sum += Math.abs(weights[i]);
			if (role === squares[i]) {
				result += weights[i];
			} else if (role !== ' ') { // An opponent's square.
				result -= weights[i];
			}
		}
		return result / sum;
	};
};
```

The final result of the heuristic function is divided by the sum of all weights (disregarding sign). It is imperative when using minimax search not to confuse that heuristic evaluations of non final game states with the results of final game states. Hence, the range of values used by heuristics must always be less than the game results, in absolute value. That is, the highest heuristic value must be less than the smaller victory result for the game; and the lowest heuristic value must be greater than the highest defeat result.

To use an heuristic function, simply add it to the arguments of the minimax player's constructor. The following example shows this, and also tests the player.

```javascript
TicTacToe.runTestMatch(new ludorum.players.RandomPlayer({ horizon: 2 }), 
	new ludorum.players.AlphaBetaPlayer({ horizon: 2, heuristic: TicTacToe.makeWeightHeuristic() })
);
```

The reader may wonder why use minimax search if a simpler and more efficient heuristic function can be used instead. Ludorum includes a player that only applies an heuristic function without doing any exploration of the future possibilities. It is called `HeuristicPlayer`, and the following example show why this is a bad idea.

```javascript
TicTacToe.runTestMatch(
	new ludorum.players.HeuristicPlayer({ heuristic: TicTacToe.makeWeightHeuristic() }), 
	new ludorum.players.AlphaBetaPlayer({ horizon: 2, heuristic: TicTacToe.makeWeightHeuristic() })
);
```

The previous code may be ran many times, yet it will be difficult to get a match where the `HeuristicPlayer` beats the `AlphaBetaPlayer`. This is so even when both are using the same heuristic function, the horizon of the minimax player is very low and the heuristic player has the advantage of moving first. Although it depends on the game being played, usually considering the possible future playthroughs allows for a much better assessment of the moves to make, and hence a better performance of the artificial player.


## Final remarks ###################################################################################

We showed how to implement the classic and iconic game of TicTacToe. We also covered how to make a use minimax players included in Ludorum, and how to improve their performance by setting the player's horizon and heuristic functions. These are the most important, but not the only ways to make a minimax player play better. Other optimizations include [quiescence evaluation](https://chessprogramming.wikispaces.com/Quiescence+Search), [move ordering](https://chessprogramming.wikispaces.com/Move+Ordering) and caching techniques like [transposition tables](https://chessprogramming.wikispaces.com/Transposition+Table).

Tictactoe is a deterministic game, i.e. the flow of the game is only determined by the player's actions. Not all games are like this. Some games use dice, roulettes or shuffled card decks. This _random variables_ also affect the game. How to include random variables of these sorts is explained in the next section.

[Next - A simple non deterministic turn-based game: _Pig_](tutorial-game-02.md.html)

_By [Leonardo Val](http://github.com/LeonardoVal)_.