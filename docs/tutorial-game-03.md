A simple deterministic simultaneous game: _Odds & Evens_
========================================================

[Odds and evens](http://en.wikipedia.org/wiki/Odds_and_evens) is a classic child game. Each turn each of the two players will chose at the same time either to play a 1 or a 2. If the sum of both numbers is even, the _Evens_ player earns a point. Otherwise the _Odds_ players earns a point. The game is played until one of the players reaches a certain amount of points, winning the game. This is a simple example of a simultaneous game, i.e. a game in which more than one player can move at any given turn. Another simple example is [Rock-Paper-Scissors](https://en.wikipedia.org/wiki/Rock-Paper-Scissors), and a much more complicated example would be [Diplomacy](http://en.wikipedia.org/wiki/Diplomacy_%28game%29).

## Implementation with Ludorum #####################################################################

A game state of Odds & Evens is very simple, since it must only include the current scores. Both players are always active every turn.

```javascript
var OddsAndEvens = ludorum.Game.make({
	name: 'Odds&Evens',
	players: ['Odds', 'Evens'],

	constructor: function OddsAndEvens(scores) {
		ludorum.Game.call(this, this.players);
		this._scores = scores || {Odds: 0, Evens: 0};
	},

	scores: function scores() {
		return this._scores;
	}
});
```

Game ends when the points goal is reached by either player. Here we use a goal of 10 points. The match result is the difference of points.

```javascript
OddsAndEvens.prototype.result = function result() {
	var scores = this._scores,
		goal = this.resultBounds()[1];
	if (scores.Odds >= goal) {
		return this.victory('Odds', Math.min(goal, scores.Odds) - scores.Evens);
	} else if (scores.Evens >= goal) {
		return this.victory('Evens', Math.min(goal, scores.Evens) - scores.Odds);
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

As we did in all cases before, to test our implementation of OddsAndEvens we make matches between random players. Here we use another way of setting up a match between random players. The `playTo` method is implemented for any `Player` subtype. The function makes `Match` with the given game and default instances of the player, `RandomPlayer` in this case. 

```javascript
OddsAndEvens.prototype.toString = function toString() {
	return JSON.stringify(this._scores);
};

OddsAndEvens.runTestMatch = function runTestMatch(args) {
	args = args || {};
	var game = args.game || new OddsAndEvens(),
		player1 = args.player1 || new ludorum.players.RandomPlayer(),
		player2 = args.player2 || new ludorum.players.RandomPlayer(),
		matchCount = args.matchCount || 1,
		match;
	return base.Future.sequence(base.Iterable.range(matchCount), function () {
		var match = new ludorum.Match(game, [player1, player2]);
		if (args.showMoves) {
			match.events.on('move', function (game, moves) {
				console.log(game +'\tmoves: '+ JSON.stringify(moves));
			});
		}
		match.events.on('end', function (game, result) {
			console.log(game +'\tresult: '+ JSON.stringify(result));
		});
		return match.run();
	});
};
```

The test's output in the console for `OddsAndEvens.runTestMatch({ showMoves: true })` may look as 
follows:

```
{"Odds":0,"Evens":0} moves: {"Odds":1,"Evens":1}
{"Odds":0,"Evens":1} moves: {"Odds":2,"Evens":2}
...
{"Odds":9,"Evens":9} moves: {"Odds":2,"Evens":2}
{"Odds":9,"Evens":10} result: {"Odds":-1,"Evens":1}
```

## Considering the whole match in players for OddsAndEvens #########################################

A strategy to play a game may have to consider more than the current game state. It may have to also
factor in some or all of the previous moves taken in the current match so far. The example given 
here is a [_Tit for Tat_ strategy](https://en.wikipedia.org/wiki/Tit_for_tat) for the Odds & Evens 
game. The tit for tat strategy makes the player imitate the opponent's previous action. The first 
action has a default, but we will consider it random. 

First we create the `TitForTatPlayer` as a subtype of `ludorum.Player`. The `params` argument may 
include the `match` being played and which role the player plays in it. The player must know its
opponent's moves in order to imitate them. For that purpose, the players subscribes to the match's
`move` event. The callback will be called after every turn with the game and the moves taken by all
active players. The opponent's last move is stored in the `opponentsLastMove` property of the 
player.

```javascript
var TitForTatPlayer = ludorum.Player.make({
	constructor: function TitForTatPlayer(params) {
		params = params || {};
		ludorum.Player.call(this, params);
		if (params.match) {
			this.match = params.match;
			this.role = params.role;
			var player = this;
			this.match.events.on('move', function (game, moves) {
				player.opponentsLastMove = moves[game.opponent(player.role)];				
			});
		}
	}
});
```

`Player` instances are required to set up a match. If a `Match` instance was required to create a 
player, the circular dependency will make it impossible to do it. When a `Match` is created, the
`participate` method of each player is called. By default this method returns the same player 
instance, assuming the player can play many matches at the same time. If the player has to consider
the whole match, a new instance must be created with a reference to the given match.

```javascript
TitForTatPlayer.prototype.participate = function participate(match, role) {
	return new this.constructor({ match: match, role: role });
};
```

The decision of the `TitForTatPlayer` simply returns the move made by the opponent in the previous 
turn. In the first turn, the move is chosen at random.

```javascript
TitForTatPlayer.prototype.decision = function decision(game, role) {
	if (!this.hasOwnProperty('opponentsLastMove')) {
		return this.random.choice(this.movesFor(game, role));
	} else {
		return this.opponentsLastMove;
	}
};
```

The player implementation can be tested with the following code. Running it many times will show 
that this strategy is not superior to a random one. 

```javascript
OddsAndEvens.runTestMatch({
	player1: new TitForTatPlayer(),
	player2: new ludorum.players.RandomPlayer(),
	showMoves: true
});
```

A good exercise for the reader would be to implement the opposite strategy, i.e. chosing a different
move than the opponent's last one.

# Final remarks ####################################################################################

In this section we've implemented a very simple simultaneous game. Another simple examples is 
[rock-paper-scissors](https://en.wikipedia.org/wiki/Rock%E2%80%93paper%E2%80%93scissors), and a more
complicated one is [Diplomacy](https://boardgamegeek.com/boardgame/483/diplomacy). All of these 
examples are deterministic. Making a stochastic simultaneous game implies the combination of the two
schemes. Aleatory variables are perfectly compatible with more than one active player per turn.

The _tit-for-tat_ artificial player for Odds & Evens is not a good player. It was used to show how 
to make players that use information of the whole match to make a decision, rather than only the 
current game state. Players for simultaneous games can be implemented using _MCTS_. _Minimax_ cannot
be used with games the have more than one active player per turn.

Ludorun focuses on games with more than one player. Still, singleplayer games can be defined within 
the framework. The next section explains how to implement a simple _puzzle_.

[Next - A simple singleplayer game: _15 Puzzle_](tutorial-game-04.md.html)

_By [Leonardo Val](http://github.com/LeonardoVal)_.