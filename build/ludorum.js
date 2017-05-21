(function (init) { "use strict";
		if (typeof define === 'function' && define.amd) {
			define(['creatartis-base', 'sermat'], init); // AMD module.
		} else if (typeof exports === 'object' && module.exports) {
			module.exports = init(require('creatartis-base'), require('sermat')); // CommonJS module.
		} else {
			this.Sermat = init(this.base, this.Sermat); // Browser.
		}
	}).call(this,/** Library wrapper and layout.
*/
function __init__(base, Sermat) { "use strict";
// Import synonyms. ////////////////////////////////////////////////////////////////////////////////
	var unimplemented = base.objects.unimplemented,
		obj = base.obj,
		copy = base.copy,
		raise = base.raise,
		raiseIf = base.raiseIf,
		declare = base.declare,
		Iterable = base.Iterable,
		iterable = base.iterable,
		Future = base.Future,
		Randomness = base.Randomness,
		initialize = base.initialize,
		Statistics = base.Statistics,
		Events = base.Events;

// Library layout. /////////////////////////////////////////////////////////////////////////////////
	var exports = {
			__package__: 'ludorum',
			__name__: 'ludorum',
			__init__: __init__,
			__dependencies__: [base, Sermat],
			__SERMAT__: { include: [base] }
		},
		/** The library is organized in the following _namespaces_.
		*/
		aleatories = exports.aleatories = {},
		games = exports.games = {},
		players = exports.players =  {},
		tournaments = exports.tournaments = {},
		utils = exports.utils = {}
	;

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
		if (result) {
			var bounds = this.resultBounds();
			result = base.copy(result);
			for (var player in result) {
				result[player] = (result[player] - bounds[0]) / (bounds[1] - bounds[0]) * 2 - 1;
			}
			return result;
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

	// ## Conversions & presentations ##############################################################

	/** Some algorithms require a `__hash__()` for each game state, in order to store them in caches 
	or hash tables. The default implementation uses the hash code of the string representation.
	*/
	__hash__: function __hash__() {
		return base.Text.hashCode(this +'');
	},

	/** Based on the game's serialization, `clone()` creates a copy of this game state.
	*/
	clone: function clone() {
		return Sermat.sermat(this);
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


/** # Player

Player is the base type for all playing agents. Basically, playing a game means choosing a move from 
all available ones, each time the game enables the player to do so.
*/
var Player = exports.Player = declare({
	/** The default constructor takes only its `name` from the given `params`. This is an abstract 
	class that is meant to be extended.
	*/
	constructor: (function () {
		var __PlayerCount__ = 0; // Used by the Player's default naming.
		return function Player(params) {
			initialize(this, params)
				.string('name', { defaultValue: 'Player' + (__PlayerCount__++), coerce: true });
		};
	})(),

	/** A player is asked to choose a move by calling `Player.decision(game, role)`. The result is 
	the selected move if it can be obtained synchronously, else a future is returned.
	*/
	decision: function decision(game, role) {
		return this.movesFor(game, role)[0]; // Indeed not a very thoughtful base implementation. 
	},

	/** To help implement the decision, `Player.movesFor(game, player)` gets the moves in the game 
	for the player. It also checks if there are any moves, and if it not so an error is risen.
	*/
	movesFor: function movesFor(game, role) {
		var moves = game.moves();
		raiseIf(!moves || !moves[role] || moves[role].length < 1, 
			"Player ", role, " has no moves for game ", game, ".");
		return moves[role];
	},
	
	/** Before starting a [match](Match.js.html), all players are asked to join by calling 
	`Player.participate(match, role)`. This allows the player to prepare properly. If this implies 
	building another instance of the player object, it must be returned in order to participate in 
	the match.
	*/
	participate: function participate(match, role) {
		return this;
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Player',
		serializer: function serialize_Player(obj) {
			return [{name: obj.name}];
		}
	},
	
	/** The string representation of the player is derived straight from its serialization.
	*/
	toString: function toString() {
		return Sermat.ser(this);
	}
}); // declare Player.


/** # Match

A match is a controller for a game, managing player decisions, handling the flow of the turns 
between the players by following the game's logic.
*/
var Match = exports.Match = declare({
	/** `Match` objects are build with the [game's](Game.html) starting state and the players that 
	participate. The players argument must be either an array of [`Player`](Player.html) objects or 
	an object with a member for each of the game's players with a Player object as value.
	*/
	constructor: function Match(game, players) {
		this.game = game;
		this.players = Array.isArray(players) ? iterable(game.players).zip(players).toObject() : players;
		/** The match records the sequence of game state in `Match.history`.
		*/
		this.history = [game];
		this.events = new Events({ 
			events: ['begin', 'move', 'next', 'end', 'quit']
		});
		for (var p in this.players) { // Participate the players.
			this.players[p] = this.players[p].participate(this, p) || this.players[p];
		}
	},

	/** Each step in the match's history is called a ply. `Match.ply()` indicates the current ply 
	number.
	*/
	ply: function ply() {
		return this.history.length - 1;
	},
	
	/** Each ply has a game state. `Match.state(ply=last)` retrieves the game state for the given 
	ply, or the last one by default.
	*/
	state: function state(ply) {
		ply = isNaN(ply) ? this.ply() : +ply < 0 ? this.ply() + (+ply) : +ply;
		return this.history[ply | 0];
	},

	/** If the last game state is finished, then the whole match is finished. If so, 
	`Match.result()` returns the match result, which is the result of the last game state.
	*/
	result: function result() {
		return this.state().result();
	},

	/** If the last game state is not finished, then the match continues. To move the play on, 
	`Match.decisions(game=state())` asks the active players in the game to choose their moves. 
	Returns a future that is resolved when all players have decided.
	*/
	decisions: function decisions(game) {
		game = game || this.state();
		var match = this,
			players = this.players,
			activePlayers = game.activePlayers;
		return Future.all(activePlayers.map(function (p) {
			return players[p].decision(game.view(p), p);
		})).then(function (decisions) {
			var moves = iterable(activePlayers).zip(decisions).toObject();
			match.onMove(game, moves);
			return moves;
		});
	},

	/** `Match.run(plys=Infinity)` runs the match the given number of plys, or until the game 
	finishes. The result is a future that gets resolved when the game ends.
	*/
	run: function run(plys) {
		plys = isNaN(plys) ? Infinity : +plys;
		if (plys < 1) { // If the run must stop...
			return Future.when(this);
		}
		var ply = this.ply(), game = this.state(), results, next;
		if (ply < 1) {
			this.onBegin(game);
		}
		game = this.__advanceContingents__(game); // Remove all non-determinism.
		results = game.result();
		if (results) { // If the match has finished ...
			this.onEnd(game, results);
			return Future.when(this);
		} else { // Else the run must continue ...
			var match = this;
			return this.decisions(game).then(function (moves) {
				if (match.__advance__(game, moves)) {
					return match.run(plys - 1);
				} else {
					return match;
				}				
			});
		}
	},
	
	__advanceContingents__: function __advanceContingents__(game, moves) {
		for (var next; game.isContingent; game = next) {
			next = game.randomNext();
			this.history.push(next);
			this.onNext(game, next);
		}
		return game;
	},
	
	__advance__: function __advance__(game, moves) {
		var match = this,
			abortMatch = !iterable(game.activePlayers).all(function (player) {
				var move = moves[player];
				return typeof move.__command__ !== 'function' || move.__command__(match, player);
			});
		if (abortMatch) {
			return false;
		}
		var next = game.next(moves); // Match must go on.
		this.history.push(next);
		this.onNext(game, next);
		return true;
	},
	
	/** ## Commands ################################################################################
	
	Commands are pseudo-moves, which can be returned by the players instead of valid moves for the 
	game being played. Their intent is to control the match itself.
	
	The available commands are:
	*/
	"static commands": {
		/** + `Quit`: A quit command means the player that issued it is leaving the match. The match 
		is then aborted.
		*/
		Quit: declare({
			__command__: function __command__(match, player) {
				match.onQuit(match.state(), player);
				return false;
			}
		})
	},
	
	/** ## Events ##################################################################################
	
	Matches provide game events that players and spectators can be registered to. `Match.events` is 
	the event handler. Emitted events are:
	*/
	
	/** + The `begin` event fired by `Match.onBegin(game)` when the match begins. The callbacks 
	should have the signature `function (game, match)`.
	*/
	onBegin: function onBegin(game) {
		this.events.emit('begin', game, this);
		if (this.logger) {
			this.logger.info('Match begins with ', iterable(this.players).map(function (attr) {
				return attr[1] +' as '+ attr[0];
			}).join(', '), '; for ', game, '.');
		}
	},
	
	/** + The `move` event fired by `Match.onMove(game, moves)` every time the active players make 
	moves. The callbacks should have the signature `function (game, moves, match)`.
	*/
	onMove: function onMove(game, moves) {
		this.events.emit('move', game, moves, this);
		if (this.logger) {
			this.logger.info('Players move: ', JSON.stringify(moves), ' in ', game);
		}
	},
	
	/** + The `next` event fired by `Match.onNext(game, next)` signals when the match advances to 
	the next game state. This may be due to moves or aleatory instantiation.  The callbacks should 
	have the signature `function (gameBefore, gameAfter, match)`.
	*/
	onNext: function onNext(game, next) {
		this.events.emit('next', game, next, this);
		if (this.logger) {
			this.logger.info('Match advances from ', game, ' to ', next);
		}
	},
	
	/** + The `end` event triggered by `Match.onEnd(game, results)` notifies when the match ends. 
	The callbacks should have the signature `function (game, result, match)`.
	*/
	onEnd: function onEnd(game, results) {
		this.events.emit('end', game, results, this);
		if (this.logger) {
			this.logger.info('Match for ', game, 'ends with ', JSON.stringify(results));
		}
	},
	
	/** + The `quit` event triggered by `Match.onQuit(game, player)` is emitted when the match is 
	aborted due to the given player leaving it. The callbacks should have the signature 
	`function (game, quitter, match)`.
	*/
	onQuit: function onQuit(game, player) {
		this.events.emit('quit', game, player, this);
		if (this.logger) {
			this.logger.info('Match for ', game, ' aborted because player '+ player +' quitted.');
		}
	},
	
	// ## Utilities ################################################################################
	
	toString: function toString() {
		return 'Match('+ this.game +', '+ JSON.stringify(this.players) +')';
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Match',
		serializer: function serialize_Match(obj) {
			return [obj.game, obj.players, obj.history];
		},
		materializer: function materialize_Match(obj, args) {
			if (args) {
				var match = new Match(args[0], args[1]);
				match.history = args[2];
				return match;
			} else {
				return null;
			}
		}
	}
}); // declare Match.


/** # Contingent

Contingent states are game states that depend on other factors that the players choices. They are
used to represent randomness in non-deterministic games. The random variables (called `haps`) can
be dice, card decks, roulettes, etc.
*/
var Contingent = exports.Contingent = declare({
	/** Flag to distinguish contingent states from normal game states.
	*/
	isContingent: true,
	
	/** The default implementation takes a set of `haps`, a game `state` and a set of `moves`. See
	the `next` method for further details.
	*/
	constructor: function Contingent(state, moves, haps, update) {
		this.state = state;
		this.moves = moves;
		/** A contingent state's `haps` are the equivalent of `moves` in normal game states. The 
		method returns an object with the random variables on which this node depends, e.g.: 
		`{ die: aleatories.dice.D6 }`.
		*/
		this.haps = haps;
		this.update = !!update;
	},
		
	/** Contingent game states' `next` and `advance` methods delegate to the corresponding game 
	`__state__` methods. The `haps` provided must be in the form `{die1: 4, die2: 2}`. If no `haps` 
	are given, they are resolved randonmly (using `randomHaps()`).
	*/
	next: function next(haps) {
		return this.state.next(this.moves, haps || this.randomHaps(), this.update);
	},
	
	/** Method `randomHaps` calculates a random set of haps.
	*/
	randomHaps: function randomHaps(random) {
		return iterable(this.haps).mapApply(function (n, h) {
			return [n, h.value(random)];
		}).toObject();
	},
	
	/** A `randomNext` picks one of the next states at random.
	*/
	randomNext: function randomNext(random) {
		return this.next(this.randomHaps(random));
	},
	
	/** The method `possibleHaps` is analogous to `Game.possibleMoves`. It calculates all possible 
	combinations of haps.
	*/
	possibleHaps: function possibleHaps() {
		return Iterable.product.apply(Iterable,
			iterable(this.haps).mapApply(function (n, hap) {
				return hap.distribution().mapApply(function (v, p) {
					return [n, v, p];
				});
			}).toArray()
		).map(function (haps) {
			var prob = 1;
			return [iterable(haps).mapApply(function (n, v, p) {
				prob *= p;
				return [n, v];
			}).toObject(), prob];
		}).toArray();
	},
	
	/** The `expectedEvaluation` method explores al possible resulting game states from this 
	contingent state and applies an evaluation function. This state evaluation function must have 
	the signature `stateEvaluation(game, player)`. Asynchronous evaluations are supported, in which
	case a `Future` will be returned.
	
	By default the aggregated result is the sum of the evaluations weighted by the probability of
	each possible resulting game state. The `aggregation` function may be specified to override this 
	behaviour and process the results in another way. If given, it will be called with an array of
	triples `[haps, probability, evaluation]`.
	*/
	expectedEvaluation: function expectedEvaluation(player, stateEvaluation, aggregation) {
		var game = this,
			isAsync = false,
			possible = this.possibleHaps().map(function (args) {
				var game2 = game.next(args[0]),
					ev = !game2.isContingent ? stateEvaluation(game2, player) : 
						game2.expectedEvaluation(player, stateEvaluation, aggregation);
				isAsync = isAsync || Future.__isFuture__(ev);
				return Future.then(ev, function (ev) {
					args.push(ev);
					return args;
				});
			});
		return Future.then(isAsync ? Future.all(possible) : possible, aggregation || function (possible) {
			var r = 0;
			possible.forEach(function (triple) {
				r += triple[1] * triple[2];
			});
			return r;
		});
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Contingent',
		serializer: function serialize_Contingent(obj) {
			return [obj.state, obj.moves, obj.haps];
		}
	}
});

/** # Tournament

A tournament is a set of matches played between many players. The whole contest 
ranks the participants according to the result of the matches. This is an 
abstract base class for many different types of contests.
*/
var Tournament = exports.Tournament = declare({
	constructor: function Tournament(game, players) {
		/** The tournament always has one [`game`](Game.html) state from which 
		all matches start.
		*/
		this.game = game;
		/** All the [`players`](Player.html) involved in the tournament must be
		provided to the constructor in an array.
		*/
		this.players = Array.isArray(players) ? players : iterables.iterable(players).toArray();
		this.statistics = new Statistics();
		this.events = new Events({ 
			events: ['begin', 'beforeMatch', 'afterMatch', 'end']
		});
	},

	/** The next match to be played is determined by `__advance__`, which 
	returns a match instance, or null if the tournament has finished. It is not 
	implemented in this base class. 
	*/
	__advance__: unimplemented("Tournament", "__advance__"),
	
	/** `Tournament.run()` plays all the tournament's matches. Since running a 
	match is asynchronous, running a tournament is too. Hence the result is 
	always a future, which will be resolved when all matches have been played.
	*/
	run: function run() {
		this.onBegin();
		var tournament = this;
		return Future.doWhile(function () {
			return Future.then(tournament.__advance__(), function (match) {
				if (match) {
					tournament.beforeMatch(match);
					return tournament.__runMatch__(match).then(function (match) {
						tournament.account(match);
						tournament.afterMatch(match);
						return match;
					});
				} else {
					return null;
				}
			});
		}).then(this.onEnd.bind(this));
	},
	
	/** The method `__runMatch__` runs a match. It is present so it can be 
	overridden, to implement some specific behaviour of the contest.
	*/
	__runMatch__: function __runMatch__(match) {
		return match.run();
	},
	
	/** Tournaments gather information from the played matches using their
	`statistics` property (instance of `creatartis-base.Statistics`). The method 
	`Tournament.account(match)` is called to accounts the results of each 
	finished match for the players' score.
	
	The match results are gathered in the `results` key. The keys `victories`,
	`defeats` and `draws` count each result type. The length of each game is
	recorded under `length`. The move count at each ply is aggregated under
	`width`. All these numbers are open by game, role, player.
	*/
	account: function account(match) {
		var game = this.game,
			results = match.result(), 
			isDraw = false,
			stats = this.statistics;
		raiseIf(!results, "Match doesn't have results. Has it finished?");
		iterable(match.players).forEach(function (p) { // Player statistics.
			var role = p[0],
				player = p[1],
				playerResult = results[p[0]];
			stats.add({key:'results', game:game.name, role:role, player:player.name}, 
				playerResult);
			stats.add({key:(playerResult > 0 ? 'victories' : playerResult < 0 ? 'defeats' : 'draws'),
				game:game.name, role:role, player:player.name}, playerResult);
			stats.add({key:'length', game:game.name, role:role, player:player.name}, 
				match.ply()); //FIXME This may not be accurate if the game has random variables.
			match.history.forEach(function (entry) {
				if (typeof entry.moves === 'function') {
					var moves = entry.moves();	
					if (moves && moves.hasOwnProperty(role) && moves[role].length > 0) {
						stats.add({key:'width', game:game.name, role:role, player:player.name}, 
							moves[role].length);
					}
				}
			});
		});
	},
	
	/** ## Events #############################################################
	
	Tournaments provide events to enable further analysis and control over it. 
	`Tournament.events` is the event handler. The emitted events are:
	*/
	
	/** + The `begin` event fired by `Tournament.onBegin()` when the whole 
	contest begins. The callbacks should have the signature 
	`function (tournament)`.
	*/	
	onBegin: function onBegin() {
		this.events.emit('begin', this);
		if (this.logger) {
			this.logger.info('Tournament begins for game ', game.name, '.');
		}
	},
	
	/** + The `beforeMatch` event triggered by `Tournament.beforeMatch(match)` 
	just before starting a match. The callbacks should have the signature 
	`function (match, tournament)`.
	*/
	beforeMatch: function beforeMatch(match) {
		this.events.emit('beforeMatch', match, this);
		if (this.logger) {
			this.logger.debug('Beginning match with ', JSON.stringify(match.players), '.');
		}
	},
	
	/** + The `afterMatch` event triggered by `Tournament.afterMatch(match)` 
	just after a match ends. The callbacks should have the signature 
	`function (match, tournament)`.
	*/
	afterMatch: function afterMatch(match) {
		this.events.emit('afterMatch', match, this);
		if (this.logger) {
			this.logger.debug('Finishing match with ', JSON.stringify(match.players), '.');
		}
	},
	
	/** + The `end` event triggered by `Tournament.onEnd()` when the whole 
	contest is completed. The callbacks should have the signature 
	`function (statistics, tournament)`.
	*/
	onEnd: function onEnd() {
		this.events.emit('end', this.statistics, this);
		if (this.logger) {
			this.logger.info('Tournament ends for game ', game.name, ':\n', this.statistics, '\n');
		}
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Tournament',
		serializer: function serialize_Tournament(obj) {
			return [obj.game, obj.players];
		}
	}
}); // declare Tournament


/** # Checkerboard

Base class for checkerboards representations based on several different data structures.
*/
var Checkerboard = utils.Checkerboard = declare({
	/** The base constructor only sets the board dimensions: `height` and `width`.
	*/
	constructor: function Checkerboard(height, width) {
		if (!isNaN(height)) {
			this.height = height|0;
		}
		if (!isNaN(width)) {
			this.width = width|0;
		}
	},
	
	/** The value for empty squares is `emptySquare`. This will be used in functions walking and 
	traversing the board. 
	*/
	emptySquare: null,
	
	// ## Board information ########################################################################
	
	/** All coordinates are represented by `[row, column]` arrays. To check if a coordinate is 
	inside the board, use `isValidCoord(coord)`.
	*/
	isValidCoord: function isValidCoord(coord) {
		return Array.isArray(coord) && !isNaN(coord[0]) && !isNaN(coord[1])	&& 
			coord[0] >= 0 && coord[0] < this.height && 
			coord[1] >= 0 && coord[1] < this.width;
	},
	
	/** Method `coordinates()` returns the sequence of the board's valid positions; first by row 
	then by column.
	*/
	coordinates: function coordinates() {
		return Iterable.range(this.height).product(Iterable.range(this.width));
	},
	
	/** Method `square(coord, outside)` should get the contents at a given coordinate. If the 
	coordinate is off the board, `outside` must be returned. This method is abstract so it must be 
	overriden in subclasses.
	*/
	square: unimplemented('utils.Checkerboard', 'square'),
	
	/** A square is assumed to be empty when its value is equal to `emptySquare`.
	*/
	isEmptySquare: function isEmptySquare(coord) {
		return this.square(coord) === this.emptySquare;
	},
	
	// ### Lines ###################################################################################
	
	/** Many games must deal with line configurations of pieces. The following methods help with 
	this kind of logic. Each line is a sequence of coordinates in the board.
	
	+ `horizontals()`: All the horizontal lines (rows).
	*/
	horizontals: function horizontals() {
		var width = this.width;
		return Iterable.range(this.height).map(function (row) {
			return Iterable.range(width).map(function (column) {
				return [row, column];
			});
		});
	},
	
	/** 
	+ `verticals()`: All the vertical lines (columns).
	*/
	verticals: function verticals() {
		var height = this.height;
		return Iterable.range(this.width).map(function (column) {
			return Iterable.range(height).map(function (row) {
				return [row, column];
			});
		});
	},
	
	/** 
	+ `orthogonals()`: All the horizontal (rows) and vertical lines (columns) in the board.
	*/
	orthogonals: function orthogonals() {
		return this.horizontals().chain(this.verticals());
	},
	
	/**
	+ `positiveDiagonals()`: All the positive diagonals lines (those where row = k + column).
	*/
	positiveDiagonals: function positiveDiagonals() {
		var width = this.width, 
			height = this.height, 
			count = height + width - 1;
		return Iterable.range(count).map(function (i) {
			var row = Math.max(0, height - i - 1),
				column = Math.max(0, i - height + 1);
			return Iterable.range(Math.min(i + 1, count - i)).map(function (j) {
				return [row + j, column + j];
			});
		});
	},
	
	/** 
	+ `negativeDiagonals()`: All the negative diagonals lines (those where row = k - column).
	*/
	negativeDiagonals: function negativeDiagonals() {
		var width = this.width, 
			height = this.height, 
			count = height + width - 1;
		return Iterable.range(count).map(function (i) {
			var row = Math.min(i, height - 1),
				column = Math.max(0, i - height + 1);
			return Iterable.range(Math.min(i + 1, count - i)).map(function (j) {
				return [row - j, column + j];
			});
		});
	},
	
	/**
	+ `diagonals()`: All the diagonal lines in the board.
	*/
	diagonals: function diagonals() {
		return this.positiveDiagonals().chain(this.negativeDiagonals());
	},
	
	/**
	+ `lines()`: All the horizontal, vertical and diagonal lines in the board.
	*/
	lines: function lines() {
		return this.orthogonals().chain(this.diagonals());
	},
	
	/** The previous methods return the whole lines. Some times the game logic demands checking 
	lines of a certain length. These are sublines, and can be calculated by 
	`sublines(lines, length)`. It obviously filters lines which are shorter than length.
	*/
	sublines: function sublines(lines, length) {
		return iterable(lines).map(function (line) {
			return Array.isArray(line) ? line : iterable(line).toArray();
		}, function (line) {
			return line.length >= length;
		}).map(function (line) {
			return Iterable.range(0, line.length - length + 1).map(function (i) {
				return line.slice(i, i + length);
			});
		}).flatten();
	},
	
	// ### Walks ###################################################################################
	
	/** A walk is a sequence of coordinates in the board that start at a given point and advances in
	a certain direction. The `walk(coord, delta)` method returns an iterable with coordinates from 
	`coord` and on, adding `delta`'s row and column until going off the board.
	*/
	walk: function walk(coord, delta) {
		var board = this;
		return new Iterable(function __iter__() {
			var current = coord.slice();
			return function __walkIterator__() {
				if (board.isValidCoord(current)) {
					var result = current.slice();
					current[0] += delta[0];
					current[1] += delta[1];
					return result;
				} else {
					throw Iterable.STOP_ITERATION;
				}
			};
		});
	},
	
	/** Convenient method `walks(coord, deltas)` can be used to get many walks from the same origin.
	*/
	walks: function walks(coord, deltas) {
		var board = this;
		return deltas.map(function (delta) {
			return board.walk(coord, delta);
		});
	},
	
	/** Frequently used deltas for walks are available at `DIRECTIONS`.
	*/
	"static DIRECTIONS": {
		HORIZONTAL: [[0,-1], [0,+1]],
		VERTICAL:   [[-1,0], [+1,0]], 
		ORTHOGONAL: [[0,-1], [0,+1], [-1,0], [+1,0]],
		DIAGONAL:   [[-1,-1], [-1,+1], [+1,-1], [+1,+1]],
		EVERY:      [[0,-1], [0,+1], [-1,0], [+1,0], [-1,-1], [-1,+1], [+1,-1], [+1,+1]]
	},
	
	// ## Board modification #######################################################################
	
	/** Game states must not be modifiable, else game search algorithms may fail or be extremely 
	complicated. Then, all board altering method in `Checkerboard` must return a new board instance 
	and leave this instance unspoiled.
	
	Most board modification functions have two versions: one which actually modifies the board state
	and another which returns a modified copy. This is meant to optimize chains of board 
	alterations. To get a copy of this board, the `clone` method can be used.
	*/
	clone: unimplemented('utils.Checkerboard', 'clone'),
	
	/** The first function to change the board is `place(coord, value)`. It places the value at the 
	given coordinate, replacing whatever was there.
	
	The `__place__` version modifies this board, and is not implemented in the base class. It should
	return this instance, to enable chaining.
	*/
	__place__: unimplemented('utils.Checkerboard', 'place'),
	
	place: function place(coord, value) {
		return this.clone().__place__(coord, value);
	},

	/** Another usual operation is `move(coordFrom, coordTo, valueLeft)`. It moves the contents at 
	`coordFrom` to `coordTo`. Whatever is at `coordTo` gets replaced, and `valueLeft` is placed at
	`coordFrom`. If `valueLeft` is undefined, `emptySquare` is used.
	*/
	__move__: function __move__(coordFrom, coordTo, valueLeft) {
		return this.__place__(coordTo, this.square(coordFrom))
			.__place__(coordFrom, typeof valueLeft === 'undefined' ? this.emptySquare : valueLeft);
	},
	
	move: function move(coordFrom, coordTo, valueLeft) {
		return this.clone().__move__(coordFrom, coordTo, valueLeft);
	},
	
	/** The next board operation is `swap(coordFrom, coordTo)`, which moves the contents at 
	`coordFrom` to `coordTo`, and viceversa.
	*/
	__swap__: function __swap__(coordFrom, coordTo) {
		var valueTo = this.square(coordTo);
		return this.__place__(coordTo, this.square(coordFrom))
			.__place__(coordFrom, valueTo);
	},
	
	swap: function swap(coordFrom, coordTo) {
		return this.clone().__swap__(coordFrom, coordTo);
	},
	
	// ## Whole board operations ###################################################################
	
	/** The `transform` builds a new board mapping coordinates of this board with the given
	function.
	*/
	transform: function transform(coordinateMapping) {
		var result = this.clone(),
			board = this;
		this.coordinates().forEach(function (position) {
			var newPosition = coordinateMapping.apply(board, [board, position].concat(position));
			result.__place__(newPosition, board.square(position));
		});
		return result;
	},
	
	/** Symmetries transform the whole board at once. The `horizontalSymmetry` of the board flips it 
	with a vertical axis at its center, while the `verticalSymmetry` flips it with an horizontal 
	axis.
	*/
	horizontalSymmetry: function horizontalSymmetry() {
		return this.transform(function (board, position, row, column) {
			return [row, board.width - column - 1];
		});
	},
	
	verticalSymmetry: function verticalSymmetry() {
		return this.transform(function (board, position, row, column) {
			return [board.height - row - 1, column];
		});
	},
	
	/** Rotations also transform the whole board at once. The `clockwiseRotation` of the board 
	rotates in the direction that the hands of a clock, while the `counterClockwiseRotation` rotates
	it in the opposite direction.
	*/
	clockwiseRotation: function clockwiseRotation() {
		return this.transform(function (board, position, row, column) {
			return [column, board.height - row - 1];
		});
	},
	
	counterClockwiseRotation: function counterClockwiseRotation() {
		return this.transform(function (board, position, row, column) {
			return [board.width - column - 1, row];
		});
	},
	
	// ## Board presentation. ######################################################################
	
	/** Board games' user interfaces may be implemented using HTML & CSS. This is the case of 
	Ludorum's playtesters.
	*/
	renderAsHTMLTable: function (document, container, callback) {
		var board = this, // for closures.
			table = document.createElement('table');
		container.appendChild(table);
		board.horizontals().reverse().forEach(function (line) {
			var tr = document.createElement('tr');
			table.appendChild(tr);
			line.forEach(function (coord) {
				var square = board.square(coord),
					td = document.createElement('td'),
					data = {
						id: "ludorum-square-"+ coord.join('-'),
						className: "ludorum-square",
						square: square,
						coord: coord,
						innerHTML: base.Text.escapeXML(square)
					};
				if (callback) {
					data = callback(data) || data;
				}
				td['ludorum-data'] = data;
				td.id = data.id;
				td.className = data.className;
				td.innerHTML = data.innerHTML;
				if (data.onclick) {
					td.onclick = data.onclick;
				}
				tr.appendChild(td);
			});
		});
		return table;
	},
	
	// ## Heuristics ###############################################################################
	
	/** A `weightedSum` is an simple way of defining an heuristic. Every position in the board is 
	assigned a weight, and every possible value is assigned a coefficients (usually player is 1, 
	opponent is -1, else is 0).
	
	Weights have to be in the same order that `coordinates()` enumerates the board's positions. This
	function assumes the weights are normalized and sufficient to cover the whole board.
	*/
	weightedSum: function weightedSum(weights, coefficients) {
		var board = this;
		return this.coordinates().zip(weights).mapApply(function (coord, weight) {
			return coefficients[board.square(coord)] * weight || 0;
		}).sum();
	}
}); //// declare utils.Checkerboard.


/** # CheckerboardFromString

[`Checkerboard`](Checkerboard.html) implementation represented by a simple string (one character per 
square).
*/
var CheckerboardFromString = utils.CheckerboardFromString = declare(Checkerboard, {
	/** The constructor takes `height`, `width`, the whole board content in a `string`, and 
	optionally the empty square character.
	*/
	constructor: function CheckerboardFromString(height, width, string, emptySquare) {
		Checkerboard.call(this, height, width);
		if (emptySquare && emptySquare !== this.emptySquare) {
			this.emptySquare = (emptySquare +'').charAt(0);
		}
		if (string && string.length !== height * width) {
			throw new Error('Given string '+ JSON.stringify(string) +' does not match board dimensions.');
		}
		this.string = string || this.emptySquare.repeat(height * width);
	},
	
	/** The `emptySquare` in `CheckerboardFromString` is `'.'` by default.
	*/
	emptySquare: '.',	
	
	/** The default string conversion of `CheckerboardFromString` prints the board one line by row, 
	last row on top.
	*/
	toString: function toString() {
		var string = this.string, height = this.height, width = this.width;
		return Iterable.range(height).map(function (i) {
			return string.substr((height - i - 1) * width, width);
		}).join('\n');
	},
	
	// ## Board information ########################################################################
	
	/** The `square(coord, outside)` return the character at `(row * width + column)` if the 
	coordinate is inside the board. Else returns `outside`.
	*/
	square: function square(coord, outside) {
		var row = coord[0], 
			column = coord[1],
			width = this.width;
		if (row >= 0 && row < this.height && column >= 0 && column < width) {
			return this.string.charAt(row * width + column);
		} else {
			return outside;
		}
	},
	
	// ### Lines ###################################################################################
	
	/** Since square contents in `CheckerboardFromString` are just characters, lines can be thought 
	as strings. The method `asString(line)` takes an iterable of coordinates and returns a string of 
	the characters found at each point in the sequence.
	*/
	asString: function asString(line) {
		var board = this;
		return line.map(function (coord) {
			return board.square(coord);
		}).join('');
	},
	
	/** The method `asStrings(lines)` can be used to easily map `asString(line)` to a sequence of 
	lines, like the one calculated by `lines()`.
	*/
	asStrings: function asStrings(lines) {
		var board = this;
		return lines.map(function (line) {
			return board.asString(line);
		});
	},
	
	/** Many games based on board configurations (like connection games) have patterns that can be 
	expressed with regular expressions. The method `asRegExp(line, insideLine, outsideLine)` takes a 
	line (iterable of coordinates) and returns a string with a regular expression. This may be used 
	to tests the whole board string for the line.
	
	_Warning!_ Both `insideLine` and `outsideLine` must be simple regular expressions (e.g. a 
	character or atom). If more complex expressions are required they must be provided between 
	parenthesis.
	*/
	asRegExp: function asRegExp(line, insideLine, outsideLine) {
		outsideLine = outsideLine || '.';
		var width = this.width,
			squares = Iterable.repeat(false, width * this.height).toArray();
		line.forEach(function (coord) {
			squares[coord[0] * width + coord[1]] = true;
		});
		var result = '', count = 0, current;
		for (var i = 0; i < squares.length; count = 0) {
			current = squares[i];
			do {
				++count;
			} while (++i < squares.length && squares[i] === current);
			if (count < 2) {
				result += current ? insideLine : outsideLine;
			} else {
				result += (current ? insideLine : outsideLine) +'{'+ count +'}';
			}
		}
		return result;
	},
	
	/** The method `asRegExps(lines)` can be used to easily map `asRegExp(line)` to a sequence of 
	lines. All regular expressions are joined as a union (`|`). Use with caution, because the whole 
	regular expression can get very big even with small boards.
	*/
	asRegExps: function asRegExps(lines, insideLine, outsideLine) {
		var board = this;
		return lines.map(function (line) {
			return board.asRegExp(line, insideLine, outsideLine);
		}).join('|');
	},
	
	// ## Board modification #######################################################################
	
	/** Cloning a CheckerboardFromString simply calls the constructor again with the proper 
	arguments to replicate this instance.
	*/
	clone: function clone() {
		return new this.constructor(this.height, this.width, this.string, 
			this.hasOwnProperty('emptySquare') ? this.emptySquare : undefined);
	},
	
	/** A `place(coord, value)` means only changing one character in the underlying string. The 
	`value` must be a character, and `coord` a point inside the board.
	*/
	__place__: function __place__(coord, value) {
		raiseIf(!this.isValidCoord(coord), "Invalid coordinate ", coord, ".");
		value = (value + this.emptySquare).charAt(0);
		var i = coord[0] * this.width + coord[1];
		this.string = this.string.substr(0, i) + value + this.string.substr(i + 1);
		return this;
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'CheckerboardFromString',
		serializer: function serialize_CheckerboardFromString(obj) {
			var r = [obj.height, obj.width, obj.string];
			if (obj.hasOwnProperty('emptySquare')) {
				r.push(obj.emptySquare);
			}
			return r;
		}
	}
}); // declare utils.CheckerboardFromString

/** # Checkerboard from pieces

[`Checkerboard`](Checkerboard.html) implementation represented by a list of pieces (objects) with a
location in the board.
*/
var CheckerboardFromPieces = utils.CheckerboardFromPieces = declare(Checkerboard, {
	/** The constructor takes `height`, `width`, a list of piece objects and optionally the empty 
	square object. The piece objects must have a property `position`. Only one piece is allowed at
	each square.
	*/
	constructor: function CheckerboardFromPieces(height, width, pieces, emptySquare) {
		Checkerboard.call(this, height, width);
		var board = this;
		if (emptySquare !== this.emptySquare) {
			this.emptySquare = emptySquare;
		}
		if (Array.isArray(pieces)) {
			this.pieces = {}; 
			iterable(pieces || []).forEach(function (piece) {
				raiseIf(!Array.isArray(piece.position), "Piece has not a position (", piece, ")!");
				board.pieces[piece.position +''] = piece;
			});
		} else if (typeof pieces === 'object') {
			this.pieces = base.copy({}, pieces);
		} else {
			raise("Invalid pieces definition: ", pieces, "!");
		}
	},
	
	/** The `emptySquare` in `CheckerboardFromPieces` is `null` by default.
	*/
	emptySquare: null,	
	
	/** The default string conversion of `CheckerboardFromPieces` prints the piece list.
	*/
	toString: function toString() {
		return '['+ iterable(this.pieces).select(1).join(', ') +']';
	},
	
	// ## Board information ########################################################################
	
	/** The `square(coord, outside)` return the piece object at the given `coord` if there is one 
	and the coordinate is inside the board. Else returns `outside`.
	*/
	square: function square(coord, outside) {
		return this.pieces[coord] || outside;
	},
	
	// ## Board modification #######################################################################
	
	/** Cloning a `CheckerboardFromPieces` simply calls the constructor again with the proper 
	arguments to replicate this instance. The `pieces` object is copied _shallowly_ by the 
	constructor.
	*/
	clone: function clone() {
		return new this.constructor(this.height, this.width, this.pieces, this.emptySquare);
	},
	
	/** A `place(coord, value)` means removing any existing piece at the given `coord` and adding 
	the `value` piece if given.
	*/
	__place__: function __place__(coord, value) {
		raiseIf(!this.isValidCoord(coord), "Invalid coordinate ", coord, "!");
		var id = coord +'';
		delete this.pieces[id];
		if (value) {
			this.pieces[id] = value;
		}
		return this;
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'CheckerboardFromPieces',
		serializer: function serialize_CheckerboardFromPieces(obj) {
			var r = [obj.height, obj.width, obj.pieces];
			if (obj.hasOwnProperty('emptySquare')) {
				r.push(obj.emptySquare);
			}
			return r;
		}
	}
}); // declare utils.CheckerboardFromPieces


/** # Scanner

Component for scanning a game's tree.
*/
exports.utils.Scanner = declare({
	/** A Scanner builds a sample of a game tree, in order to get statistics 
	from some of all possible matches. The given `config` must have:
	*/
	constructor: function Scanner(config) {
		initialize(this, config)
		// + `game`: Game to scan.
			.object("game", { ignore: true })
		// + `maxWidth=1000`: Maximum amount of game states held at each step.
			.integer("maxWidth", { defaultValue: 1000, coerce: true })
		// + `maxLength=50`: Maximum length of simulated matches.
			.integer("maxLength", { defaultValue: 50, coerce: true })
		// + `random=randomness.DEFAULT`: Pseudorandom number generator to use in the simulations.
			.object("random", { defaultValue: Randomness.DEFAULT })
		// + `statistics=<new>`: Component to gather relevant statistics.
			.object("statistics", { defaultValue: new Statistics() });
	},
	
	/** A scan of a game's tree reproduces and samples the set of all possible 
	matches from the given game states. The simulation halts at `maxLength` 
	plies, and never holds more than `maxWidth` game states. Since this process
	is asynchronous, this method returns a future.
	
	The `players` argument may provide a player for some or all of the games' 
	roles. If available, they will be used to decide which move is applied to 
	each game state. If missing, all next game states will be added. Ergo no 
	players means a simulation off all possible matches.		
	*/
	scan: function scan(players) {
		var scanner = this,
			window = arguments.length < 2 ? (this.game ? [this.game] : []) : Array.prototype.slice.call(arguments, 1),
			ply = 0; 
		return Future.whileDo(function () {
			return window.length > 0 && ply < scanner.maxLength;
		}, function () {
			return Future.all(window.map(function (game) {
				return scanner.__advance__(players, game, ply);
			})).then(function (level) {
				window = iterable(level).flatten().sample(scanner.maxWidth, scanner.random).toArray();
				return ++ply;
			});
		}).then(function () {
			scanner.statistics.add({ key:'aborted' }, window.length);
			return scanner.statistics;
		});
	},
	
	/** Performs scans for many different player setups.
	*/
	scans: function scans() {
		return Future.sequence(Array.prototype.slice.call(arguments), this.scan.bind(this));
	},
	
	/** The `__advance__` method advances the given game by one ply. This may 
	mean for non final game states either instantiate random variables, ask the 
	available player for a decision, or take all next game states. Final game 
	states are removed. 
	
	All game states are accounted in the scanner's statistics. The result is an 
	iterable with the game states to add to the next scan window.
	*/
	__advance__: function __advance__(players, game, ply) {
		if (game instanceof Aleatory) {
			return iterable(game.distribution()).mapApply(function (value, prob) {
				return game.next(value);
			});
		} else if (this.account(players, game, ply)) {
			return Iterable.EMPTY;
		} else {
			var scanner = this,
				moves = game.moves(),
				stats = this.statistics;
			return Future.all(game.activePlayers.map(function (role) {
				if (players && players[role]) {
					var p = players[role],
						decisionTime = stats.stat({key:'decision.time', game: game.name, role: role, player: p.name});
					decisionTime.startTime();
					return Future.when(p.decision(game, role)).then(function (move) {
						decisionTime.addTime();
						return [[role, move]];
					});
				} else {
					return moves[role].map(function (move) {
						return [role, move];
					});
				}
			})).then(function (decisions) {
				return Iterable.product.apply(Iterable, decisions).map(function (moves) {
					return game.next(iterable(moves).toObject());
				});
			});
		}
	},
			
	/** The `account` method gathers statistics about the game. These include:
		
	+ `game.result`: Final game state results. Also available for victory and defeat.
	+ `game.length`: Match length in plies. Also available for victory and defeat.
	+ `game.width`: Number of available moves.
	+ `draw.length`: Drawn match length in plies.
	
	Returns whether the given game state is final or not.
	*/
	account: function account(players, game, ply) {
		var result = game.result(),
			stats = this.statistics;
		if (result) {
			iterable(game.players).forEach(function (role) {
				var r = result[role],
					p = (players && players[role]) ? players[role].name : '',
					keys = ['game:'+ game.name, 'role:'+ role, 'player:'+ p];
				stats.add({key:'game.result', game:game.name, role:role, player:p}, r, game);
				stats.add({key:'game.length', game:game.name, role:role, player:p}, ply, game);
				if (r < 0) {
					stats.add({key:'defeat.result', game:game.name, role:role, player:p}, r, game);
					stats.add({key:'defeat.length', game:game.name, role:role, player:p}, ply, game);
				} else if (r > 0) {
					stats.add({key:'victory.result', game:game.name, role:role, player:p}, r, game);
					stats.add({key:'victory.length', game:game.name, role:role, player:p}, ply, game);
				} else {
					stats.add({key:'draw.length', game:game.name, role:role, player:p}, ply, game);
				}
			});
			return true;
		} else {
			var moves = game.moves();
			iterable(game.activePlayers).forEach(function (role) {
				stats.add({key:'game.width', game:game.name, role:role}, moves[role].length);
			});
			return false;
		}
	}
}); // Scanner.


/** # Cache

A game cache contains a part of a game tree, avoiding redundancies. It can be
used to implement a [transposition table](http://en.wikipedia.org/wiki/Transposition_table) 
or similar data structures.
*/
utils.Cache = declare({
	/** The `Cache` constructor may take a game to define as `root`.
	*/
	constructor: function Cache(game) {
		this.clear();
		if (game) {
			this.root(game);
		}
	},
	
	/** The `stateIdentifier(state)` of every game state is used as the key in 
	the cache's entries. By default is calculated with the `Game.identifier()`
	method.
	*/
	stateIdentifier: function stateIdentifier(state) {
		return state.identifier();
	},
	
	/** The `moveIdentifier(move)` is used as the key in each entry's 
	descendants. By default it uses the move JSON _stringification_.
	*/
	moveIdentifier: function moveIdentifier(move) {
		return JSON.stringify(move);
	},
	
	/** The `has(state|id)` returns if the given state or state identifier has 
	an entry in this cache.
	*/
	has: function has(state) {
		var stateId = typeof state === 'string' ? state : this.stateIdentifier(state);
		return this.__entries__.hasOwnProperty(stateId);
	},
	
	/** If the given state or state identifier has en entry in this cache, 
	`get(state)` returns that entry. Else it returns `undefined`.
	*/
	get: function get(state) {
		var stateId = typeof state === 'string' ? state : this.stateIdentifier(state);
		return this.__entries__[stateId];
	},
	
	/** `size()` returns the amount of entries in this cache.
	*/
	size: function size() {
		return Object.keys(this.__entries__).length;
	},
	
	/** If the given state has no entry in this cache, `entry(state, id)` builds
	a new entry, adds it to this cache and returns it. If the state is already
	cached, its entry is returned.
	Every entry has the game `state`, its `id`, the states that may come before
	(the `precursors`) and the states that may follow (the `descendants`).
	*/
	entry: function entry(state, id) {
		id = id || this.stateIdentifier(state);
		if (this.has(id)) {
			return this.get(id);
		} else {
			var _entry = { id: id, state: state, precursors: [], descendants: {} };
			this.__entries__[id] = _entry;
			return _entry;
		}
	},
	
	/** An entry's `descendant(entry, moves)` is the entry of the game state 
	following the given entry's game state with the given moves. The method not
	only returns the entry is this state, it creates and caches that entry if 
	not present.
	*/
	descendant: function descendant(entry, moves) {
		var movesId = this.moveIdentifier(moves),
			descendants = entry.descendants;
		if (descendants.hasOwnProperty(movesId)) { // Already expanded.
			return descendants[movesId][1];
		} else {
			var nextState = entry.state.next(moves),
				nextStateId = this.stateIdentifier(nextState),
				nextEntry = this.get(nextStateId) || // Reuse entry in cache if it exists.
					this.entry(nextState, nextStateId); // Else add new entry.
			descendants[movesId] = [moves, nextEntry];
			nextEntry.precursors.push([moves, entry]);
			return nextEntry;
		}
	},
	
	/** An entry `descendants(entry)` is an array of all the entry's 
	descendants, for all the possible moves for the entry's state.
	*/
	descendants: function descendants(entry) {
		var descendant = this.descendant.bind(this, entry);
		if (arguments.length > 1) {
			return Array.prototype.slice.call(arguments, 1).map(descendant);
		} else { // if (arguments.length == 0)
			return entry.state.possibleMoves().map(descendant);
		}
	},
	
	/** A clear cache has no entries and of course no root.
	*/
	clear: function clear() {
		this.__entries__ = {};
		this.__root__ = null;
	},
	
	/** If `root()` is called without arguments, it returns the current root.
	If a state is given, that state is assigned as the new root, and the whole
	cache is pruned.
	*/
	root: function root(state) {
		if (arguments.length > 0) { // Called with argument means setter.
			var stateId = this.stateIdentifier(state);
			this.__root__ = this.get(stateId) || this.entry(state, stateId);
			this.prune(stateId);
		}
		return this.__root__;
	},
	
	/** `prune(id=root.id)` deletes all nodes except the one with the given id 
	and its descendants.
	*/
	prune: function prune(id) {
		var pending = [id || this.__root__.id], 
			pruned = {},
			entry;
		while (id = pending.shift()) {
			if (!pruned.hasOwnProperty(id)) {
				entry = this.get(id);
				pruned[id] = entry;
				pending.push.apply(pending, iterable(entry.descendants).mapApply(function (id, pair) {
					return pair[1][id];
				}).toArray());
			}
		}
		return this.__entries__ = pruned;
	}	
}); // declare Cache


/** # Game tree

A data structure to help building game trees, i.e. trees in which each node is a game state, the
final states are leaves and each child node belongs to one of the next states of its parent.
*/
var GameTree = declare({
	/** Each instance represents a node in the game tree. The `parent` must be null or undefined at
	the root. The given `transition` is either the moves or the aleatory values used to move from 
	the parent's state to this node's state. They also must be null or undefined at the root.
	*/
	constructor: function GameTree(parent, state, transition) {
		this.parent = parent;
		this.state = state;
		this.transition = transition;
		this.children = {};
	},
	
	/** This node's `children` are stored in an object, hence getting the count is a little tricky.
	*/
	childrenCount: function childrenCount() {
		return Object.keys(this.children).length;
	},
	
	/** In the `children` object nodes are stored with a serialization of their transitions as keys.
	By default the JSON _"strinigification"_ is used.
	*/
	__childSerialization__: function __childSerialization__(moves) {
		return JSON.stringify(moves);
	},
	
	/** A node expansion takes the `moves` to calculate the next state and creates the child node
	with it. If the node already exists, it is returned and none is created.
	*/
	expand: function expand(transition) {
		var key = this.__childSerialization__(transition),
			child = this.children[key],
			nextState;
		if (!child) {
			try {
				nextState = this.state.next(transition); 
			} catch (err) {
				raise("Node expansion for ", this.state, " with ", JSON.stringify(transition),
					" failed with: ", err);
			}
			child = new this.constructor(this, nextState, transition);
			this.children[key] = child;
		}
		return child;
	},
	
	/** Returns the possible moves is the state is an instance of Game, or the possible values if
	the state is an instance of Aleatory.
	*/
	possibleTransitions: function possibleTransitions() {
		var state = this.state;
		if (state.isContingent) {
			return state.possibleHaps();
		} else {
			return state.possibleMoves();
		}
	},
	
	/** A full expansion creates all child nodes for this node.
	*/
	expandAll: function expandAll() {
		var node = this;
		return this.possibleTransitions().map(function (transition) {
			return node.expand(// An array as transition means it belongs to a contingent state
				Array.isArray(transition) ? transition[0] : transition);
		});
	}
}); // declare GameTree

/** # RandomPlayer

Automatic players that moves fully randomly.
*/	
players.RandomPlayer = declare(Player, {
	/** The constructor takes the player's `name` and a `random` number generator
	(`base.Randomness.DEFAULT` by default).
	*/
	constructor: function RandomPlayer(params) {
		Player.call(this, params);
		initialize(this, params)
			.object('random', { defaultValue: Randomness.DEFAULT });
	},

	/** The `decision(game, player)` is made completely at random.
	*/
	decision: function(game, player) {
		return this.random.choice(this.movesFor(game, player));
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'RandomPlayer',
		serializer: function serialize_RandomPlayer(obj) {
			return this.serializeAsProperties(obj, ['name', 'random']);
		}
	},
}); // declare RandomPlayer.


/** # TracePlayer

Automatic player that is scripted previously.
*/
players.TracePlayer = declare(Player, {
	/** The constructor takes the player's `name` and the `trace` as an sequence of moves to make.
	*/
	constructor: function TracePlayer(params) {
		Player.call(this, params);
		this.trace = iterable(params.trace);
		this.__iter__ = this.trace.__iter__();
		this.__decision__ = this.__iter__();
	},

	/** The `decision(game, player)` returns the next move in the trace, or the last one if the 
	trace has ended.
	*/
	decision: function(game, player) {
		try {
			this.__decision__ = this.__iter__();
		} catch (err) {
			Iterable.prototype.catchStop(err);
		}
		return this.__decision__;
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'TracePlayer',
		serializer: function serialize_TracePlayer(obj) {
			var ser = Player.__SERMAT__.serializer(obj),
				args = ser[0];
			args.trace = obj.trace.toArray();
			return ser;
		}
	}
}); // declare TracePlayer.


/** # HeuristicPlayer

This is the base type of automatic players based on heuristic evaluations of game states or moves.
*/

var HeuristicPlayer = players.HeuristicPlayer = declare(Player, {
	/** The constructor takes the player's `name` and a `random` number generator 
	(`base.Randomness.DEFAULT` by default). Many heuristic can be based on randomness, but this is 
	also necessary to chose between moves with the same evaluation without any bias.
	*/
	constructor: function HeuristicPlayer(params) {
		Player.call(this, params);
		initialize(this, params)
			.object('random', { defaultValue: Randomness.DEFAULT })
			.func('heuristic', { ignore: true });
	},

	/** An `HeuristicPlayer` choses the best moves at any given game state. For this purpose it 
	evaluates every move with `moveEvaluation(move, game, player)`. By default this function 
	evaluates the states resulting from making each move, which is the most common thing to do.
	*/
	moveEvaluation: function moveEvaluation(move, game, player) {
		var heuristicPlayer = this;
		if (Object.keys(move).length < 2) { // One active player.
			return this.stateEvaluation(game.next(move), player);
		} else { // Many active players.
			var sum = 0, count = 0;
			move = copy(obj(player, [move[player]]), move);
			game.possibleMoves(move).forEach(function (ms) {
				sum += heuristicPlayer.stateEvaluation(game.next(ms), player);
				++count;
			});
			return count > 0 ? sum / count : 0; // Average all evaluations.
		}
	},

	/** The `stateEvaluation(game, player)` calculates a number as the assessment of the given game 
	state for the given player. The base implementation returns the result for the player is the 
	game has results, else it returns the heuristic value for the state.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		if (!game.isContingent) {
			var gameResult = game.result();
			return gameResult ? gameResult[player] : this.heuristic(game, player);
		} else {
			/** Heuristics cannot be applied to contingent game states. Hence all posible haps are 
			explored, and when a non-contingent game state is reached the heuristic is called.
			*/
			return game.expectedEvaluation(player, this.stateEvaluation.bind(this));
		}
	},
	
	/** The `heuristic(game, player)` is an evaluation used at states that are not finished games. 
	The default implementation returns a random number in [-0.5, 0.5). This is only useful in 
	testing. Any serious use should redefine this.
	*/
	heuristic: function heuristic(game, player) {
		return this.random.random(-0.5, 0.5);
	},
	
	/** Heuristic players work by evaluating the moves of the `player` in the given `game` state. If
	the game state is contingent, then all possible scenarios are evaluated and aggregated. The 
	result of `evaluatedMoves` is a sequence of pairs `[move, evaluation]`, or a future for such 
	sequence if the evaluation function is asynchronous.
	*/
	evaluatedMoves: function evaluatedMoves(game, player) {
		var heuristicPlayer = this,
			isAsync = false;
		raiseIf(game.isContingent, "Contingent game state have no moves!");
		/** Every move is evaluated using `moveEvaluation`. This may be asynchronous and hence
		result in a `Future`.
		*/
		var result = this.possibleMoves(game, player).map(function (move) {
				var e = heuristicPlayer.moveEvaluation(move, game, player);
				isAsync = isAsync || Future.__isFuture__(e);
				return Future.then(e, function (e) {
					return [move, e];
				});
			});
		return isAsync ? Future.all(result) : result;
	}, // evaluatedMoves()
	
	/** The `possibleMoves` for a `player` in a given `game` is a set of objects, with one move for
	the player, and all the options for the opponents.
	*/
	possibleMoves: function possibleMoves(game, player) {
		var moves = game.moves();
		raiseIf(!moves || !moves[player] || !Array.isArray(moves[player]) || moves[player].length < 1,
			"Player "+ player +" has no moves in "+ game +" (moves= "+ moves +")!");
		return moves[player].map(function (move) {
			return copy(obj(player, move), moves);
		});
	},
	
	/** The `bestMoves(evaluatedMoves)` are all the best evaluated in the given sequence of tuples 
	[move, evaluation].
	*/
	bestMoves: function bestMoves(evaluatedMoves) {
		return Future.then(evaluatedMoves, function (evaluatedMoves) {
			return iterable(evaluatedMoves).greater(function (pair) {
				return pair[1];
			}).map(function (pair) {
				return pair[0];
			});
		});
	},
	
	/** The `decision(game, player)` selects randomly from the best evaluated moves.
	*/
	decision: function decision(game, player) {
		var random = this.random;
		return Future.then(this.bestMoves(this.evaluatedMoves(game, player)), function (bestMoves) {
			raiseIf(!bestMoves || !bestMoves.length, "No moves where selected at ", game,
				" for player ", player, "!");
			return random.choice(bestMoves)[player];
		});
	},
	
	// ## Utilities to build heuristics ############################################################
	
	/** A `composite` heuristic function returns the weighted sum of other functions. The arguments 
	must be a sequence of heuristic functions and a weight. All weights must be between 0 and 1 and
	add up to 1.
	*/
	'static composite': function composite() {
		var components = Array.prototype.slice.call(arguments), weightSum = 0;
		raiseIf(components.length < 1,
			"HeuristicPlayer.composite() cannot take an odd number of arguments!");
		for (var i = 0; i < components.length; i += 2) {
			raiseIf(typeof components[i] !== 'function', 
				"HeuristicPlayer.composite() argument ", i, " (", components[i], ") is not a function!");
			components[i+1] = +components[i+1];
			raiseIf(isNaN(components[i+1]) || components[i+1] < 0 || components[i+1] > 1, 
				"HeuristicPlayer.composite() argument ", i+1, " (", components[i+1], ") is not a valid weight!");
		}
		return function compositeHeuristic(game, player) {
			var sum = 0;
			for (var i = 0; i+1 < components.length; i += 2) {
				sum += components[i](game, player) * components[i+1];
			}
			return sum;
		};
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'HeuristicPlayer',
		serializer: function serialize_HeuristicPlayer(obj) {
			var ser = Player.__SERMAT__.serializer(obj),
				args = ser[0];
			if (obj.hasOwnProperty('heuristic')) {
				args.heuristic = obj.heuristic;
			}
			return ser;
		}
	}
}); // declare HeuristicPlayer.

/** # MaxNPlayer

Automatic players based on the [MaxN](http://dl.acm.org/citation.cfm?id=2887795) algorithm, a 
MiniMax variant for games of more than two players.
*/
var MaxNPlayer = players.MaxNPlayer = declare(HeuristicPlayer, {
	/** Besides the parameters of every [`HeuristicPlayer`](HeuristicPlayer.js.html), an `horizon` 
	for the search may be specified (3 plies by default).
	*/
	constructor: function MaxNPlayer(params) {
		HeuristicPlayer.call(this, params);
		initialize(this, params)
			.integer('horizon', { defaultValue: 3, coerce: true });
	},

	/** This player evaluates each state using the `maxn` method, taking the evaluation for the 
	given `player`.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		if (!game.isContingent) {
			return this.maxN(game, player, 0)[player];
		} else {
			raise("MaxNPlayer.stateEvalution() does not support contingent game states!"); //TODO
		}
	},

	/** `heuristics(game)` returns an heuristic value for each players in the game, as an object.
	*/
	heuristics: function heuristics(game) {
		var result = {}, maxN = this;
		game.players.forEach(function (role) {
			result[role] = maxN.heuristic(game, role);
		});
		return result;
	},

	/** `quiescence(game, player, depth)` is a stability test for the given `game` state and the 
	given `player`. If the game is quiescent, this function must return evaluations. Else it must 
	return null. 
	
	Final game states are always quiescent, and their evaluations are the game's result for each 
	player. This default implementation also returns heuristic evaluations for every game state at 
	a deeper depth than the player's horizon, calculated via the `heuristics()` method. 
	*/
	quiescence: function quiescence(game, player, depth) {
		var results = game.result();
		if (results) {
			return results;
		} else if (depth >= this.horizon) {
			return this.heuristics(game);
		} else {
			return null;
		}
	},
	
	/** The core `maxN(game, player, depth)` algorithm return the evaluations for each player of the 
	given game, assuming each player tries to maximize its own evaluation regardless of the others'.
	*/
	maxN: function maxN(game, player, depth) {
		var values = this.quiescence(game, player, depth);
		if (!values) { // game is not quiescent.
			var activePlayer = game.activePlayer(),
				moves = this.movesFor(game, activePlayer),
				otherValues, next;
			values = {};
			if (moves.length < 1) {
				throw new Error('No moves for unfinished game '+ game +'.');
			}
			for (var i = 0; i < moves.length; ++i) {
				next = game.next(obj(activePlayer, moves[i]));
				otherValues = this.maxN(next, player, depth + 1);
				if (otherValues[activePlayer] > (values[activePlayer] || -Infinity)) {
					values = otherValues;
				}
			}
		}
		return values;
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'MaxNPlayer',
		serializer: function serialize_MaxNPlayer(obj) {
			var ser = HeuristicPlayer.__SERMAT__.serializer(obj),
				args = ser[0];
			args.horizon = obj.horizon;
			return ser;
		}
	}
}); // declare MaxNPlayer.

/** # MiniMaxPlayer

Automatic players based on pure MiniMax.
*/
var MiniMaxPlayer = players.MiniMaxPlayer = declare(HeuristicPlayer, {
	/** The constructor takes the player's `name` and the MiniMax search's `horizon` (`4` by 
	default).
	*/
	constructor: function MiniMaxPlayer(params) {
		HeuristicPlayer.call(this, params);
		initialize(this, params)
			.integer('horizon', { defaultValue: 4, coerce: true });
	},

	/** Every state's evaluation is the minimax value for the given game and player.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		return this.minimax(game, player, 0);
	},

	/** The `quiescence(game, player, depth)` method is a stability test for the given game state. 
	If the game is quiescent, this function must return an evaluation. Else it must return `NaN` or 
	an equivalent value. 
	
	Final game states are always quiescent, and their evaluation is the game's result for the given 
	player. This default implementation also return an heuristic evaluation for every game state at 
	a deeper depth than the player's horizon.
	*/
	quiescence: function quiescence(game, player, depth) {
		var results = game.result();
		if (results) {
			return results[player];
		} else if (depth >= this.horizon) {
			return this.heuristic(game, player);
		} else {
			return NaN;
		}
	},
	
	/** The `minimax(game, player, depth)` method calculates the Minimax evaluation of the given 
	game for the given player. If the game is not finished and the depth is greater than the 
	horizon, `heuristic` is used.
	*/
	minimax: function minimax(game, player, depth) {
		if (game.isContingent) {
			return this.expectiMinimax(game, player, depth);
		}
		var value = this.quiescence(game, player, depth);
		if (isNaN(value)) { // game is not quiescent.
			var activePlayer = game.activePlayer(),
				moves = this.movesFor(game, activePlayer), 
				comparison, next;
			if (moves.length < 1) {
				throw new Error('No moves for unfinished game '+ game +'.');
			}
			if (activePlayer == player) {
				value = -Infinity;
				comparison = Math.max;
			} else {
				value = +Infinity;
				comparison = Math.min;
			}
			for (var i = 0; i < moves.length; ++i) {
				next = game.next(obj(activePlayer, moves[i]));
				value = comparison(value, this.minimax(next, player, depth + 1));
			}
		}
		return value;
	},
	
	/** The `expectiMinimax(game, player, depth)` method is used when calculating the minimax value
	of a contingent game state. Basically returns the sum of all the minimax values weighted by the 
	probability of each possible next state. 
	*/
	expectiMinimax: function expectiMinimax(game, player, depth) {
		if (!game.isContingent) {
			return this.minimax(game, player, depth);
		} else {
			var p = this;
			return game.expectedEvaluation(player, function (game, player) {
				return p.minimax(game, player, depth + 1);
			});
		}
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'MiniMaxPlayer',
		serializer: function serialize_MiniMaxPlayer(obj) {
			var ser = HeuristicPlayer.__SERMAT__.serializer(obj),
				args = ser[0];
			args.horizon = obj.horizon;
			return ser;
		}
	}
}); // declare MiniMaxPlayer.

/** # AlphaBetaPlayer

Automatic players based on MiniMax with alfa-beta pruning.
*/
players.AlphaBetaPlayer = declare(MiniMaxPlayer, {
	/** The constructor does not add anything to the parent
	[`MiniMaxPlayer`](MiniMaxPlayer.js.html) constructor.
	*/
	constructor: function AlphaBetaPlayer(params) {
		MiniMaxPlayer.call(this, params);
	},

	/** Every state's evaluation is the minimax value for the given game and 
	player. The alfa an beta arguments are initialized with `-Infinity` and
	`Infinity`.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		return this.minimax(game, player, 0, -Infinity, Infinity);
	},

	/** The `minimax(game, player, depth, alfa, beta)` method calculates the 
	Minimax evaluation of the given game for the given player. If the game is 
	not finished and the depth is greater than the horizon, the heuristic is
	used.
	*/
	minimax: function minimax(game, player, depth, alpha, beta) {
		if (game.isContingent) {
			return this.expectiMinimax(game, player, depth, alpha, beta);
		}
		var value = this.quiescence(game, player, depth);
		if (!isNaN(value)) {
			return value;
		}
		var activePlayer = game.activePlayer(),
			isActive = activePlayer == player,
			moves = this.movesFor(game, activePlayer), next;
		if (moves.length < 1) {
			raise("No moves for unfinished game "+ game +"!");
		}
		for (var i = 0; i < moves.length; i++) {
			next = game.next(obj(activePlayer, moves[i]));
			value = this.minimax(next, player, depth + 1, alpha, beta);
			if (isActive) {
				if (alpha < value) { // MAX
					alpha = value;
				}
			} else {
				if (beta > value) { // MIN
					beta = value;
				}
			}
			if (beta <= alpha) {
				break;
			}
		}
		return isActive ? alpha : beta;
	},
	
	/** The `expectiMinimax(game, player, depth)` method is used when calculating the minimax value
	of a contingent game state. Basically returns the sum of all the minimax values weighted by the 
	probability of each possible next state. 
	*/
	expectiMinimax: function expectiMinimax(game, player, depth, alpha, beta) {
		if (!game.isContingent) {
			return this.minimax(game, player, depth);
		} else {
			var p = this;
			return game.expectedEvaluation(player, function (game, player) {
				return p.minimax(game, player, depth + 1, alpha, beta);
			});
		}
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'AlphaBetaPlayer',
		serializer: function serialize_AlphaBetaPlayer(obj) {
			return MiniMaxPlayer.__SERMAT__.serializer(obj);
		}
	}
}); // declare AlphaBetaPlayer.


/** # MonteCarloPlayer

Automatic player based on flat Monte Carlo tree search.
*/
var MonteCarloPlayer = players.MonteCarloPlayer = declare(HeuristicPlayer, {
	/** The constructor builds a player that chooses its moves using the 
	[flat Monte Carlo game tree search method](http://en.wikipedia.org/wiki/Monte-Carlo_tree_search). 
	The parameters may include:
	
	+ `simulationCount=30`: Maximum amount of simulations performed for each available move at each 
		decision.
	+ `timeCap=1000ms`: Time limit for the player to decide.
	+ `horizon=500`: Maximum amount of moves performed in simulations.
	+ `agent`: Player instance used in the simulations. If undefined moves are chosen at random. 
		Agents with asynchronous decisions are not supported.
	*/
	constructor: function MonteCarloPlayer(params) {
		HeuristicPlayer.call(this, params);
		initialize(this, params)
			.number('simulationCount', { defaultValue: 30, coerce: true })
			.number('timeCap', { defaultValue: 1000, coerce: true })
			.number('horizon', { defaultValue: 500, coerce: true });
		if (params) switch (typeof params.agent) {
			case 'function': this.agent = new HeuristicPlayer({ heuristic: params.agent }); break;
			case 'object': this.agent = params.agent; break;
			default: this.agent = null;
		}
	},
	
	/** `evaluatedMoves(game, player)` returns a sequence with the evaluated moves.
	*/
	evaluatedMoves: function evaluatedMoves(game, player) {
		raiseIf(game.isContingent, "MonteCarloPlayer cannot evaluate root contingent states!"); //FIXME
		var monteCarloPlayer = this,
			endTime = Date.now() + this.timeCap,
			options = this.possibleMoves(game, player).map(function (move) {
				return { 
					move: move, 
					nexts: (Object.keys(move).length < 2 ? 
						[game.next(move)] :
						game.possibleMoves(copy(obj(player, [move[player]]), move)).map(function (moves) {
							return game.next(moves);
						})
					),
					sum: 0, 
					count: 0 
				};
			}); // Else the following updates won't work.
		for (var i = 0; i < this.simulationCount && Date.now() < endTime; ++i) {
			options.forEach(function (option) {
				option.nexts = option.nexts.filter(function (next) {
					var sim = monteCarloPlayer.simulation(next, player);
					option.sum += sim.result[player];
					++option.count;
					return sim.plies > 0;
				});
			});
		}
		return options.map(function (option) {
			raiseIf(isNaN(option.sum), "State evaluation is NaN for move ", option.move, "!");
			return [option.move, option.count > 0 ? option.sum / option.count : 0];
		});
	},
	
	/** This player's `stateEvaluation(game, player)` runs `simulationCount` simulations and returns 
	the average result. It is provided for compatibility, since `evaluatedMoves` does not call it.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		var resultSum = 0, 
			simulationCount = this.simulationCount,
			sim;
		for (var i = 0; i < simulationCount; ++i) {
			sim = this.simulation(game, player);
			resultSum += sim.result[player];
			if (sim.plies < 1) { // game is final.
				break;
			}
		}
		return simulationCount > 0 ? resultSum / simulationCount : 0;
	},
	
	/** A `simulation(game, player)` plays a random match from the given `game` state and returns an 
	object with the final state (`game`), its result (`result`) and the number of plies simulated 
	(`plies`).
	*/
	simulation: function simulation(game, player) {
		var mc = this,
			plies, move, moves;
		for (plies = 0; true; ++plies) {
			if (game.isContingent) {
				game = game.randomNext(this.random);
			} else {
				moves = game.moves();
				if (!moves) { // If game state is final ...
					return { 
						game: game, 
						result: game.result(), 
						plies: plies 
					};
				} else if (plies > this.horizon) { // If past horizon ...
					return { 
						game: game,
						result: obj(player, this.heuristic(game, player)),
						plies: plies
					};
				} else { // ... else advance.
					move = {};
					game.activePlayers.forEach(function (activePlayer) {
						move[activePlayer] = mc.agent ? mc.agent.decision(game, activePlayer) 
							: mc.random.choice(moves[activePlayer]);
					});
					game = game.next(move, null, plies > 0); // The original `game` argument must not be changed.
				}
			}
		}
		raise("Simulation ended unexpectedly for player ", player, " in game ", game, "!");
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'MonteCarloPlayer',
		serializer: function serialize_MonteCarloPlayer(obj) {
			var ser = HeuristicPlayer.__SERMAT__.serializer(obj),
				args = ser[0];
			args.simulationCount = obj.simulationCount;
			args.timeCap = obj.timeCap;
			args.horizon = obj.horizon;
			if (obj.agent) {
				args.agent = obj.agent;
			}
			return ser;
		}
	}
}); // declare MonteCarloPlayer


/** # UCTPlayer

Automatic player based on Upper Confidence Bound Monte Carlo tree search.
*/
players.UCTPlayer = declare(MonteCarloPlayer, {
	/** The constructor parameters may include:
	
	+ `simulationCount=30`: Maximum amount of simulations performed at each decision.
	+ `timeCap=1000ms`: Time limit for the player to decide.
	*/
	constructor: function UCBPlayer(params) {
		MonteCarloPlayer.call(this, params);
		initialize(this, params)
		/** + `explorationConstant=sqrt(2)`: The exploration factor used in the UCT selection.
		*/
			.number('explorationConstant', { defaultValue: Math.sqrt(2), coerce: true })
		;
	},
	
	/** Evaluate all child nodes of the given `gameTree` according to the [Upper Confidence Bound
	formula by L. Kocsis and Cs. Szepesvári](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.102.1296). 
	Returns one of the greatest evaluated, chosen at random.
	*/
	selectNode: function selectNode(gameTree, totalSimulationCount, explorationConstant) {
		explorationConstant = isNaN(explorationConstant) ? this.explorationConstant : +explorationConstant;
		return this.random.choice(iterable(gameTree.children).select(1).greater(function (n) {
			return n.uct.rewards / n.uct.visits + 
				explorationConstant * Math.sqrt(Math.log(totalSimulationCount) / n.uct.visits);
		}));
	},
	
	/** `evaluatedMoves(game, player)` return a sequence with the evaluated moves.
	*/
	evaluatedMoves: function evaluatedMoves(game, player) {
		var root = new GameTree(null, game),
			endTime = Date.now() + this.timeCap,
			node, simulationResult;
		root.uct = {
			pending: this.random.shuffle(root.possibleTransitions()), 
			visits: 0, 
			rewards: 0
		};
		for (var i = 0; i < this.simulationCount && Date.now() < endTime; ++i) {
			node = root;
			while (node.uct.pending.length < 1 && node.childrenCount() > 0) { // Selection
				node = this.selectNode(node, i+1, this.explorationConstant);
			}
			if (node.uct.pending.length > 0) { // Expansion
				node = node.expand(node.uct.pending.pop());
				node.uct = {
					pending: this.random.shuffle(node.possibleTransitions()),
					visits: 0,
					rewards: 0
				};
			}
			simulationResult = this.simulation(node.state, player); // Simulation
			for (; node; node = node.parent) { // Backpropagation
				++node.uct.visits;
				node.uct.rewards += (game.normalizedResult(simulationResult.result)[player] + 1) / 2;
			}
		}
		return iterable(root.children).select(1).map(function (n) {
			return [n.transition, n.uct.visits];
		});
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'UCTPlayer',
		serializer: function serialize_UCTPlayer(obj) {
			var ser = MonteCarloPlayer.__SERMAT__.serializer(obj),
				args = ser[0];
			args.explorationConstant = obj.explorationConstant;
			return ser;
		}
	}
}); // declare UCTPlayer


/** # Rule based players

Automatic players based on rules, either for evaluating game states or to choose moves.
*/
players.RuleBasedPlayer = declare(Player, {
	/** todo
	*/
	constructor: function RuleBasedPlayer(params) {
		players.HeuristicPlayer.call(this, params);
		initialize(this, params)
			/** + `rules` must be an array of functions that return either a move (if the rule 
				applies) or `null` (if the rule does not apply).
			*/
			.array('rules', { defaultValue: [] })
			/** + ``
			*/
			.func('features', { ignore: true })
			/** + the `random` generator must be an instance of `Randomness`. 
			*/
			.object('random', { defaultValue: Randomness.DEFAULT });
	},

	/** This function extracts the relevant `features` of the given game state. These data is the
	one passed to the rules.
	*/
	features: function features(game, role) {
		return [game, role]; // Please override.
	},
	
	/** To choose a move, the `rules` are checked in order. The first rule that fits decides the
	move to make. If no rule fits, a move is chosen randomly. If a rule returns a move that is not
	valid, it is ignored.
	*/
	decision: function decision(game, role) {
		var result = null,
			features = this.features(game, role),
			moves = this.movesFor(game, role);
		for (var i = 0, len = this.rules.length; i < len; i++) {
			result = this.rules[i].call(this, features);
			if (result !== null && moves.indexOf(result) >= 0) {
				return result;
			}
		}
		return this.random.choice(moves);
	},
	
	/** The rule method adds a rule to the players' list of rules.
	*/
	rule: function rule(f) {
		raiseIf(typeof(f) !== 'function', 'A rule must be in the form of a function!');
		this.rules.push(f);
		return this; // for chaining.
	},
	
	// ## Rule definition helpers ##################################################################
	
	/** The class `regExpRule` method builds a rule function based on a regular expression.
	*/
	'static regExpRule': function regExpRule(regExp, move) {
		return function (features) {
			return regExp.test(features) ? move : null;
		};
	},
	
	/** The instance method `regExpRule` adds a rule based on a regular expression to the players'
	list of rules.
	*/
	regExpRule: function regExpRule(regExp, move) {
		return this.rule(this.constructor.regExpRule(regExp, move));
	},
	
	// ## Rule based heuristics ####################################################################
	
	// ## Other utilities ##########################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'RuleBasedPlayer',
		serializer: function serialize_Player(obj) {
			var ser = Player.__SERMAT__.serializer(obj),
				args = ser[0];
			args.rules = obj.rules;
			if (obj.hasOwnProperty('features')) {
				args.features = obj.features;
			}
			return ser;
		}
	}
}); // declare RulePlayer.

/** # UserInterfacePlayer

Implementation of player user interfaces and proxies.
*/
var UserInterfacePlayer = players.UserInterfacePlayer = declare(Player, {
	/** `UserInterfacePlayer` is a generic type for all players that are proxies of user interfaces.
	*/
	constructor: function UserInterfacePlayer(params) {
		Player.call(this, params);
	},

	/** The `participate` method assigns this players role to the given role.
	*/
	participate: function participate(match, role) {
		this.role = role;
		return this;
	},
	
	/** The `decision(game, player)` of this players returns a future that will be resolved when the 
	`perform()` method is called.
	*/
	decision: function decision(game, player) {
		if (this.__future__ && this.__future__.isPending()) {
			this.__future__.resolve(new Match.commands.Quit());
		}
		this.__future__ = new Future();
		return this.__future__;
	},
	
	/**  User interfaces have to be configured to call `perform(action)` upon each significant user 
	action.players. It resolves the future returned by the `decision()` method.
	*/
	perform: function perform(action) {
		var future = this.__future__;
		if (future) {
			this.__future__ = null;
			future.resolve(action);
		}
		return !!future;
	}
}); // declare UserInterfacePlayer.

// ## User interfaces ##############################################################################

var UserInterface = players.UserInterface = declare({
	/** `UserInterface` is the base abstract type for user interfaces that display a game and allow 
	one or more players to play. The `config` argument may include the `match` being played.
	*/
	constructor: function UserInterface(config) {
		this.onBegin = this.onBegin.bind(this);
		this.onNext = this.onNext.bind(this);
		this.onEnd = this.onEnd.bind(this);
		if (config.match) {
			this.show(config.match);
		}
	},
	
	/** `show(match)` discards the current state and sets up to display the given `match`.
	*/
	show: function show(match) {
		if (this.match) {
			match.events.off('begin', this.onBegin);
			match.events.off('next', this.onNext);
			match.events.off('end', this.onEnd);
		}
		this.match = match;
		match.events.on('begin', this.onBegin);
		match.events.on('next', this.onNext);
		match.events.on('end', this.onEnd);
	},
	
	/** When the player is participated of a match, callbacks are registered to the following 
	match's events.
	
	+ `onBegin(game)` handles the `'begin'` event of the match.
	*/
	onBegin: function onBegin(game) {
		this.display(game);
	},
	
	/** + `onNext(game, next)` handles the `'move'` event of the match.
	*/
	onNext: function onNext(game, next) {
		this.display(next);
	},
	
	/** + `onEnd(game, results)` handles the `'end'` event of the match.
	*/
	onEnd: function onEnd(game, results) {
		this.results = results;
		this.display(game);
	},
	
	/** `display(game)` renders the game in this user interface. Not implemented, so please 
	override.
	*/
	display: unimplemented("UserInterface", "display"),
	
	/** `perform(action, actionRole=undefined)` makes the given player perform the action if the 
	player has a `perform()` method and is included in this UI's players.
	*/
	perform: function perform(action, actionRole) {
		iterable(this.match.players).forEach(function (pair) {
			var role = pair[0], player = pair[1];
			if (player instanceof UserInterfacePlayer && (!actionRole || player.role === actionRole)) {
				player.perform(action);
			}
		});
	}
}); // declare UserInterface.

// ### HTML based user interfaces ##################################################################

UserInterface.BasicHTMLInterface = declare(UserInterface, {
	/** `BasicHTMLInterface(config)` builds a simple HTML based UI, that renders the game on the DOM 
	using its `display()` method. The `config` argument may include:
	
	+ `document=window.document`: the DOM root.
	+ `container`: the DOM node to render the game in, or its name.
	*/
	constructor: function BasicHTMLInterface(config) {
		UserInterface.call(this, config);
		this.document = config.document || base.global.document;
		this.container = config.container;
		if (typeof this.container === 'string') {
			this.container = this.document.getElementById(this.container);
		}
	},

	/** On `display(game)` the `container` is emptied and the game is rendered using its 
	`display(ui)` method.
	*/
	display: function display(game) {
		var container = this.container, child;
		while (child = container.firstChild) { // It seems the DOM API does not provide a method for this. :-(
			container.removeChild(child);
		}
		game.display(this);
	},
	
	/** `build()` helps DOM creation. The `nodes` argument specifies DOM elements, each with an 
	array of the shape: `[tag, attributes, elements]`.
	*/
	build: function build(parent, nodes) {
		var ui = this;
		nodes.forEach(function (node) {
			var element;
			if (Array.isArray(node)) {
				element = ui.document.createElement(node[0]);
				if (node.length > 2 && node[1]) { // There are attributes.
					var attrs = node[1];
					for (var attrName in attrs) if (attr.hasOwnProperty(attrName)) {
						element.setAttribute(attrName, attrs[attrName]);
					}
				}
				if (node.length > 1 && node[node.length-1]) { // There are child elements.
					ui.build(element, node[node.length-1]);
				}
			} else if (typeof node === 'string') {
				element = ui.document.createTextNode(node);
			}
			if (element && parent) {
				parent.appendChild(element);
			}
		});
		return parent;
	}
}); // declare HTMLInterface.


/** # WebWorkerPlayer

A proxy for another player executing inside a webworker.
*/
var WebWorkerPlayer = players.WebWorkerPlayer = declare(Player, {
	/** The constructor builds a player that is a proxy for another player executing in a webworker. 
	The parameters must include:
	*/
	constructor: function WebWorkerPlayer(params) {
		Player.call(this, params);
		initialize(this, params)
			/** + `worker`: The `Worker` instance where the actual player is executing.
			*/
			.object('worker');
		this.worker.onmessage = base.Parallel.prototype.__onmessage__.bind(this);
	},
	
	/** The static `createWorker(playerBuilder)` method creates (asynchronously) and initializes a 
	web worker. The modules `creatartis-base` and `ludorum` are loaded in the webworker's root 
	namespace (`self`). If a `workerSetup` function is given, it is also run. After that, the 
	`playerBuilder` function is called and its results stored in the variable `self.PLAYER`.
	*/
	'static createWorker': function createWorker(params) {
		raiseIf('string function'.indexOf(typeof params.playerBuilder) < 0,
			"Invalid player builder: "+ params.playerBuilder +"!");
		raiseIf(params.workerSetup && 'string function'.indexOf(typeof params.workerSetup) < 0,
			"Invalid worker setup: "+ params.workerSetup +"!");
		var parallel = new base.Parallel();
		return Future.sequence([exports].concat(params.dependencies || []), function (dependency) {
			return parallel.loadModule(dependency, true);
		}).then(function () {
			return parallel.run(
				(params.workerSetup ? '('+ params.workerSetup +')(),\n' : '')+
				'self.PLAYER = ('+ params.playerBuilder +').call(self),\n'+
				'"OK"');
		}).then(function () {
			return parallel.worker;
		});
	},
	
	/** The static `create(params)` method creates (asynchronously) and initializes a 
	`WebWorkerPlayer`, with a web worker ready to play. The `params` must include the 
	`playerBuilder` function to execute on the web worker's environment.
	*/
	'static create': function create(params) {
		var WebWorkerPlayer = this;
		return WebWorkerPlayer.createWorker(params).then(function (worker) {
			return new WebWorkerPlayer({name: name, worker: worker}); 
		});
	},
	
	/** This player's `decision(game, player)` is delegated to this player's webworker, returning a 
	future that will be resolved when the parallel execution is over.
	
	Warning! If this method is called while another decision is pending, the player will assume the 
	previous match was aborted, issuing a quit command.
	*/
	decision: function decision(game, player) {
		if (this.__future__ && this.__future__.isPending()) {
			this.__future__.resolve(Match.commandQuit);
		}
		this.__future__ = new Future();
		this.worker.postMessage('PLAYER.decision(Sermat.mat('+ JSON.stringify(Sermat.ser(game)) +'), '+ JSON.stringify(player) +')');
		return this.__future__;
	}
}); // declare WebWorkerPlayer

/** # Aleatory

Aleatories are different means of non determinism that games can use, like: dice, card decks, 
roulettes, etc. They are used by `Contingent` game states.
*/
var Aleatory = exports.aleatories.Aleatory = declare({
	/** The base class implements an integer uniform random variable between a minimum and maximum
	value (inclusively).
	*/
	constructor: function Aleatory(min, max) {
		switch (arguments.length) {
			case 1: this.range = [1, min]; break;
			case 2: this.range = [min, max]; break;
		}
	},
	
	/** The `Aleatory.value()` can be used to obtain a valid random value for the random variable.
	*/
	value: function value(random) {
		return (random || Randomness.DEFAULT).randomInt(this.range[0], this.range[1] + 1);
	},
		
	/** In order to properly search a game tree with aleatory nodes, the random variables' 
	distribution has to be known. `Aleatory.distribution()` computes the histogram for the random 
	variables on which this aleatory depends, as a sequence of pairs `[value, probability]`.
	
	By default it returns a flat histogram, assuming the random variable is uniform.
	*/
	distribution: function () {
		var min = this.range[0], 
			max = this.range[1],
			probability = 1 / (max - min + 1);
		return Iterable.range(min, max + 1).map(function (value) {
			return [value, probability];
		});
	},
	
	// ## Utility methods ##########################################################################

	/** The `tries` function calculates the distribution of the number of successes, trying `n` 
	times with a chance of `p`.
	*/
	'static tries': function tries(p, n) {
		var combinations = base.math.combinations;
		return n <= 0 ? [[0, 1]] : Iterable.range(n + 1).map(function (i) {
			return [i, Math.pow(p, i) * Math.pow(1 - p, n - i) * combinations(n, i)];
		}).toArray();
	},
	
	/** Two `aggregate`d distributions make a new distribution with a combination of the domains. By
	default the value combination function `comb` is the sum. An equality test `eq` can be provided
	if the combinations cannot be compared with `===`.
	*/
	'static aggregate': function aggregate(dist1, dist2, comb, eq) {
		var distR = [];
		Iterable.product(dist1, dist2).forEachApply(function (p1, p2) {
			var v = comb ? comb(p1[0], p2[0]) : p1[0] + p2[0];
			for (var i = 0; i < distR.length; i++) {
				if (eq ? eq(distR[i][0], v) : distR[i][0] === v) {
					distR[i][1] += p1[1] * p2[1];
					return;
				}
			}
			distR.push([v, p1[1] * p2[1]]);
		});
		return distR;
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Aleatory',
		serializer: function serialize_Aleatory(obj) {
			return [obj.range[0], obj.range[1]];
		}
	}
}); // declare Aleatory.


/** # UniformAleatory

An uniform aleatory is one that ranges over a set of values, all of which have the same probability
of occurrence.
*/
var UniformAleatory = exports.aleatories.UniformAleatory = declare(Aleatory, {
	/** An uniform aleatory is defined by a sequence of `values`. The sequence cannot be empty, but
	one value is supported as weird as it may be.
	*/
	constructor: function UniformAleatory(values) {
		this.__values__ = iterable(values).toArray();
		raiseIf(this.__values__.length < 1, "No values for aleatory!");
	},

	/** The `value` is one of the `values` used to build this aleatory, picked at random.
	*/
	value: function value(random) {
		return (random || Randomness.DEFAULT).choice(this.__values__);
	},
	
	/** The `distribution` of an uniform aleatory is a sequence of pairs `[value, probability]`.
	*/
	distribution: function distribution() {
		var prob = 1 / this.__values__.length;
		return this.__values__.map(function (v) {
			return [v, prob];
		});
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'UniformAleatory',
		serializer: function serialize_UniformAleatory(obj) {
			return [obj.__values__];
		}
	}
});

/** # CustomAleatory

An custom aleatory is defined by its own distribution.
*/
var CustomAleatory = exports.aleatories.CustomAleatory = declare(Aleatory, {
	/** An uniform aleatory is defined by a sequence of `values`. The sequence cannot be empty, but
	one value is supported as weird as it may be.
	*/
	constructor: function CustomAleatory(distribution) {
		this.__distribution__ = iterable(distribution).toArray();
	},

	/** The `value` is picked at random respecting the distribution's probabilities.
	*/
	value: function value(random) {
		return (random || Randomness.DEFAULT).weightedChoice(this.__distribution__);
	},
	
	distribution: function distribution() {
		return this.__distribution__;
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'CustomAleatory',
		serializer: function serialize_CustomAleatory(obj) {
			return [obj.__distribution__];
		}
	}
});

/** # Dice aleatories

Implementations of common dice and related functions.
*/
aleatories.dice = {
	/** Common dice variants.
	*/
	D4: new Aleatory(1, 4),
	D6: new Aleatory(1, 6),
	D8: new Aleatory(1, 8),
	D10: new Aleatory(1, 10),
	D12: new Aleatory(1, 12),
	D20: new Aleatory(1, 20),
}; // dice.

/** The `sumProbability` that rolling `n` dice of `s` sides yields a sum equal to `p`. Check the 
article at [Mathworld](http://mathworld.wolfram.com/Dice.html).
*/
aleatories.sumProbability = function sumProbability(p, n, s) {
	n = n|0;
	s = s|0;
	p = p|0;
	if (isNaN(n) || isNaN(s) || isNaN(p) || n < 1 || s < 2) {
		return NaN;
	} else if (p < n || p > n * s) {
		return 0;
	} else {
		var factorial = base.math.factorial,
			fact_n = factorial(n),
			fact_n_1 = fact_n / n; // factorial(n - 1)
		return Math.pow(s, -n) *
			Iterable.range(0, Math.floor((p - n) / s) + 1).map(function (k) {
				var comb1 = fact_n / factorial(k) / factorial(n - k),
					x = p - s * k - 1,
					comb2 = factorial(x) / fact_n_1 / factorial(x - n + 1);
				return (k % 2 ? -1 : 1) * comb1 * comb2;
			}).sum();
	}
};

/** # Predefined

Simple reference games with a predefined outcome, mostly for testing purposes.
*/
games.Predefined = declare(Game, {
	name: 'Predefined',
	height: 5,
	width: 5,
	
	/** `Predefined` is a pseudogame used for testing purposes. It will give `width` amount of 
	moves for each player until `height` moves pass. Then the match is finished with the given 
	`results`, or a tie as default.
	*/
	constructor: function Predefined(activePlayer, results, height, width) {
		if (results) {
			this.__results__ = results;
			this.players = Object.keys(results);
		}
		Game.call(this, activePlayer);
		if (!isNaN(height)) {
			this.height = +height;
		}
		if (!isNaN(width)) {
			this.width = +width;
		}
	},
	
	/** Default players for `Predefined`: A and B.
	*/
	players: ['A', 'B'],

	/** Default results for Predefined: a tie between A and B.
	*/
	__results__: {'A': 0, 'B': 0},

	/** Moves for a `Predefined` are numbers from 1 to this.width. 
	*/
	moves: function moves() {
		if (this.height > 0) {
			return obj(this.activePlayer(), 
				Iterable.range(1, this.width + 1).toArray()
			);
		}
	},

	/** Returned the predefined results if height is zero or less.
	*/
	result: function result() {
		return this.height > 0 ? null : this.__results__;
	},

	/** Moves are completely irrelevant. They only advance in the match.
	*/
	next: function next(moves, haps, update) {
		raiseIf(haps, 'Haps are not required (given ', haps, ')!');
		if (update) {
			this.height--;
			this.activatePlayers(this.opponent());
			return this;
		} else {
			return new this.constructor(this.opponent(), this.__results__, this.height - 1, this.width);
		}
	},
	
	// ## Utility methods ##########################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Predefined',
		serializer: function serialize_Predefined(obj) {
			return [obj.activePlayer(), obj.__results__, obj.height, obj.width];
		}
	}
}); // declare Predefined.


/** # Choose2Win

Choose2Win is a simple silly game. Each turn one of the players can decide to win, to lose or to 
pass the turn. It is meant to be used only for testing Ludorum, since a game can hardly become less 
interesting than this.
*/
games.Choose2Win = declare(Game, {
	/** The constructor takes a number of turns for the game to last (`Infinity` by default), the 
	active player and the winner if the game has ended. 
	*/
	constructor: function Choose2Win(turns, activePlayer, winner) {
		Game.call(this, activePlayer);
		this.__turns__ = isNaN(turns) ? Infinity : +turns;
		this.__winner__ = winner;		
	},

	name: 'Choose2Win',
	
	/** Players of this dummy game are labeled This and That.
	*/
	players: ['This', 'That'],

	/** Every turn the active player's moves are: `'win'`, `'lose'` and `'pass'`.
	*/
	moves: function moves() {
		if (!this.__winner__ && this.__turns__ > 0) {
			return obj(this.activePlayer(), ['win', 'lose', 'pass']);
		}
	},

	/** Victory is for whom chooses to win first. Defeat is for whom chooses to lose first. A draw 
	only results when the limit of turns (if any) is met.
	*/
	result: function result() {
		return this.__winner__ ? this.victory(this.__winner__) :
			this.__turns__ < 1 ? this.draw() : null;
	},

	/** If a player moves to win or lose, a final game state is returned. Else the game goes on.
	*/
	next: function next(moves, haps, update) {
		var activePlayer = this.activePlayer(),
			opponent = this.opponent(activePlayer);
		raiseIf(!moves.hasOwnProperty(activePlayer), 
			'No move for active player ', activePlayer, ' at ', this, '!');
		raiseIf(haps, 'Haps are not required (given ', haps, ')!');
		var winner = { win: activePlayer, lose: opponent, pass: undefined },
			move = moves[activePlayer];
		if (!winner.hasOwnProperty(move)) {
			raise('Invalid move ', moves[activePlayer], ' for ', activePlayer, ' at ', this, '!');
		} else if (update) {
			this.activatePlayers(opponent);
			this.__turns__--;
			this.__winner__ = winner[move];
			return this;
		} else {
			return new this.constructor(this.__turns__ - 1, opponent, winner[move]);
		}
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Choose2Win',
		serializer: function serialize_Choose2Win(obj) {
			var r = [obj.__turns__, obj.activePlayer()];
			if (obj.__winner__) {
				r.push(obj.__winner__);
			}
			return r;
		}
	}
}); // declare Choose2Win.

/** # ConnectionGame

Base class for a subset of the family of [connection games](http://en.wikipedia.org/wiki/Connection_game), 
which includes [TicTacToe](http://en.wikipedia.org/wiki/Tic-tac-toe), 
[ConnectFour](http://en.wikipedia.org/wiki/Connect_Four) and [Gomoku](http://en.wikipedia.org/wiki/Gomoku).
It implements a rectangular board, the placing of the pieces and the checks for lines.
*/
games.ConnectionGame = declare(Game, {
	/** Boards by default have 9 rows ...
	*/
	height: 9,
	
	/** ... and 9 columns.
	*/
	width: 9,
	
	/** A player has to make a line of 5 pieces to win, by default.
	*/
	lineLength: 5,

	/** The constructor takes the active player and the board given as a string. For the game's 
	`board` this last string argument is used to build a [`CheckerboardFromString`](../utils/CheckerboardFromString.js.html).
	*/
	constructor: function ConnectionGame(activePlayer, board) {
		Game.call(this, activePlayer);
		this.board = (board instanceof CheckerboardFromString) ? board :
			new CheckerboardFromString(this.height, this.width, 
				(board || '.'.repeat(this.height * this.width)) +''
			);
	},

	name: 'ConnectionGame',
	
	/** This base implementations names its players First and Second.
	*/
	players: ['First', 'Second'],
	
	/** Lines in the board are cached to accelerate the result calculation. */
	__lines__: (function () {
		var CACHE = {};
		function __lines__(height, width, lineLength) {
			var key = height +'x'+ width +'/'+ lineLength;
			if (!CACHE.hasOwnProperty(key)) {
				var board = new CheckerboardFromString(height, width, '.'.repeat(height * width));
				CACHE[key] = board.lines().map(function (line) {
					return line.toArray();
				}, function (line) {
					return line.length >= lineLength;
				}).toArray();
			}
			return CACHE[key];
		}
		__lines__.CACHE = CACHE;
		return __lines__;
	})(),
	
	/** A connection game ends when either player gets the required amount of pieces aligned (either
	horizontally, vertically or diagonally), hence winning the game. The match ends in a tie if the 
	board gets full.
	*/
	result: function result() {
		if (this.hasOwnProperty('__result__')) {
			return this.__result__;
		}
		var lineLength = this.lineLength,
			lines = this.board.asStrings(this.__lines__(this.height, this.width, lineLength)).join(' ');
		for (var i = 0; i < this.players.length; ++i) {
			if (lines.indexOf(i.toString(36).repeat(lineLength)) >= 0) {
				return this.__result__ = this.victory([this.players[i]]);
			}
		}
		if (lines.indexOf('.') < 0) { // No empty squares means a tie.
			return this.__result__ = this.draw();
		}
		return this.__result__ = null; // The game continues.
	},
	
	/** The active player can place a piece in any empty square in the board. The moves are indices
	in the board's string representation.
	*/
	moves: function moves() {
		if (this.hasOwnProperty('__moves__')) {
			return this.__moves__;
		} else if (this.result()) {
			this.__moves__ = null;
		} else {
			var board = this.board;
			this.__moves__ = obj(this.activePlayer(),
				board.coordinates().filter(function (coord) {
					return board.isEmptySquare(coord);
				}).toArray()
			);
		}
		return this.__moves__;
	},

	/** To get from one game state to the next, an active player's piece in the square indicated by 
	its move.
	*/
	next: function next(moves, haps, update) {
		raiseIf(haps, "Haps are not required (given ", haps, ")!");
		var activePlayer = this.activePlayer(),
			playerIndex = this.players.indexOf(activePlayer),
			coord = moves[activePlayer],
			nextPlayer = (playerIndex + 1) % this.players.length,
			nextBoard = this.board.place(coord, playerIndex.toString(36));
		if (update) {
			this.activatePlayers(nextPlayer);
			this.board = nextBoard;
			return this;
		} else {
			return new this.constructor(nextPlayer, nextBoard);
		}
	},
	
	// ## User intefaces ###########################################################################
	
	/** The `display(ui)` method is called by a `UserInterface` to render the game state. The only 
	supported user interface type is `BasicHTMLInterface`. The look can be configured using CSS 
	classes.
	*/
	display: function display(ui) {
		raiseIf(!ui || !(ui instanceof UserInterface.BasicHTMLInterface), "Unsupported UI!");
		var moves = this.moves(),
			activePlayer = this.activePlayer(),
			board = this.board;
		moves = moves && moves[activePlayer];
		var table = this.board.renderAsHTMLTable(ui.document, ui.container, function (data) {
				data.className = data.square === '.' ? 'ludorum-empty' : 'ludorum-player'+ data.square;
				data.innerHTML = data.square === '.' ? "&nbsp;" : "&#x25CF;";
				var i = data.coord[0] * board.height + data.coord[1];
				if (moves && moves.indexOf(i) >= 0) {
					data.move = i;
					data.activePlayer = activePlayer;
					data.onclick = ui.perform.bind(ui, data.move, activePlayer);
				}
			});
		return ui;
	},

	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'ConnectionGame',
		serializer: function serialize_ConnectionGame(obj) {
			return [obj.activePlayer(), obj.board];
		}
	}
}); // declare ConnectionGame.

/** # Odds & Evens

[Odds and evens](http://en.wikipedia.org/wiki/Odds_and_evens) is a classic child game, implemented 
as a simple example of a simultaneous game, i.e. a game in which more than one player can move at 
any given turn.
*/
games.OddsAndEvens = declare(Game, {
	name: 'OddsAndEvens',
	
	/** The constructor takes:
		+ `turns=1`: The number of turns remaining in the game.
		+ `points=<zero for every player>`: The scores for every player.
	*/
	constructor: function OddsAndEvens(turns, points) {
		Game.call(this, this.players); // Both players are active.
		this.turns = isNaN(turns) ? 1 : +turns;
		this.points = points || { Evens: 0, Odds: 0 };
	},
	
	/** Players for odds and evens are called like that: Evens and Odds.
	*/
	players: ['Evens', 'Odds'],

	/** Each turn both players draw either a 1 or a 2.
	*/
	moves: function moves() {
		return this.turns < 1 ? null : { Evens: [1, 2], Odds: [1, 2] };
	},

	/** The winner is the player with more points.
	*/
	result: function result() {
		var pointDifference = this.points.Evens - this.points.Odds;
		return this.turns > 0 ? null : {
			Evens: +pointDifference,
			Odds: -pointDifference
		};
	},

	/** The player matching the parity of the moves sum earns a point.
	*/
	next: function next(moves, haps, update) {
		raiseIf(typeof moves.Evens !== 'number' || typeof moves.Odds !== 'number',
			"Invalid moves ", moves, "!");
		raiseIf(haps, "Haps are not required (given ", haps, ")!");
		var parity = (moves.Evens + moves.Odds) % 2 === 0,
			points = {
				Evens: this.points.Evens + (parity ? 1 : 0),
				Odds: this.points.Odds + (parity ? 0 : 1)
			};
		if (update) {
			this.turns--;
			this.points = points;
			return this;
		} else {
			return new this.constructor(this.turns - 1, points);
		}
	},

	// ## Utility methods ##########################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'OddsAndEvens',
		serializer: function serialize_OddsAndEvens(obj) {
			return [obj.turns, obj.points];
		}
	}
}); // declare OddsAndEvens.


/** # TicTacToe.

Implementation of the traditional [Tic-Tac-Toe game](http://en.wikipedia.org/wiki/Tictactoe).
*/
games.TicTacToe = declare(Game, {
	name: 'TicTacToe',

	/** The constructor takes the `activePlayer` (`"Xs"` by default) and the `board` as a string 
	(empty board as default).
	*/
	constructor: function TicTacToe(activePlayer, board) {
		Game.call(this, activePlayer);
		this.board = board || '_________';
	},
	
	/** This game's players are `"Xs"` and `"Os"`.
	*/
	players: ['Xs', 'Os'],
	
	/** A match ends with a victory for any player that has three marks in line, or a draw if the 
	board is full.
	*/
	result: (function () {
		return function result() {			
			if (this.board.match(this.WIN_X)) { // Xs wins.
				return this.victory(["Xs"]);
			} else if (this.board.match(this.WIN_O)) { // Os wins.
				return this.victory(["Os"]);
			} else if (this.board.indexOf('_') < 0) { // No empty squares means a tie.
				return this.tied();
			} else {
				return null; // The game continues.
			}
		};
	})(),
	
	/** The active player's `moves()` are the indexes of empty squares in the board.
	*/
	moves: function moves() {
		if (!this.result()) {
			var result = {};
			result[this.activePlayer()] = iterable(this.board).filter(function (chr, i) {
				return chr === '_'; // Keep only empty squares.
			}, function (chr, i) {
				return i; // Grab the index.
			}).toArray();
			return result;
		} else {
			return null;
		}		
	},
	
	/** The `next` game state is calculated by putting the mark of the active player in the square 
	indicated by the given move.
	*/
	next: function next(moves, haps, update) {
		raiseIf(haps, 'Haps are not required (given ', haps, ')!');
		var activePlayer = this.activePlayer(), 
			move = +moves[activePlayer];
		if (isNaN(move) || this.board.charAt(move) !== '_') {
			throw new Error('Invalid move '+ JSON.stringify(moves) +' for board '+ this.board +
				' (moves= '+ JSON.stringify(moves) +').');
		}
		var nextBoard = this.board.substring(0, move) + activePlayer.charAt(0) + this.board.substring(move + 1);
		if (update) {
			this.activatePlayers(this.opponent(activePlayer));
			this.board = nextBoard;
			return this;
		} else {
			return new this.constructor(this.opponent(activePlayer), nextBoard);
		}
	},

	// ## Utility methods ##########################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'TicTacToe',
		serializer: function serialize_TicTacToe(obj) {
			return [obj.activePlayer(), obj.board];
		}
	},
	
	/** The `board` is hashed by converting it to a integer in base 3.
	*/
	__hash__: function __hash__(board) {
		var VALUE = {'_': 0, 'X': 1, 'O': 2};
		return parseInt((board || this.board).split('').map(function (chr) {
			return VALUE[chr];
		}).join(''), 3);
	},
	
	/** A `symmetryHash` is a hash value for the game state that can be used in a cache or 
	transposition table to speed up game tree searches. Many game states may share the same hash
	value if they can be considered equivalent.
	
	In the case of Tictactoe, every board is equivalent with any rotation or symmetry.
	*/
	symmetryHash: (function () {
		var SYMMETRIES = '210543876 678345012 630741852 258147036 876543210 852741630 036147258'
			.split(' ').map(function (str) {
				return str.split('').map(function (chr) {
					return +chr;
				});
			}),
			f =	function symmetricHash() {
				var board = this.board,
					syms = SYMMETRIES.map(function (sym) {
						return sym.map(function (i) {
							return board.charAt(i);
						}).join('');
					});
				syms.sort();
				return this.__hash__(syms[0]);
			};
		f.SYMMETRIES = SYMMETRIES;
		return f;
	})(),
	
	// ## User intefaces ###########################################################################
	
	/** `printBoard()` creates a text (ASCII) version of the board.
	*/
	printBoard: function printBoard() {
		var board = this.board;
		return [0,3,6].map(function (i) {
			return board.substr(0,3).split('').join('|');
		}).join('\n-+-+-\n');
	},
	
	// ## Heuristics and AI ########################################################################
	
	/** `TicTacToe.heuristics` is a bundle of helper functions to build heuristic evaluation 
	functions for this game.
	*/
	"static heuristics": {
		/** `heuristicFromWeights(weights)` builds an heuristic evaluation function from weights for
		each square in the board. The result of the function is the weighted sum, empty squares 
		being ignored, opponent squares considered negative.
		*/
		heuristicFromWeights: function heuristicFromWeights(weights) {
			var weightSum = iterable(weights).map(Math.abs).sum();
			function __heuristic__(game, player) {
				var playerChar = player.charAt(0);
				return iterable(game.board).map(function (square, i) {
					return (square === '_' ? 0 : weights[i] * (square === playerChar ? 1 : -1));
				}).sum() / weightSum;
			}
			__heuristic__.weights = weights;
			return __heuristic__;
		}
	},
	
	// ## TicTacToe type initialization ############################################################
	
	'': function () { 
		/** The regular expressions `WIN_X` and `WIN_O` used in the victory test are calculated 
		here.
		*/
		var board3x3 = new CheckerboardFromString(3, 3, '_'.repeat(9)),
			lines = board3x3.sublines(board3x3.lines(), 3);
		this.prototype.WIN_X = new RegExp(board3x3.asRegExps(lines, 'X', '.'));
		this.prototype.WIN_O = new RegExp(board3x3.asRegExps(lines, 'O', '.'));
		
		/** The `defaultHeuristic `for TicTacToe is based on weights for each square. Center is 
		worth 5, corners 2 and the other squares 1.
		*/
		this.heuristics.defaultHeuristic = this.heuristics
			.heuristicFromWeights([2,1,2,1,5,1,2,1,2]);
	}	
}); // declare TicTacToe

/** # ToadsAndFrogs

Implementation of the [Toads & Frogs](http://en.wikipedia.org/wiki/Toads_and_Frogs_%28game%29) game.
*/
games.ToadsAndFrogs = declare(Game, {
	name: 'ToadsAndFrogs',
	
	/** Constructor of Toads & Frogs games. The first player is always _Toads_. The default board is
	`'TTT__FFF'`.
	*/
	constructor: function ToadsAndFrogs(activePlayer, board) {
		Game.call(this, activePlayer);
		this.board = board || ToadsAndFrogs.board();
	},
	
	/** A `board` builder for Toads & Frogs. These boards are single rows with a given number of 
	`chips` for each player (toads to the left and frogs to the right) separated by the given number 
	of empty spaces (`separation`).
	*/
	"static board": function board(chips, separation) {
		chips = isNaN(chips) ? 3 : +chips;
		separation = isNaN(separation) ? 2 : +separation;
		return 'T'.repeat(chips) + '_'.repeat(separation) + 'F'.repeat(chips);
	},
	
	/** There are two roles in this game: _Toads_ and _Frogs_.
	*/
	players: ['Toads', 'Frogs'],
	
	/** The match finishes when one player cannot move, hence losing the game.
	*/
	result: function result() {
		return this.moves() ? null : this.defeat();
	},
	
	/** The active players `moves` is a list of square indexes (integers) in the board, where chips
	can be moved in one of the two ways possible in this game.
	*/
	moves: function moves() {
		var activePlayer = this.activePlayer(),
			result = {}, 
			ms = result[activePlayer] = [];
		this.board.replace(activePlayer == this.players[0] ? /TF?_/g : /_T?F/g, function (m, i) {
			ms.push(i);
			return m;
		});
		return ms.length > 0 ? result : null;
	},
	
	/** The board of the next game state is calculated by applying the given move.
	*/
	next: function next(moves, haps, update) {
		raiseIf(haps, 'Haps are not required (given ', haps, ')!');
		var activePlayer = this.activePlayer(), 
			move = moves[activePlayer], 
			chip = activePlayer.charAt(0),
			board = this.board,
			nextBoard;
		if (board.substr(move, 2) == 'T_') {
			nextBoard = board.substring(0, move) + '_T' + board.substring(move + 2);
		} else if (board.substr(move, 2) == '_F') {
			nextBoard = board.substring(0, move) + 'F_' + board.substring(move + 2);
		} else if (board.substr(move, 3) == 'TF_') {
			nextBoard = board.substring(0, move) + '_FT' + board.substring(move + 3);
		} else if (board.substr(move, 3) == '_TF') {
			nextBoard = board.substring(0, move) + 'FT_' + board.substring(move + 3);
		} else {
			throw new Error('Invalid move ', move, ' for board <', board, '>.');
		}
		if (update) {
			this.activatePlayers(this.opponent());
			this.board = nextBoard;
			return this;
		} else {
			return new this.constructor(this.opponent(), nextBoard);
		}
	},

	// ## Utility methods ##########################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'ToadsAndFrogs',
		serializer: function serialize_ToadsAndFrogs(obj) {
			return [obj.activePlayer(), obj.board];
		}
	},
	
	/** The game state is hashed by converting the concatenation of the `activePlayer` and the 
	`board` it to a integer in base 3.
	*/
	__hash__: function __hash__(activePlayer, board) {
		var VALUE = {'_': 0, 'T': 1, 'F': 2};
		activePlayer = (activePlayer || this.activePlayer()).charAt(0);
		board = board || this.board;
		return parseInt((activePlayer + board).split('').map(function (chr) {
			return VALUE[chr];
		}).join(''), 3);
	}
}); // declare ToadsAndFrogs


/** # Pig.

[Pig](http://en.wikipedia.org/wiki/Pig_%28dice_game%29) is a simple dice betting game, used as an 
example of a game with random variables.
*/
games.Pig = declare(Game, {
	name: 'Pig',
	
	/** The constructor takes:
	
		+ `activePlayer='One'`: The active player.
		+ `goal=100`: The amount of points a player has to reach to win the game.
		+ `scores`: The scores so far in the match.
		+ `rolls`: The rolls the active player has made in his turn.
	*/
	constructor: function Pig(activePlayer, goal, scores, rolls) {
		Game.call(this, activePlayer);
		this.goal = isNaN(goal) ? 100 : +goal;
		this.__scores__ = scores || iterable(this.players).zip([0, 0]).toObject();
		this.__rolls__ = rolls || [];
	},
	
	/** Players for Pig are named `One`, `Two`.
	*/
	players: ['One', 'Two'],

	/** The active player can either hold and pass the turn, or roll.
	*/
	moves: function moves() {
		if (!this.result()) {
			var activePlayer = this.activePlayer(),
				currentScore = this.__scores__[activePlayer] + iterable(this.__rolls__).sum();
			return obj(activePlayer, this.__rolls__.length < 1 ? ['roll'] :
				currentScore >= this.goal ? ['hold'] : ['roll', 'hold']);
		}
	},

	/** A Pig match finishes when one player reaches or passes the goal score. The result for each 
	player is the difference between its score and its opponent's score.
	*/
	result: function result() {
		var score0 = this.__scores__[this.players[0]],
			score1 = this.__scores__[this.players[1]];
		if (score0 >= this.goal || score1 >= this.goal) {
			var r = {};
			r[this.players[0]] = Math.min(this.goal, score0) - Math.min(this.goal, score1);
			r[this.players[1]] = -r[this.players[0]];
			return r;
		}
	},

	/** If the active player holds, it earns the sum of the rolls made so in its turn. If the move 
	is roll, a die is rolled. A roll of 1 stops the this turn and the active player earns no 
	points. A roll of 2 or up, makes the turn continue.
	
	For this game mechanic, an [contingent game state](../Contingent.js.html) is used. If the move 
	is `roll`, an instance of this class is build and returned using the [dice shotcuts](
	../aleatories/dice.js.html) as random variables. This aleatoric game state will call the `next` 
	method again with the same moves and the values of the random variables, and then the match will
	continue.
	*/
	next: function next(moves, haps, update) {
		var activePlayer = this.activePlayer(),
			move = moves && moves[activePlayer];
		raiseIf(!move, 'No move for active player ', activePlayer, ' at ', this, '!');
		var nextPlayer = this.opponent(),
			nextScores = this.__scores__,
			nextRolls = [];
		if (move === 'hold' || move === 'roll') {
			if (move === 'hold') {
				nextScores = copy(nextScores);
				nextScores[activePlayer] += iterable(this.__rolls__).sum();
			} else { // if (move === 'roll') {
				var roll = (haps && haps.die)|0;
				if (!roll) { // Dice has not been rolled.
					return new Contingent(this, moves, { die: aleatories.dice.D6 }, update);
				} else if (roll > 1) { // Dice has been rolled.
					nextPlayer = activePlayer;
					nextRolls = this.__rolls__.concat(roll);
					return new this.constructor(activePlayer,  this.goal, this.__scores__, this.__rolls__.concat(roll));
				}
			}
			if (update) {
				this.activatePlayers(nextPlayer);
				this.__scores__ = nextScores;
				this.__rolls__ = nextRolls;
				return this;
			} else {
				return new this.constructor(nextPlayer, this.goal, nextScores, nextRolls);
			}
		} else {
			raise("Invalid moves ", JSON.stringify(moves), " at ", this, "!");
		}
	},
	
	// ## Utility methods ##########################################################################

	/** The `resultBounds` for a Pig game are estimated with the goals.
	*/
	resultBounds: function resultBounds() {
		return [-this.goal, +this.goal];
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Pig',
		serializer: function serialize_Pig(obj) {
			return [obj.activePlayer(), obj.goal, obj.__scores__, obj.__rolls__];
		}
	}
}); // Pig.


/** # Mutropas

Mutropas is a game invented for Ludorum as a simple example of a game of hidden (a.k.a. incomplete)
information. It is also a simultaneous game.
*/
games.Mutropas = declare(Game, {
	name: 'Mutropas',
	
	/** The players' roles are `"Left"` and `"Right"`.
	*/
	players: ['Left', 'Right'],

	/** The constructor takes an `args` object with:
	
	+ `pieces`: an object with the available pieces for each player. By default pieces get randomly
	dealt.
	
	+ `scores`: an object with current score for each player (0 by default for all players).
	
	+ `random`: the pseudorandom number generator to use (`base.Randomness.DEFAULT` by default).
	*/
	constructor: function Mutropas(args) {
		Game.call(this, this.players);
		args = args || {};
		this.playedPieces = args.playedPieces || [];
		this.pieces = args.pieces || this.dealPieces();
		this.__scores__ = args.scores || obj(this.players[0], 0, this.players[1], 0);
	},
	
	
	/** All the pieces to be used in a match of Mutropas are stored in `allPieces`, which by default
	has the numbers from 0 to 8.
	*/
	allPieces: Iterable.range(9).toArray(),	
	
	/** The method `dealPieces` is used to split the pieces randomly between all players. Half the
	pieces go to each player, and one is left out.
	*/
	dealPieces: function dealPieces(random) {
		random = random || Randomness.DEFAULT;
		var piecesPerPlayer = (this.allPieces.length / 2)|0,
			split1 = random.split(piecesPerPlayer, this.allPieces),
			split2 = random.split(piecesPerPlayer, split1[1]);
		return obj(this.players[0], split1[0], this.players[1], split2[0]);
	},
	
	/** Mutropas is a simultaneous game. Hence every turn all players can move. The moves are the
	pieces of each player that have not been played.
	*/
	moves: function moves() {
		return this.result() ? null : copy({}, this.pieces);
	},
	
	/** If all pieces are put in a circle, each piece beats half the pieces next to it, and it is 
	beaten by half the pieces before it. For example if `allPieces` where `[0,1,2,3,4]`:
	
	+ piece `1` would beat pieces `2` and `3`, and lose against `4` and `0`,
	+ piece `2` would beat pieces `3` and `4`, and lose against `0` and `1`,
	+ piece `4` would beat pieces `0` and `1`, and lose against `2` and `3`,
	
	The `moveResult` returns 1 if `piece1` beats `piece2` or -1 if otherwise.
	*/
	moveResult: function moveResult(piece1, piece2) {
		var upperBound = iterable(this.allPieces).max(0) + 1;
		if (piece1 < piece2) {
			return piece2 - piece1 <= (upperBound / 2) ? 1 : -1;
		} else if (piece1 > piece2) {
			return piece1 - piece2 >= (upperBound / 2) + 1 ? 1 : -1;
		} else {
			return 0;
		}
	},
	
	/** Each turn all players play a piece, and the player who plays the greatest piece wins a 
	point.
	*/
	next: function next(moves, haps, update) {
		raiseIf(haps, 'Haps are not required (given ', haps, ')!');
		var player0 = this.players[0], player1 = this.players[1],
			move0 = moves[player0], move1 = moves[player1],
			pieces = this.pieces;
		raiseIf(pieces[player0].indexOf(move0) < 0, "Invalid move ", JSON.stringify(move0),
			" for player ", player0, "! (moves= ", JSON.stringify(moves), ")");
		raiseIf(pieces[player1].indexOf(move1) < 0, "Invalid move ", JSON.stringify(move1),
			" for player ", player1, "! (moves= ", JSON.stringify(moves), ")");
		var moveResult = this.moveResult(move0, move1),
			nextPlayedPieces = this.playedPieces.concat([move0, move1]),
			nextPieces = obj(
				player0, pieces[player0].filter(function (p) { 
					return p !== move0; 
				}), 
				player1, pieces[player1].filter(function (p) { 
					return p !== move1;
				})
			),
			nextScores = obj(
				player0, this.__scores__[player0] + moveResult,
				player1, this.__scores__[player1] - moveResult
			);
		if (update) {
			this.playedPieces = nextPlayedPieces;
			this.pieces = nextPieces;
			this.__scores__ = nextScores;
			return this;
		} else {
			return new this.constructor({
				random: this.random,
				playedPieces: nextPlayedPieces,
				pieces: nextPieces,
				scores: nextScores
			});
		}
	},
	
	/** The game's `score` is simply the sum of the move results for each player.
	*/
	scores: function scores() {
		return copy({}, this.__scores__);
	},
	
	/** A game of Mutropas ends when the players have no more pieces to play. The result is the 
	difference in scores.
	*/
	result: function result() {
		var players = this.players;
		if (this.playedPieces.length >= this.allPieces.length - 1) {
			var scores = this.scores();
			return this.zerosumResult(scores[players[0]] - scores[players[1]], players[0]);
		} else {
			return null;
		}
	},
	
	// ## Game views ###############################################################################
	
	/** The method `__possiblePieces__` calculates the pieces the `player` may have.
	*/
	__possiblePieces__: function __possiblePieces__(player) {
		var playedPieces = this.playedPieces,
			opponentPieces = this.pieces[this.opponent(player)],
			possiblePieces = iterable(this.allPieces).filter(function (p) {
				return playedPieces.indexOf(p) < 0 && // p has not been played yet ...
					opponentPieces.indexOf(p) < 0; // ... and the opponent does not have it.
			});
		return possiblePieces.combinations(possiblePieces.count() - 1);
	},
	
	/** In this view of the game the hidden information is modelled as random variables. The 
	aleatory that is returned ranges over all possible piece sets that the opponent of the given
	`player` may have. After each possibility the assumption is maintained for the rest of the
	game.
	
	This allows to model the uncertainty that each player has about its opponent's pieces. By doing
	so an artificial player that searches the game space cannot infer the pieces the opponent has,
	and hence it cannot cheat.
	*/	
	view: function view(player) {
		var opponent = this.opponent(player);
		return new Contingent({ pieces: new UniformAleatory(this.__possiblePieces__(opponent)) }, this);
	},
	
	// ## Utility methods ##########################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Mutropas',
		serializer: function serialize_Mutropas(obj) {
			return [{
				pieces: obj.pieces, 
				playedPieces: obj.playedPieces,
				scores: obj.__scores__
			}];
		}
	}
}); // declare Mutropas

/** # Bahab

Bahab is a chess-like board game originally designed for Ludorum.
*/
games.Bahab = declare(Game, {
	name: 'Bahab',
	
	/** Players are `Uppercase` and `Lowercase`.
	*/
	players: ['Uppercase', 'Lowercase'],
	
	/** The constructor takes the `activePlayer` (Uppercase by default) and the `board` as a string 
	(`initialBoard` by default).
	*/
	constructor: function Bahab(activePlayer, board) {
		Game.call(this, activePlayer);
		this.board = board instanceof CheckerboardFromString ? board
			: new CheckerboardFromString(5, 5, board || this.initialBoard);
	},
	
	/** The `initialBoard` has two ranks of pieces for each player. All B pieces except one A piece 
	at the center of the first rank.
	*/
	initialBoard: ['BBABB', 'BBBBB', '.....', 'bbbbb', 'bbabb'].join(''),

	/** `__PLAYER_ENDGAME_RE__` regular expressions are used to optimize result calculations. They 
	match if the player has no A piece or if its opponent has an A piece in its rank.
	*/
	__PLAYER_ENDGAME_RE__: {
		Uppercase: /^[.Bab]+$|^.{0,4}[a]/, 
		Lowercase: /^[.bAB]+$|[A].{0,4}$/ 
	},
	
	/** A player wins when it moves its A piece to the opponent's first rank, and loses when its A 
	piece is captured by the opponent.
	*/
	result: function result() {
		var board = this.board.string, player;
		for (var i = 0; i < 2; ++i) {
			player = this.players[i];
			if (board.match(this.__PLAYER_ENDGAME_RE__[player])) {
				return this.defeat(player); 
			}
		}
		return this.moves() ? null : this.defeat(this.activePlayer());
	},
	
	/** `__PLAYER_PIECES_RE__` regular expressions are used to optimize move calculations.
	*/
	__PLAYER_PIECES_RE__: {
		Uppercase: /[AB]/g,
		Lowercase: /[ab]/g
	},
	
	/** All pieces move one square forward. Piece A can move straight backwards or diagonally 
	forward, and B pieces move only diagonally forward. Pieces can move to any square that is empty 
	or occupied by an opponent's piece of the same type. If the piece moves to an occupied square, 
	it captures the piece in it.
	*/
	moves: function moves() {
		var activePlayer = this.activePlayer(),
			pieceRegExp = this.__PLAYER_PIECES_RE__[activePlayer],
			board = this.board,
			_moves = [];
		board.string.replace(pieceRegExp, function (piece, i) {
			var coord = [(i / 5)|0, i % 5], pieceMoves;
			switch (piece) {
				case 'A': pieceMoves = [[+1,-1], [-1, 0], [+1,+1]]; break;
				case 'B': pieceMoves = [[+1,-1], [+1,+1]]; break;
				case 'a': pieceMoves = [[-1,-1], [+1, 0], [-1,+1]]; break;
				case 'b': pieceMoves = [[-1,-1], [-1,+1]]; break;
			}
			iterable(pieceMoves).forEachApply(function (dx, dy) {
				var coordTo = [coord[0] + dx, coord[1] + dy],
					squareTo = board.square(coordTo);
				if (board.isValidCoord(coordTo) && !squareTo.match(pieceRegExp) &&
						(squareTo == '.' || piece.toLowerCase() == squareTo.toLowerCase())) {
					_moves.push([coord, coordTo]); // Valid coordinate and not occupied by a friendly piece.
				}
			});
			return piece;
		});
		return _moves.length > 0 ? obj(activePlayer, _moves) : null;
	},
	
	/** Valid move for this game are pairs of coordinates (`[row, column]`), the first one being 
	where the moving piece starts, and the second one being where the moving piece ends.	
	*/
	next: function next(moves, haps, update) {
		raiseIf(haps, "Haps are not required (given ", haps, ")!");
		raiseIf(!moves, "Invalid moves ", moves, "!");
		var activePlayer = this.activePlayer(),
			move = moves[activePlayer];
		raiseIf(!Array.isArray(moves[activePlayer]), "Invalid moves ", moves, "!");
		var nextBoard = this.board.move(move[0], move[1]);
		if (update) {
			this.activatePlayers(this.opponent());
			this.board = nextBoard;
			return this;
		} else {
			return new this.constructor(this.opponent(), nextBoard);
		}
	},
	
	// ## Utility methods ##########################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Bahab',
		serializer: function serialize_Bahab(obj) {
			return [obj.activePlayer(), obj.board];
		}
	}
}); // declare Bahab.

/** # Puzzle15

The [15 puzzle](https://en.wikipedia.org/wiki/15_puzzle) is a simple sliding puzzle, that consists 
in putting a set of pieces in order by moving them to the only empty space in the frame.

It is included here as a test of the support in Ludorum for singleplayer games. The only player in 
this game is `'Player'`.
*/
games.Puzzle15 = declare(Game, {
	name: "Puzzle15",
	players: ['Player'],
	
	width: 4,
	height: 4,
	target: '0123456789ABCDE ',
	maxMoves: 81,
	
	/** The constructor takes a `board` or builds one at random by default.	Also takes a 
	`moveNumber`, or 0 by default.
	*/
	constructor: function Puzzle15(args) {
		Game.call(this, this.players[0]);
		args = args || {};
		this.board = args.board || this.randomBoard();
		this.moveNumber = args.moveNumber |0;
	},
	
	/** The puzzle usually starts with a `randomBoard`.
	*/
	randomBoard: function randomBoard(width, height, rng, symbols) {
		width = (width |0) || this.width;
		height = (height |0) || this.height;
		rng = rng || Randomness.DEFAULT;
		symbols = symbols || Iterable.range(width * height - 1).map(function (n) {
			return n.toString(36);
		}).join('').toUpperCase();
		return new CheckerboardFromString(width, height, 
			rng.shuffle(' '+ symbols.substr(0, width * height - 1)).join(''), ' ');
	},
	
	/** The puzzle is finished when the pieces and the empty square are arranged in the `target`
	configuration.
	*/
	differences: function differences(target) {
		target = target || this.target;
		var str = this.board.string;
		return iterable(str).zip(target).map(function (p) {
			return p[0] === p[1] ? 0 : 1;
		}).sum();
	},
	
	/** The score of the player is the number of remaining moves.
	*/
	scores: function scores() {
		return obj(this.players[0], this.maxMoves - this.moveNumber);	
	},
	
	/** The puzzle can only end in victory, or remain unsolved.
	*/
	result: function result() {
		return this.differences() === 0 ? this.victory() : 
			this.moveNumber >= this.maxMoves ? this.defeat() : null;
	},
	
	/** The moves of the player are defined by the position of the empty square.
	*/
	emptyCoord: function emptyCoord() {
		var i = this.board.string.indexOf(' '),
			width = this.board.width;
		return [(i / width) |0, i % width];
	},
	
	/** The player can move the empty square up, down, left or right. A move is the coordinate where
	to move the empty square.
	*/
	moves: function moves() {
		var pos = this.emptyCoord(),
			board = this.board;
		if (this.result()) {
			return null;
		} else {
			return { Player: iterable(Checkerboard.DIRECTIONS.ORTHOGONAL).mapApply(function (dr, dc) {
					return [pos[0] + dr, pos[1] + dc];			
				}, this.board.isValidCoord.bind(this.board)).toArray()
			};
		}
	},
	
	/** The next game state is calculated simply by swapping the contents of the empty square and
	the given position in the board.
	*/
	next: function next(move, haps, update) {
		raiseIf(haps, "Haps are not required (given ", haps, ")!");
		var nextBoard = this.board.swap(this.emptyCoord(), move.Player);
		if (update) {
			this.board = nextBoard;
			this.moveNumber++;
			return this;
		} else {
			return new this.constructor({ board: nextBoard, moveNumber: this.moveNumber + 1 });
		}
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Puzzle15',
		serializer: function serialize_Puzzle15(obj) {
			return [{ board: obj.board, moveNumber: obj.moveNumber }];
		}
	}	
}); // declare Puzzle15

/** # RoundRobin

[Round-robins](http://en.wikipedia.org/wiki/Round-robin_tournament) are 
tournaments where all players play against each other a certain number of times.
*/
tournaments.RoundRobin = declare(Tournament, {
	/** The constructor takes the `game` to be played, the `players` and the 
	amount of matches each player should play (`matchCount`).
	*/
	constructor: function RoundRobin(game, players, matchCount) {
		Tournament.call(this, game, players);
		this.matchCount = isNaN(matchCount) ? game.players.length : +matchCount;
		this.__advance__ = this.__matches__().chain(Iterable.repeat(null)).__iter__();
	},

	/** Round-robin matches make every player plays `matchCount` matches for 
	each role in the game against all the other opponents.
	*/
	__matches__: function __matches__() {
		var tournament = this,
			game = this.game;
		return iterable(this.players)
			.permutations(game.players.length)
			.product(Iterable.range(this.matchCount)).map(function (tuple) {
				return new Match(game, tuple[0]);
			});
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'RoundRobin',
		serializer: function serialize_RoundRobin(obj) { //TODO Include statistics.
			return [obj.game, obj.players, obj.matchCount];
		}
	}
}); //// declare RoundRobin.


/** # Measurement

Measurement tournaments pit the player being measured against others in order
to assess that player's performance at a game. They are used to evaluate how 
well the players play by confronting them with the opponents, rotating their 
roles in the matches.
*/
tournaments.Measurement = declare(Tournament, {
	/** The constructor takes the `game` used in the contest, the `players`
	being evaluated, the `opponents` used to evaluate them, and the amount of
	matches each player will play (`matchCount`).
	*/
	constructor: function Measurement(game, players, opponents, matchCount) {
		Tournament.call(this, game, Array.isArray(players) ? players : [players]);
		this.opponents = Array.isArray(opponents) ? opponents : [opponents];
		raiseIf(this.opponents.length < game.players.length - 1, "Not enough opponents.");
		this.matchCount = isNaN(matchCount) ? game.players.length : +matchCount;
		this.__advance__ = this.__matches__().chain(Iterable.repeat(null)).__iter__();
	},

	/** A measurement tournament makes every player play `matchCount` matches 
	for each role in the game against all possible combinations of opponents.
	*/
	__matches__: function __matches__() {
		var game = this.game,
			playerCount = game.players.length,
			opponentCombinations = iterable(this.opponents);
		if (playerCount > 2) {
			opponentCombinations = opponentCombinations.product.apply(opponentCombinations, 
				Iterable.repeat(this.opponents, playerCount - 2).toArray());
		} else {
			opponentCombinations = opponentCombinations.map(function (p) {
				return [p];
			});
		}
		return iterable(this.players).product( 
			Iterable.range(playerCount),
			opponentCombinations,
			Iterable.range(this.matchCount)).map(function (tuple){
				var players = tuple[2].slice(0);
				players.splice(tuple[1], 0, tuple[0]);
				return new Match(game, players);
			});
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Measurement',
		serializer: function serialize_Measurement(obj) { //TODO Include statistics.
			return [obj.game, obj.players, obj.opponents, obj.matchCount];
		}
	}
}); //// declare Measurement.


/** # Elimination

Playoffs or sudden death kind of contests, also known as 
[elimination tournaments](http://en.wikipedia.org/wiki/Single-elimination_tournament).
In this tournaments players get randomly matched in successive brackets, each 
match's winner passing to the next round until the final match. Games are 
assumed to have only one winner per match.
*/
tournaments.Elimination = declare(Tournament, {
	/** The constructor takes the `game` to be played, the `players` and the 
	amount of matches that make each playoff (`matchCount`, 1 by default).
	*/
	constructor: function Elimination(game, players, matchCount) {
		Tournament.call(this, game, players);
		this.matchCount = isNaN(matchCount) ? 1 : +matchCount >> 0;
	},

	/** Each bracket is defined by partitioning the `players` in groups of the
	size required by the game (usually two). If there are not enough players,
	some players get reassigned. The bracket includes `matchCount` matches 
	between these participants, rotating roles if possible.
	*/
	__bracket__: function __bracket__(players) {
		var game = this.game,
			matchCount = this.matchCount,
			roleCount = this.game.players.length;
		players = players || this.players;
		if (players.length < roleCount) {
			return [];
		} else {
			return Iterable.range(0, players.length, roleCount).map(function (i) {
				var participants = Iterable.range(i, i + roleCount).map(function (j) {
					return players[j % players.length]; // Fill by repeating players if necessary.
				}).toArray();
				return Iterable.range(matchCount).map(function (i) {
					participants.unshift(participants.pop()); // Rotate partipants roles.
					return new Match(game, participants);
				}).toArray();
			}).toArray();
		}
	},
	
	/** A playoff is resolved by aggregating the results of all its matches. The
	winner of the playoff is the one with the greater result sum.
	*/
	__playoff__: function __playoff__(matches) {
		var playoffResult = {},
			players = {};
		matches.forEach(function (match) {
			var matchResult = match.result();
			if (!matchResult) {
				throw new Error('Unfinished match in playoff!');
			}
			iterable(match.players).forEach(function (tuple) {
				var role = tuple[0],
					playerName = tuple[1].name;
				playoffResult[playerName] = (+playoffResult[playerName] || 0) + matchResult[role];
				players[playerName] = tuple[1];
			});
		});
		var winnerName = iterable(playoffResult).greater(function (pair) {
			return pair[1];
		})[0][0];
		return players[winnerName];
	},
	
	/** The elimination tournament runs until there is less players in the next
	bracket than the amount required to play the game. Since this amount is 
	usually two, the contest ends with one player at the top.
	*/
	__advance__: function __advance__() {
		if (!this.__matches__ || this.__matches__.length < 1) {
			if (!this.__currentBracket__) { // First bracket.
				this.__currentBracket__ = this.__bracket__(this.players);
			} else if (this.__currentBracket__.length < 1) { // Tournament is finished.
				return null;
			} else { // Second and on brackets.
				var players = this.__currentBracket__.map(this.__playoff__);
				this.__currentBracket__ = this.__bracket__(players);
			}
			this.__matches__ = iterable(this.__currentBracket__).flatten().toArray();
		}	
		return this.__matches__.shift();
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Elimination',
		serializer: function serialize_Elimination(obj) { //TODO Include statistics.
			return [obj.game, obj.players, obj.matchCount];
		}
	}
}); //// declare Elimination.


// See __prologue__.js
	[Match,
	// Games.
		games.Bahab, games.Choose2Win, games.ConnectionGame, games.Mutropas, games.OddsAndEvens,
			games.Pig, games.Predefined, games.TicTacToe, games.ToadsAndFrogs, games.Puzzle15,
	// Players.
		Player, players.AlphaBetaPlayer, players.MaxNPlayer, players.MiniMaxPlayer, 
			players.MonteCarloPlayer, players.RandomPlayer, players.TracePlayer, players.UCTPlayer,
	// Tournaments.
		Tournament, tournaments.Elimination, tournaments.Measurement, tournaments.RoundRobin, 
	// Aleatories.
		aleatories.Aleatory, aleatories.UniformAleatory, aleatories.CustomAleatory,
	// Utilities.
		utils.CheckerboardFromString
	].forEach(function (type) {
		type.__SERMAT__.identifier = exports.__package__ +'.'+ type.__SERMAT__.identifier;
		exports.__SERMAT__.include.push(type);
	});
	Sermat.include(exports); // Ludorum uses Sermat internally.

	return exports;
});
//# sourceMappingURL=ludorum.js.map