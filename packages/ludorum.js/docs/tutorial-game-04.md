A simple singleplayer game: _15 Puzzle_
=======================================

The [15 puzzle](https://en.wikipedia.org/wiki/15_puzzle) is a simple puzzle based on a picture split into 15 square tiles. This tiles are placed in a square frame, four times the size of the image tiles on both sides. Hence 16 tiles would fit in the frame. Since there are 15 tiles, one space remains empty. Tiles start in a random layout. The player must rearrange the tiles so that the image is formed. This is done by sliding the tiles using the empty space.

## Implementation with Ludorum #####################################################################

This puzzle is a simple example of a game played by just one player, i.e. a singleplayer game. For our implementation we will use letters for the tiles, instead of pieces of an image. The empty space will be represented by the space character.

```javascript
var Puzzle15 = ludorum.Game.make({
	name: '15Puzzle',
	players: ['Player'],
	maxPoints: 80,

	constructor: function Puzzle15(tiles, points) {
		ludorum.Game.call(this, this.players[0]);
		this.tiles = tiles || 'MCFDJAOL EKBNGIH';
		this.points = isNaN(points) ? this.maxMoves : +points;
	}
});
```

The player must arrange the letters in alphabetical order (by rows) making 80 moves or less. Otherwise the player loses the game.

```javascript
Puzzle15.prototype.scores = function scores() {
	return { Player: this.points };
};

Puzzle15.prototype.result = function result() {
	if (this.tiles.split('').sort().join('') === this.tiles) { // Tiles are in order.
		return this.victory(this.players[0]);
	} else if (this.points < 1) {
		return this.defeat(this.players[0]);
	} else {
		return null;
	}
};
```

In order to enumerate the player's actions it is convenient to think that the empty space is being moved, rather than the tiles adjacent to it. In our implementation, moves are represented by the index in the `tiles` string with which the empty space has to be swapped.

```javascript
Puzzle15.prototype.moves = function moves() {
	if (this.result()) {
		return null;
	} else {
		var positionEmpty = this.tiles.indexOf(' '),
			rowEmpty = Math.floor(positionEmpty / 4),
			columnEmpty = positionEmpty % 4;
			ms = [];
		if (rowEmpty > 0) {
			ms.push(positionEmpty - 4);
		}
		if (rowEmpty < 3) {
			ms.push(positionEmpty + 4);
		}
		if (columnEmpty > 0) {
			ms.push(positionEmpty - 1);
		}
		if (columnEmpty < 3) {
			ms.push(positionEmpty + 1);
		}
		return { Player: ms }
	}
};
```

The signature used for the `next` method is different from the previous ones. The `haps` argument is used in games that use random variables. Since this is not the case with `Puzzle15` we can ignore it. The `update` argument is used to force the `next` method to change the current game state, instead of creating a new one. Using updated game states must be done very carefully. Some artificial intelligence algorithms can use it as an optimization, to spend less memory.

```javascript
Puzzle15.prototype.next = function next(moves, haps, update) {
	var swapTo = moves.Player,
		newTiles = this.tiles.split(''),
		swapFrom = this.tiles.indexOf(' '),
		validMoves = this.moves().Player;
	if (validMoves.indexOf(swapTo) < 0) {
		throw new Error("Invalid move "+ swapTo +"!");
	} else {
		newTiles[swapFrom] = newTiles[swapTo];
		newTiles[swapTo] = ' ';
		if (update) {
			this.tiles = newTiles.join('');
			this.points--;
			return this;
		} else {
			return new Puzzle15(newTiles.join(''), this.points - 1);
		}
	}
};
```

Again, we use random players to test our implementation.

```javascript
Puzzle15.prototype.toString = function toString() {
	return '['+ this.tiles +'] ('+ this.points +' remaining)';
}; 

Puzzle15.runTestMatch = function runTestMatch(args) {
	args = args || {};
	var game = args.game || new Puzzle15(args.tiles, args.points),
		player = args.player || new ludorum.players.RandomPlayer(),
		match = new ludorum.Match(game, [player]);
	if (!args.hideMoves) {
		match.events.on('move', function (game, moves) {
			console.log("Move "+ moves.Player +": "+ game +".");
		});
	}
	match.events.on('end', function (game, result) {
		console.log("Finished "+ game +", with "+ result.Player +".");
	});
	return match.run();
};
```

Running `Puzzle15.runTestMatch()` shows that a random player has very little hope of solving this puzzle in a reasonable number of moves.

# Players based on heuristic search ################################################################

```javascript
Puzzle15.heuristics = {
	distanceHeuristic: function distanceHeuristic(game) {
		var tiles = game.tiles,
			target = tiles.split('').sort(),
			r = 0;
		for (var i = 0; i < target.length; i++) {
			r += Math.abs(tiles.indexOf(target[i]) - i);
		}
		return r;
	}
};

Puzzle15.players = {
	bestFirstPlayer: function bestFirstPlayer(heuristic) {
		heuristic = heuristic || Puzzle15.distanceHeuristic;
		return new ludorum.players.HeuristicPlayer({ heuristic: heuristic });
	}
};
```

`Puzzle15.runTestMatch({ player: Puzzle15.players.bestFirstPlayer(), points: 10 })`

```javascript
var Puzzle15Player = Puzzle15.players.searchAStarPlayer = ludorum.Player.make({
	constructor: function searchAStarPlayer(params) {
		params = params || {};
		ludorum.Player.call(this, params);
		this.heuristic = params.heuristic || Puzzle15.heuristics.distanceHeuristic;
		this.depth = params.depth || 30;
		this.__path__ = [];
		this.__visited__ = {};
	}
});

Puzzle15Player.prototype.__expandNode__ = function __expandNode__(node) {
	var player = this,
		role = node.game.players[0];
	if (node.game.result) {
		return [];
	} else {
		return this.movesFor(node.game, role).map(function (move) {
			var next = node.game.perform(move),
				result = next.result();
			return {
				game: next,
				cost: node.cost + 1,
				h: player.heuristic(next),
				path: node.path.concat([move]),
				result: result ? result[role] : 0
			};
		});
	}
};

Puzzle15Player.prototype.decision = function decision(start, role) {
	if (this.__path__.length < 1) {
		var pending = [{ game: start, cost: 0, path: [], result: 0 }],
			currentNode;
		while (pending.length > 0) {
			currentNode = pending.shift();
			if (currentNode.cost > this.depth || currentNode.game.result > 0) {
				break;
			} else if (currentNode.game.result < 0) {
				continue;
			}
			pending = pending.concat(this.__expandNode__(currentNode))
				.sort(function (n1, n2) {
					return (n1.cost + n1.h) - (n2.cost + n2.h);
				});
		}
		this.__path__ = currentNode.path;
	}
	if (this.__path__.length < 1) {
		throw new Error("A star search had no ");
	}
	return this.__path__.shift();
};
```

`Puzzle15.runTestMatch({ player: new Puzzle15Player() })`

_By [Leonardo Val](http://github.com/LeonardoVal)_.