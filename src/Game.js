/** # Game

The class `ludorum.Game` is the base type for all games.
*/
var Game = exports.Game = declare({
	/** Its constructor takes the active player/s. A player is active if and only if it can move.
	The argument may be either a player's name (string) or an array of players' names. It is used to
	initialize `Game.activePlayers`, an array with the active players' names.
	*/
	constructor: function Game(activePlayers) {
		this.activatePlayers(activePlayers);
	},

	/** The game's `name` is used mainly for displaying purposes.
	*/
	name: '?',

	/** The game `players` are specified in an array of role names (strings), that the players can
	assume in a match of this game. For example: `"Xs"` and `"Os"` in TicTacToe, or `"Whites"` and
	`"Blacks"` in Chess.
	*/
	players: [],

	/** The moves of each active player are calculated by `moves()`. This method returns an object
	with every active player related to the moves each can make in this turn. For example:

	+ `{ Player1: ['Rock', 'Paper', 'Scissors'], Player2: ['Rock', 'Paper', 'Scissors'] }`

	If the game has finished then a _falsy_ value must be returned (`null` is recommended).
	*/
	moves: unimplemented("Game", "moves()"),

	/** Once the players have chosen their moves, the method `next` is used to perform the given
	moves. The first `moves` argument should be an object with a move for each active player. For
	example:

	+ `{ Player1: 'Rock', Player2: 'Paper' }`

	A second argument `haps` may be added if the game has random variables. It must have the same
	form as the `moves` argument, but instead of players as keys it will have random variables as
	keys.

	+ `{ die1: 6, die2: 3 }`

	If the third argument `update` is true indicate that is not necessary to return a new game
	instance. Else (and by default) the returned resulting state is always a new game instance.

	There isn't a default implementation of `next`, so it must be overriden. It is strongly advised
	to check if the arguments are valid.
	*/
	next: unimplemented("Game", "next(moves, haps, update)"),

	/** If the game is finished the result of the game is calculated with `result()`. It returns an
	object with every player in the game related to a number. This number must be positive if the
	player wins, negative if the player loses or zero if the game is a tie. For example:

	+ `{ Player1: -1, Player2: +1 }`

	If the game is not finished, this function must return a _falsy_ value (`null` is recommended).
	*/
	result: unimplemented("Game", "result()"),

	/** Some games may assign scores to the players in a finished game. This may differ from the
	result, since the score sign doesn't have to indicate victory or defeat. For example:

	+ result: `{ Player1: -1, Player2: +1 }`
	+ scores: `{ Player1: 14, Player2: 15 }`

	The method `scores()` returns the scores if such is the case. Also the score may be defined for
	unfinished games.

	By default, it return the same that `result()` does.
	*/
	scores: function scores() {
		return this.results();
	},

	/** In incomplete or imperfect information games players have different access to the game state
	data. The method `view(player)` returns a modified version of this game, that shows only the
	information from the perspective of the given player. The other information is modelled as
	aleatory variables.

	In this way searches in the game tree can be performed without revealing to	the automatic player
	information it shouldn't have access to (a.k.a _cheating_).
	*/
	view: function view(player) {
		return this;
	},

	// ## Player information #######################################################################

	/** Method `isActive(player...)` checks if the given players are all active.
	*/
	isActive: function isActive() {
		for (var i = 0; i < arguments.length; i++) {
			if (this.activePlayers.indexOf(arguments[i]) < 0) {
				return false;
			}
		}
		return true;
	},

	/** In most games there is only one active player per turn. The method `activePlayer()` returns
	that active player's role if there is one and only one, else it raises an error.
	*/
	activePlayer: function activePlayer() {
		var len = this.activePlayers.length;
		raiseIf(len < 1, 'There are no active players!');
		raiseIf(len > 1, 'More than one player is active!');
		return this.activePlayers[0];
	},

	/** Sets the `activePlayers` of this game state. Since this method changes the current game
	state, use with care.
	*/
	activatePlayers: function activatePlayers(activePlayers) {
		return this.activePlayers = !activePlayers ? [this.players[0]] :
			(!Array.isArray(activePlayers) ? [activePlayers] : activePlayers);
	},

	/** All players in a game are assumed to be opponents. The method `opponents(players=activePlayers)`
	returns an array with the opponent roles of the given players, or of the active players by
	default. If not all players are opponents this method can be overriden.
	*/
	opponents: function opponents(players) {
		players = players || this.activePlayers;
		return this.players.filter(function (p) {
			return players.indexOf(p) < 0;
		});
	},

	/** Since most games have only two players, the method `opponent(player=activePlayer)`
	conveniently returns the opponent of the given player, or the active player by default.
	*/
	opponent: function opponent(player) {
		var playerIndex = this.players.indexOf(player || this.activePlayer());
		return this.players[(playerIndex + 1) % this.players.length];
	},

	// ## Game flow ################################################################################

	/** Since `next()` expects a moves object, the method `perform(move, player=activePlayer, ...)`
	pretends to simplify simpler game mechanics. It performs the given moves for the given players
	(activePlayer by default) and returns the next game state.
	*/
	perform: function perform() {
		var moves = {}, player;
		for (var i = 0; i < arguments.length; i += 2) {
			player = arguments[i + 1];
			if (typeof player === 'undefined') {
				player = this.activePlayer();
			}
			moves[player] = arguments[i];
		}
		return this.next(moves);
	},

	/** The method `moves()` returns the available moves for each player. Yet this is not the same
	as the `moves` objects that can be used with `next()` to obtain a next game state. Furthermore,
	if there are more than one active player per turn, the possible decisions can be build with all
	combinations for all active players.

	The method `possibleMoves(moves=this.moves())` calculates all possible `moves` objects based on
	the result of `moves()`. For example, if `moves()` returns `{A:[1,2], B:[3,4]}`, then
	`possibleMoves()` would return `[{A:1, B:3}, {A:1, B:4}, {A:2, B:3}, {A:2, B:4}]`.
	*/
	possibleMoves: function possibleMoves(moves) {
		moves = arguments.length < 1 ? this.moves() : moves;
		if (!moves || typeof moves !== 'object') {
			return [];
		}
		var activePlayers = Object.keys(moves);
		if (activePlayers.length === 1) { // Most common case.
			var activePlayer = activePlayers[0];
			return moves[activePlayer].map(function (move) {
				return obj(activePlayer, move);
			});
		} else { // Simultaneous games.
			return Iterable.product.apply(Iterable,
				iterable(moves).mapApply(function (player, moves) {
					return moves.map(function (move) {
						return [player, move];
					});
				}).toArray()
			).map(function (playerMoves) {
				return iterable(playerMoves).toObject();
			}).toArray();
		}
	},

	/** Game states that depend on random variables are `Contingent` game states. The `contingent`
	method is a shortcut to make such states based on the current game state.
	*/
	contingent: function contingent(moves, aleatories, update) {
		return new Contingent(this, moves, aleatories, update);
	},

	// ## Result functions #########################################################################

	/** The maximum and minimum results may be useful and even required by some game search
	algorithm. To expose these values, `resultBounds()` returns an array with first the minimum and
	then the maximum. Most game have one type of victory (+1) and one type of defeat (-1). That's
	why `resultBounds()` returns [-1,+1] by default. Yet some games can define different bounds by
	overriding it.
	*/
	resultBounds: function resultBounds() {
		return [-1,+1];
	},

	/** The `normalizedResult(result=this.result())` is the `result()` expressed so the minimum
	defeat is equal to -1 and the maximum victory is equal to +1.
	*/
	normalizedResult: function normalizedResult(result) {
		result = result || this.result();
		var bounds;
		if (result && typeof result === 'object') {
			bounds = this.resultBounds();
			result = base.copy(result);
			for (var player in result) {
				result[player] = (result[player] - bounds[0]) / (bounds[1] - bounds[0]) * 2 - 1;
			}
			return result;
		} else if (typeof result === 'number') {
			bounds = this.resultBounds();
			return (+result - bounds[0]) / (bounds[1] - bounds[0]) * 2 - 1;
		} else {
			return null;
		}
	},

	/** Most games have victory and defeat results that cancel each other. It is said that all the
	victors wins the defeated player loses. Those games are called _zerosum games_. The method
	`zerosumResult(score, players=activePlayers)` builds a game result object for a zerosum game.
	The given score is split between the given players (the active players by default), and (-score)
	is split between their opponents.
	*/
	zerosumResult: function zerosumResult(score, players) {
		players = !players ? this.activePlayers : (!Array.isArray(players) ? [players] : players);
		score = (+score) / (players.length || 1);
		var opponentScore = -score / (this.players.length - players.length || 1);
		return iterable(this.players).map(function (player) {
			return [player, players.indexOf(player) < 0 ? opponentScore : score];
		}).toObject();
	},

	/** There are two shortcuts for `zerosumResult()`. First `victory(players=activePlayers, score=1)`
	returns the zero-sum game result with the given players (or the active players by default) as
	winners, and their opponents as losers.
	*/
	victory: function victory(players, score) {
		return this.zerosumResult(score || 1, players);
	},

	/** Second `defeat(players=activePlayers, score=-1)` returns the zero-sum game result with the
	given players (or the active players by default) as losers, and their opponents as winners.
	*/
	defeat: function defeat(players, score) {
		return this.zerosumResult(score || -1, players);
	},

	/** Finally `tied(players=this.players, score=0)` returns the game result of a tied game with
	the given players (or the active players by default) all with the same score (zero by default).
	A tied game must always have the same result for all players.
	*/
	tied: function tied(players, score) {
		score = +(score || 0);
		return iterable(players || this.players).map(function (p) {
			return [p, score];
		}).toObject();
	},

	// ## Game information #########################################################################

	/** Some AI algorithms have constraints on which games they can support. A game can provide some
	information to assess its compatibility with an artificial player automaticaly. Properties may
	include:

	+ `isZeroSum`: The sum of all results in every match is zero. True by default.
	*/
	isZeroSum: true,

	/** + `isDeterministic`: Perfect information game without random variables. False by default.
	*/
	isDeterministic: false,

	/** + `isSimultaneous`: In some or all turns more than one player is active. False by default.
	*/
	isSimultaneous: false,

	// ## Conversions & presentations ##############################################################

	/** Some algorithms require a `__hash__()` for each game state, in order to store them in caches
	or hash tables. The default implementation uses `Sermat.hashCode`.
	*/
	__hash__: function __hash__() {
		return Sermat.hashCode(this).toString(36);
	},

	/** Based on the game's serialization, `clone()` creates a copy of this game state.
	*/
	clone: function clone() {
		return Sermat.clone(this);
	},

	/** The default string representation of a game is equal to its serialization with Sermat.
	*/
	toString: function toString() {
		return Sermat.ser(this);
	},

	// ## Modified games ###########################################################################

	/** `cacheProperties` modifies getter methods (like `moves()` or `result()`) to cache its
	results. Warning! Caching the results of the `next()` method may lead to memory leaks or
	overload.
	*/
	'static cacheProperties': function cacheProperties() {
		var clazz = this;
		Array.prototype.slice.call(arguments).forEach(function (propertyName) {
			var cacheName = '__'+ propertyName +'$cache__',
				originalGetter = clazz.prototype[propertyName];
			clazz.prototype[propertyName] = function () {
				if (arguments.length > 0) {
					return originalGetter.apply(this, arguments);
				} else if (!this.hasOwnProperty(cacheName)) {
					this[cacheName] = originalGetter.call(this);
				}
				return this[cacheName];
			};
		});
		return clazz;
	}, // static cacheProperties

	/** `serialized(game)` builds a serialized version of a simultaneous game, i.e. one in which two
	or more players may be active in the same turn. It converts a simultaneous game to an alternated
	turn based game. This may be useful for using algorithms like MiniMax to build AIs for
	simultaneous games.
	*/
	'static serialized': function serialized(game) {
		var super_moves = game.prototype.moves,
			super_next = game.prototype.next;
		return declare(game, {
			/** The `moves()` of a serialized game returns the moves of the player deemed as the
			active player, if there are any moves.
			*/
			moves: function moves() {
				var fixedMoves = this.__fixedMoves__ || (this.__fixedMoves__ = {}),
					allMoves = super_moves.call(this),
					activePlayer;
				for (var i = 0; i < this.activePlayers.length; i++) {
					if (fixedMoves.hasOwnProperty(this.activePlayers[i])) {
						activePlayer = this.activePlayers[i];
						break;
					}
				}
				return activePlayer && allMoves ? obj(activePlayer, allMoves[activePlayer]) : null;
			},

			/** The `next(moves)` of a serialized game advances the actual game if with the given
			move all active players in the real game state have moved. Else the next player that has
			to move becomes active.
			*/
			next: function next(moves) {
				var nextFixedMoves = copy({}, this.fixedMoves || {}, moves),
					allMoved = iterable(this.players).all(function (p) {
							return nextFixedMoves.hasOwnProperty(p);
						}),
					result;
				if (allMoved) {
					result = super_next.call(this, nextFixedMoves);
					result.fixedMoves = {};
				} else {
					result = this.clone();
					result.fixedMoves = nextFixedMoves;
				}
				return result;
			}
		});
	} // static serialized

}); // declare Game.
