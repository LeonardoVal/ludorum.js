A singleplayer game: _15 Puzzle_
================================

The [15 puzzle](https://en.wikipedia.org/wiki/15_puzzle) is a simple puzzle based on a picture split into 15 square tiles. This tiles are placed in a square frame, four times the size of the image tiles on both sides. Hence 16 tiles would fit in the frame. Since there are 15 tiles, one space remains empty. Tiles start in a random layout. The player must rearrange the tiles so that the image is formed. This is done by sliding the tiles using the empty space.

## Implementation with Ludorum #####################################################################

This puzzle is a simple example of a game played by just one player, i.e. a singleplayer game. For our implementation we will use letters for the tiles, instead of pieces of an image. The empty space will be represented by the space character.

```javascript
function Puzzle15(tiles, points) {
	ludorum.Game.call(this, this.players[0]);
	this.tiles = tiles || 'MCFDJAOLEKBNGIH ';
	this.points = isNaN(points) ? 80 : +points;
}

Puzzle15.prototype = Object.create(ludorum.Game.prototype);
Puzzle15.prototype.constructor = Puzzle15;
(Object.setPrototypeOf || function (constructor, parent) {
    constructor.__proto__ = parent;
})(Puzzle15, ludorum.Game);

Puzzle15.prototype.name = '15Puzzle';
Puzzle15.prototype.players = ['Player'];
```

The player must arrange the letters in alphabetical order (by rows) making 80 moves or less. Otherwise the player loses the game.

```javascript
Puzzle15.prototype.scores = function scores() {
	return { Player: 80 - this.points };
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
Puzzle15.runTestMatch = function runTestMatch(showMoves) {
	var match = ludorum.players.RandomPlayer.playTo(new Puzzle15());
	if (showMoves) {
		match.events.on('move', function (game, moves) {
			console.log(game.tiles +"\tmoved to "+ moves.Player +", "+ game.points 
				+" points remaining.");
		});
	}
	match.events.on('end', function (game, result) {
		console.log("Puzzle15 finished with "+ game.tiles +"\t, result = "+ result.Player +".");
	});
	return match.run();
};
```

A random player has very little hope of solving this puzzle in a reasonable number of moves.

_By [Leonardo Val](http://github.com/LeonardoVal)_.