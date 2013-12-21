"use strict"; (function (init) {
	if (typeof define === 'function' && define.amd) {
		define(['basis'], init); // AMD module.
	} else if (typeof module === 'object' && module.exports) {
		module.exports = init(require('basis')); // CommonJS module.
	} else {
		var global = (0, eval)('this');
		global.inveniemus = init(global.basis); // Global namespace.
	}
})(function (basis){ var exports = {};
/** ludorum/src/Game.js:
	Game is the base type for all games.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@contributors Gonzalo de Oliveira Madeira
	@licence MIT Licence
*/
// Game ////////////////////////////////////////////////////////////////////////

var Game = exports.Game = basis.declare({
	/** new Game(activePlayers=first player):
		Base abstract class of games.
	*/
	constructor: function Game(activePlayers) {
		/** Game.activePlayers:
			The players that can move in this turn.
		*/
		this.activePlayers = !activePlayers ? [this.players[0]] : 
			(!Array.isArray(activePlayers) ? [activePlayers] : activePlayers);
	},

	/** Game.name:
		The game's name as a string, for displaying purposes.
	*/
	name: 'Game.name?',
	
	/** Game.players:
		An array of role names (strings), that the players can assume in a 
		match of this game. For example: "Xs" and "Os" in TicTacToe, or 
		"Whites" and "Blacks" in Chess.
	*/
	players: [],

	/** Game.moves():
		Returns an object with every active player related to the moves each
		can make in this turn. If there are no moves available for any 
		active player the game is assumed to be finished.
		If the game has random variables to be instantiated, they are 
		returned as members of this object (with RandomVariable instances as
		values).
		Warning! The base implementation returns no moves.
	*/
	moves: function moves() {
		var result = ({});
		for (var i = 0; i < this.activePlayers.length; i++) {
			result[this.activePlayers[i]] = [];
		}
		return result;
	},

	/** Game.next(moves):
		Performs the given moves and returns a new game instance with the 
		resulting state. The moves object should have a move for each active
		player.
		If the game has random variables, their instantiation can be added
		to the moves object. Else the function must instantiate them, before
		returning the next game state.
		Note: it is strongly advised to double check the moves object. 
	*/
	next: function next(moves) {
		throw new Error((this.constructor.name || 'Game') +".next() not implemented! Please override.");
	},

	/** Game.result():
		If the game is finished the result of the game is an object with 
		every player in the game related to a number. This number must be 
		positive if the player wins, negative if the player loses or zero 
		if the game is a tie. If the game is not finished, this function 
		returns null.
		Warning! The base implementation declares a defeat if the active 
		players have no moves, with their opponents as winners.
	*/
	result: function result() {
		return this.moves() ? null : this.defeat(); // Defeat for the active players.
	},

	// Player information //////////////////////////////////////////////////////

	/** Game.isActive(player...):
		Checks if the given players are all active.
	*/
	isActive: function isActive() {
		for (var i = 0; i < arguments.length; i++) {
			if (this.activePlayers.indexOf(arguments[i]) < 0) {
				return false;
			}
		}
		return true;
	},

	/** Game.activePlayer():
		Returns the active player's role if there is one and only one, else 
		raises an error. This is convenient for AI algorithms that only 
		support games with one active player at each ply.
	*/
	activePlayer: function activePlayer() {
		var len = this.activePlayers.length;
		basis.raiseIf(len < 1, 'There is no active player.');
		basis.raiseIf(len > 1, 'More than one player is active.');
		return this.activePlayers[0];
	},

	/** Game.opponents(players=activePlayers):
		Return an array with the opponent roles of the given players, or of
		the active players by default. In this implementation the opponents 
		are all the other players, but this can be overriden.
	*/
	opponents: function opponents(players) {
		players = players || this.activePlayers;
		return iterable(this.players).filter(function (p) {
			return players.indexOf(p) < 0;
		}).toArray();
	},

	/** Game.opponent(player=activePlayer):
		Returns the opponent of the given player, or the active player by 
		default. This assumes there are only two players in the game, and 
		only one active player per turn.
	*/
	opponent: function opponent(player) {
		var playerIndex = this.players.indexOf(player || this.activePlayer());
		return this.players[(playerIndex + 1) % this.players.length];
	},

	/** Game.doMove(move, player=activePlayer):
		Performs a move of a single player and returns the next game state.
	*/
	doMove: function doMove(move, player) {
		player = player || this.activePlayer();
		var moves = {};
		moves[player] = move;
		return this.next(moves);
	},

	// Result functions ////////////////////////////////////////////////////////

	/** Game.resultBounds():
		Returns an array with the minimum and the maximum results a player 
		can have in this game. By default return =[-1,+1].
	*/
	resultBounds: function resultBounds() {
		return [-1,+1];
	},
	
	/** Game.zerosumResult(score, players=activePlayers):
		Returns a game result object. The score is split between the given 
		players (the active	players by default), and (-score) is split 
		between their opponents.
	*/
	zerosumResult: function zerosumResult(score, players) {
		players = !players ? this.activePlayers : (!Array.isArray(players) ? [players] : players);
		score = (+score) / (players.length || 1);
		var result = ({}), player,
			opponentScore = -score / (this.players.length - players.length || 1);
		for (var i = 0; i < this.players.length; i++) {
			player = this.players[i];
			result[player] = players.indexOf(player) < 0 ? opponentScore : score;
		}
		return result;
	},

	/** Game.victory(players=activePlayers, score=1):
		Returns the zerosum game result with the given players (or the 
		active players by default) as winners, and their opponents as 
		losers.
	*/
	victory: function victory(players, score) {
		return this.zerosumResult(score || 1, players);
	},

	/** Game.defeat(players=activePlayers, score=-1):
		Returns the zerosum game result with the given players (or the 
		active players by default) as losers, and their opponents as 
		winners.
	*/
	defeat: function defeat(players, score) {
		return this.zerosumResult(score || -1, players);
	},

	/** Game.draw(players=this.players, score=0):
		Returns the game result of a tied game with the given players (or 
		the active players by default) all with the same score.
	*/
	draw: function draw(players, score) {
		score = +(score || 0);
		players = players || this.players;
		var result = ({});
		for (var player in players) {
			result[players[player]] = score;
		}
		return result;
	},

	// Game state //////////////////////////////////////////////////////////////

	/** Game.args():
		Returns an array, where the first element should be the name of the 
		game, and the rest the arguments to call the game's constructor in order
		to rebuild this game's state. Not implemented, so please override.
	*/
	args: function args() {
		throw new Error("Game.args() not implemented! Please override.");
	},
	
	/** Game.clone():
		Creates a copy of this game state. Uses this.arguments().
	*/
	clone: function clone() {
		var args = this.args();
		args[0] = this.constructor;
		return new (args[0].bind.apply(args[0], args))();
	},

	/** Game.identifier():
		Calculates a string that uniquely identifies this game state. Useful
		for storing it in hash tables. By default returns this.arguments() in
		JSON.
	*/
	identifier: function identifier() {
		return JSON.stringify(this.args());
	},

	// Presentation functions. /////////////////////////////////////////////////

	/** Game.toString():
		Returns a textual representation of this game state.
	*/
	toString: function toString() {
		var args = this.args();
		return args.shift() +'('+ args.map(JSON.stringify).join(',') +')';
	}
}); // declare Game.
	
/** games:
	Bundle of Game subclasses and related definitions.
*/
var games = exports.games = {};

// Serialized simultaneous games. //////////////////////////////////////////////
	
/** static Game.serialized():
	Builds a serialized version of this game, converting a simultaneous game to 
	an alternated turn based game.
*/
Game.serialized = function serialized() {
	var super_moves = this.prototype.moves,
		super_next = this.prototype.next;
	return basis.declare(this, {
		/** Game.serialized().moves():
			Returns the moves of the player deemed as the active player, if 
			there are any moves.
		*/
		moves: function moves() {
			var fixedMoves = this.__fixedMoves__ || (this.__fixedMoves__ = {}),
				allMoves = super_moves.call(this),
				moves = {},
				activePlayer;
			for (var i = 0; i < this.activePlayers.length; i++) {
				if (fixedMoves.hasOwnProperty(this.activePlayers[i])) {
					activePlayer = this.activePlayers[i];
					break;
				}
			}
			if (activePlayer && allMoves) {
				moves[activePlayer] = allMoves[activePlayer];
				return moves;
			} else {
				return null;
			}
		},
	
		/** Game.serialized().next(moves):
			If with the given move all active players in the real game state
			have moves, then the actual game advances. Else the next player 
			that has to move becomes active.
		*/
		next: function next(moves) {
			var nextFixedMoves = basis.copy({}, this.fixedMoves || {}, moves),
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
}; // Game.serialized

// Cached games. ///////////////////////////////////////////////////////////////

/** static Game.cached():
	Returns a derived constructor is returned that caches the moves and result 
	methods. The next() method is not cached because it may lead to memory
	leaks or overload.
*/
Game.cached = function cached() {
	var super_moves = this.prototype.moves,
		super_result = this.prototype.result,
		super_next = this.prototype.next;
	return basis.declare(this, {
		/** Game.cached().moves():
			The first time it is called, delegates to game.moves(), and 
			keeps the result for future calls.
		*/
		moves: function moves() {
			var result = super_moves.call(this);
			this.moves = function cachedMoves() { // Replace moves() method with cached version.
				return result;
			};
			return result;
		},
		
		/** Game.cached().result():
			The first time it is called, delegates to game.result(), and 
			keeps the result for future calls.
		*/
		result: function result() {
			var result = super_result.call(this);
			this.result = function cachedResult() { // Replace result() method with cached version.
				return result;
			};
			return result;
		}
	});
}; // Game.cached


/** ludorum/src/Player.js:
	Player is the base type for all playing agents.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@contributors Gonzalo de Oliveira Madeira
	@licence MIT Licence
*/
// Players /////////////////////////////////////////////////////////////////////
	
var Player = exports.Player = basis.declare({
	/** new Player(name):
		A player is an agent that plays a game. This means deciding which 
		move to make from the set of moves available to the player, each 
		time the game enables the player to do so.
		This is an abstract class that is meant to be extended.
	*/
	constructor: (function () {
		var __PlayerCount__ = 0; // Used by the Player's default naming.
		return function Player(name) {
			this.name = ''+ (name || 'Player' + (__PlayerCount__++));
		};
	})(),

	/** Player.__moves__(game, player):
		Get the moves in the game for the player, checks if there are any, 
		and if such is not the case it raises an error.
	*/
	__moves__: function __moves__(game, role) {
		var moves = game.moves();
		basis.raiseIf(!moves || !moves[role] || moves[role].length < 1, 
			"Player ", role, " has no moves for game ", game, ".");
		return moves[role];
	},

	/** Player.decision(game, player):
		Ask the player to make a move in the given name for the given player 
		(role). The result is the selected move if it can be obtained 
		synchronously, else a Future is returned.
	*/
	decision: function decision(game, role) {
		// Indeed not a very thoughtful base implementation.
		return this.__moves__(game, role)[0]; 
	},

	/** Player.participate(match, role):
		Called when the player joins a match, in order for the player to prepare
		properly. If this implies building another instance of the player 
		object, it must be returned in order to participate in the match.
	*/
	participate: function participate(match, role) {
		return this;
	},
	
	// Match commands. /////////////////////////////////////////////////////
	
	commandQuit: function commandQuit(role) {
		return { command: 'quit', role: role };
	},
	
	commandReset: function commandReset(role, ply) {
		return { command: 'reset', role: role, 
			ply: isNaN(ply) ? 0 : +ply 
		};
	},
}); // declare Player.

/** players:
	Bundle of Player subclasses and related definitions.
*/
var players = exports.players = {};


/** ludorum/src/Match.js:
	Match is the controller for a game, managing player decisions.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@contributors Gonzalo de Oliveira Madeira
	@licence MIT Licence
*/
// Match controller ////////////////////////////////////////////////////////////

var Match = exports.Match = basis.declare({
	/** new Match(game, players):
		Match objects are game controllers, handling the flow of the turns 
		between the players. They also provide game events that players and 
		spectators can be registered to.
		The players argument must be either an array of Player objects or an
		object with a member for each player with a Player object as value.
	*/
	constructor: function Match(game, players) {
		this.game = game;
		this.players = Array.isArray(players) ? basis.iterable(game.players).zip(players).toObject() : players;
		/** Match.history:
			Game state array, from the initial game state to the last.
		*/
		this.history = [game];
		/** Match.events:
			Event handler for this match. Emitted events are: begin, end, move
			& next.
		*/
		this.events = new basis.Events({ 
			events: ['begin', 'move', 'next', 'end']
		});
		// Participate the players.
		for (var p in this.players) {
			this.players[p] = this.players[p].participate(this, p) || this.players[p];
		}
	},

	/** Match.ply():
		Returns the current ply number.
	*/
	ply: function ply() {
		return this.history.length - 1;
	},
	
	toString: function toString() {
		return 'Match('+ this.game +', '+ JSON.stringify(this.players) +')';
	},

	/** Match.state(ply=current):
		Returns the game state of the given ply. If no one is specified, the
		current game state is returned.
	*/
	state: function state(ply) {
		ply = isNaN(ply) ? this.ply() : +ply < 0 ? this.ply() + (+ply) : +ply;
		return this.history[ply | 0];
	},

	/** Match.result():
		Returns the results of the current game state.
	*/
	result: function result() {
		return this.state().result();
	},

	/** Match.decisions(game=current()):
		Asks the active players in the game to choose their moves. Returns a 
		future that is resolved when all players have decided.
	*/
	decisions: function decisions(game) {
		game = game || this.state();
		var players = this.players;
		return basis.Future.all(game.activePlayers.map(function (p) {
			return basis.when(players[p].decision(game, p));//FIXME when?
		}));
	},

	__advance__: function __advance__(game, next) {
		this.history.push(next);
		this.onNext(game, next);
		return next;
	},
	
	/** Match.run(plys=Infinity):
		Runs the match the given number of plys or until the game finishes.
		The result is a future that gets resolved when running ends.
	*/
	run: function run(plys) {
		plys = isNaN(plys) ? Infinity : +plys;
		if (plys < 1) { // If the run must stop...
			return basis.when(this);
		}
		var ply = this.ply(), game = this.state(), results, next;
		(ply < 0) && this.onBegin(game);
		while (game instanceof Aleatory) { // Instantiate all random variables.
			game = this.__advance__(game, game.instantiate());
		}
		results = game.result();
		if (results) { // If the match has finished ...
			this.onEnd(game, results);
			return basis.when(this);
		} else { // Else the run must continue ...
			var match = this;
			return this.decisions(game).then(function (moves) {
				moves = basis.iterable(game.activePlayers).zip(moves).toObject();
				match.onMove(game, moves);
				match.__advance__(game, game.next(moves));
				return match.run(plys - 1);
			});
		}
	},
	
	// Events //////////////////////////////////////////////////////////////////
	
	onBegin: function onBegin(game) {
		this.events.emit('begin', this.players, game, this);
		this.logger && this.logger.info('Match begins with ', 
			basis.iterable(this.players).map(function (attr) {
				return attr[1] +' as '+ attr[0];
			}).join(', '), '; for ', game, '.');
	},
	
	onMove: function onMove(game, moves) {
		this.events.emit('move', moves, game, this);
		this.logger && this.logger.info('Players move: ', JSON.stringify(moves), ' in ', game);
	},
	
	onNext: function onNext(game, next) {
		this.events.emit('next', game, next, this);
		this.logger && this.logger.info('Match advances from ', game, ' to ', next);
	},
	
	onEnd: function onEnd(game, results) {
		this.events.emit('end', game, results, this);
		this.logger && this.logger.info('Match for ', game, 'ends with ', JSON.stringify(results));
	}
}); // declare Match.


/** ludorum/src/Tournament.js:
	A tournament is a set of matches played between many players. The whole 
	contest ranks the participants according to the result of the matches.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Base contest controller //////////////////////////////////////////////////////////

var Tournament = exports.Tournament = basis.declare({
	/** new Tournament(game, players):
		Base class of all tournament controllers.
	*/
	constructor: function Tournament(game, players) {
		/** Tournament.game:
			The game played at the tournament.
		*/
		this.game = game;
		/** Tournament.players:
			An array with the participants in the tournament.
		*/
		this.players = Array.isArray(players) ? players : iterables.iterable(players).toArray();
		/** Tournament.statistics:
			Tournament statistics. These include the accumulated score for 
			each player, indexed by name.
		*/
		this.statistics = new basis.Statistics();
	},

	/** Tournament.account(match):
		Accounts the results of a finished match for the players' score.
	*/
	account: function account(match) {
		var game = this.game,
			results = match.result(), 
			isDraw = false,
			stats = this.statistics;
		basis.raiseIf(!results, "Match doesn't have results. Has it finished?");
		// Player statistics.
		basis.iterable(match.players).forEach(function (p) {
			var role = p[0],
				player = p[1],
				playerResult = results[p[0]],
				keys = ['game:'+ game.name, 'role:'+ role, 'player:'+ player.name];
			stats.add(keys.concat('results'), playerResult);
			stats.add(keys.concat(playerResult > 0 ? 'victories' : playerResult < 0 ? 'defeats' : 'draws'), playerResult);
			stats.add(keys.concat('length'), match.ply()); //FIXME This may not be accurate if the game has random variables.
			match.history.forEach(function (entry) {
				if (typeof entry.moves === 'function') {
					var moves = entry.moves();	
					if (moves && moves.hasOwnProperty(role) && moves[role].length > 0) {
						stats.add(keys.concat('width'), moves[role].length);
					}
				}
			})
		});
	},

	/** Tournament.run(matches=this.matches()):
		Plays the given matches. This argument must be an Iterable of 
		ludorum.Match objects.
	*/
	run: function run(matches) {
		var tournament = this;
		matches = matches || this.matches();
		return basis.Future.sequence(matches, function (match) {
			return match.run().then(function (match) {
				tournament.account(match);
				return tournament;
			});
		});
	},

	/** Tournament.matches():
		Returns the matches of this contest in an iterable. In this base 
		implementation this method raises an exception. It must be overriden.
	*/
	matches: function matches() {
		throw new Error("Tournament.matches is not implemented. Please override.");
	}
}); // declare Tournament

/** tournaments:
	Bundle of Tournament subclasses and related definitions.
*/
var tournaments = exports.tournaments = {};


/** ludorum/src/Aleatory.js:
	Representation of intermediate game states that depend on some form of 
	randomness, like: dice, card decks, roulettes, etc.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
var Aleatory = exports.Aleatory = basis.declare({
	/** new Aleatory(next, random=basis.Randomness.DEFAULT):
		Base constructor for a aleatory game state.
	*/
	constructor: function Aleatory(next, random) {
		this.next = next;
		this.random = random || basis.Randomness.DEFAULT;
	},
	
	/** Aleatory.instantiate():
		Calls this.next() callback with a random value and returns its result.
	*/
	instantiate: function instantiate() {
		return this.next(this.value());
	},
	
	/** Aleatory.value():
		Calculates a random value for this aleatory.
	*/
	value: function value() {
		var n = random.random(), value;
		basis.iterable(this.distribution()).forEach(function (pair) {
			n -= pair[1];
			if (n <= 0) {
				value = pair[0];
				throw basis.Iterable.STOP_ITERATION;
			}
		});
		if (typeof value === 'undefined') {
			throw new Error("Random value could not be obtained.");
		}
		return value;
	},
	
	/** Aleatory.distribution():
		Computes the histogram for the random variables on which this aleatory
		depends, as an iterable of pairs [value, probability]. Not implemented 
		by default.
	*/
	distribution: function distribution() {
		throw new Error((this.constructor.name || 'Aleatory') +".distribution() is not implemented! Please override.");
	}
}); // declare Aleatory.

/** aleatories:
	Bundle of random game states (i.e. Aleatory subclasses) and related 
	definitions.
*/
var aleatories = exports.aleatories = {};


/** ludorum/src/players/RandomPlayer.js:
	Automatic players that moves fully randomly.

	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Random players //////////////////////////////////////////////////////////////
	
players.RandomPlayer = basis.declare(Player, {
	/** new RandomPlayer(name, random=basis.Randomness.DEFAULT):
		Builds a player that chooses its moves randomly.
	*/
	constructor: function RandomPlayer(name, random) {
		Player.call(this, name);
		this.random = random || basis.Randomness.DEFAULT;
	},

	toString: function toString() {
		return 'RandomPlayer('+ JSON.stringify(this.name) +')';
	},

	/** RandomPlayer.decision(game, player):
		Makes the decision completely at random.
	*/
	decision: function(game, player) {
		return this.random.choice(this.__moves__(game, player));
	}
}); // declare RandomPlayer.


/** ludorum/src/players/TracePlayer.js:
	Automatic player that is scripted previously.

	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Trace players ///////////////////////////////////////////////////////////////

players.TracePlayer = basis.declare(Player, {
	/** new TracePlayer(name, trace):
		Builds a player that makes his decisions based on a trace, a list of 
		moves to follow.
	*/
	constructor: function TracePlayer(name, trace) {
		Player.call(this, name);
		this.trace = basis.iterable(trace);
		this.__iterator__ = this.trace.__iter__();
		this.__decision__ = this.__iterator__();
	},

	toString: function toString() {
		return 'TracePlayer('+ JSON.stringify(this.name) +', ['+ this.trace.join(', ') +'])';
	},

	/** TracePlayer.decision(game, player):
		Returns the next move in the trace, or the last one if the trace has
		ended.
	*/
	decision: function(game, player) {
		try {
			this.__decision__ = this.__iterator__();
		} catch (err) {
			basis.Iterable.prototype.catchStop(err);
		}
		return this.__decision__;
	}
}); // declare TracePlayer.


/** ludorum/src/players/HeuristicPlayer.js:
	Base type for automatic players based on heuristic evaluations of game
	states or moves.

	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Heuristic players ///////////////////////////////////////////////////////////
	
var HeuristicPlayer = players.HeuristicPlayer = basis.declare(Player, {
	/** new HeuristicPlayer(name, random, heuristic):
		Builds a player that evaluates its moves and chooses one of the best
		evaluated.
	*/
	constructor: function HeuristicPlayer(name, random, moveEvaluation, stateEvaluation) {
		Player.call(this, name);
		this.random = random || basis.Randomness.DEFAULT;
		if (moveEvaluation) {
			this.moveEvaluation = moveEvaluation;
		}
		if (stateEvaluation) {
			this.stateEvaluation = stateEvaluation;
		}
	},

	toString: function toString() {
		return 'HeuristicPlayer('+ JSON.stringify(this.name) +')';
	},

	/** HeuristicPlayer.moveEvaluation(move, game, player):
		Calculates a number as the assessment of the given move. The base
		implementation calculates the resulting game state and returns the 
		stateEvaluation of it.
	*/
	moveEvaluation: function moveEvaluation(move, game, player) {
		return this.stateEvaluation(game.next(basis.obj(player, move)), player);
	},

	/** HeuristicPlayer.stateEvaluation(game, player):
		Calculates a number as the assessment of the given game state. The 
		base implementation returns the result for the player is the game 
		has results. 
		Else it returns a random number in [-0.5, 0.5). This is only useful 
		in testing this framework. Any serious use should override it.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		var gameResult = game.result();
		return gameResult ? gameResult[player] : this.random.random(-0.5, 0.5);
	},

	/** HeuristicPlayer.decision(game, player):
		Selects randomly from the best evaluated moves.
	*/
	decision: function decision(game, player) {
		var heuristicPlayer = this,
			future = new basis.Future();
		setTimeout(function () {
			try {
				var max = -Infinity, best = [], 
					moves = heuristicPlayer.__moves__(game, player), move, e;
				for (var i = 0; i < moves.length; i++) {
					move = moves[i];
					e = heuristicPlayer.moveEvaluation(move, game, player);
					if (e > max) {
						best = [move];
						max = e;
					} else if (e == max) {
						best.push(move);
					}
				}
				future.resolve(heuristicPlayer.random.choice(best));
			} catch (err) {
				future.reject(err);
			}
		}, 1);
		return future;
	}
}); // declare HeuristicPlayer.


/** ludorum/src/players/MiniMaxPlayer.js:
	Automatic players based on MiniMax with alfa-beta pruning.

	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// MiniMax players /////////////////////////////////////////////////////////////
	
players.MiniMaxPlayer = basis.declare(HeuristicPlayer, {
	/** new MiniMaxPlayer(name='MiniMax', heuristic, horizon=3, random=randomness.DEFAULT):
		Builds a player that chooses its moves using the MiniMax algorithm with
		alfa-beta pruning.
	*/
	constructor: function MiniMaxPlayer(name, heuristic, horizon, random) {
		HeuristicPlayer.call(this, name, random);
		this.horizon = +(horizon || 3);
		if (heuristic) {
			this.heuristic = heuristic;
		}
	},

	toString: function toString() {
		return 'MiniMaxPlayer('+ JSON.stringify(this.name) +', '+ this.horizon +')';
	},

	/** MiniMaxPlayer.stateEvaluation(game, player):
		Returns the minimax value for the given game and player.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		var result = this.minimax(game, player, 0, -Infinity, Infinity);
		return result;
	},

	/** MiniMaxPlayer.heuristic(game, player):
		Game state evaluation used at the leaves of the game search tree that
		are not finished games.
	*/
	heuristic: function heuristic(game, player) {
		return this.random.random(-0.5, 0.5);
	},

	/** MiniMaxPlayer.minimax(game, player, depth, alfa, beta):
		Minimax evaluation of the given game for the given player. If the game
		is not finished and the depth is greater than the horizon, the heuristic
		is used.
	*/
	minimax: function minimax(game, player, depth, alpha, beta) {
		var results = game.result();
		if (results) {
			return results[player];
		} else if (depth >= this.horizon) {
			return this.heuristic(game, player);
		}
		var activePlayer = game.activePlayer(),
			isActive = activePlayer == player,
			moves = this.__moves__(game, activePlayer), value, next;
		if (moves.length < 1) {
			throw new Error('No moves for unfinished game '+ game +'.');
		}
		for (var i = 0; i < moves.length; i++) {
			next = game.next(basis.obj(activePlayer, moves[i]));
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
	}
}); // declare MiniMaxPlayer.


/** ludorum/src/players/MonteCarloPlayer.js:
	Automatic players based on Monte Carlo tree search.

	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// MonteCarlo players //////////////////////////////////////////////////////////

players.MonteCarloPlayer = basis.declare(HeuristicPlayer, {
	/** new MonteCarloPlayer(name, random, simulationCount=30):
		Builds a player that evaluates its moves using Monte-Carlo 
		simulations (random games).
	*/
	constructor: function MonteCarloPlayer(name, random, simulationCount) {
		HeuristicPlayer.call(this, name, random);
		this.simulationCount = isNaN(simulationCount) ? 30 : +simulationCount >> 0;
	},
	
	/** MonteCarloPlayer.stateEvaluation(game, player):
		Returns the minimax value for the given game and player.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		var resultSum = 0;
		for (var i = this.simulationCount; i > 0; i--) {
			resultSum += this.simulation(game, player);
		}
		return resultSum / this.simulationCount;
	},
	
	/** MonteCarloPlayer.simulation(game, player):
		Simulates a random match from the given game and returns the result
		for the given player.
	*/
	simulation: function simulation(game, player) {
		var mc = this, move, moves;
		for (moves = game.moves(); moves; moves = game.moves()) {
			move = {};
			game.activePlayers.forEach(function (activePlayer) {
				move[activePlayer] = mc.random.choice(moves[activePlayer]);
			});
			game = game.next(move)
		}
		return game.result()[player];
	}
}); // declare MonteCarloPlayer


/** ludorum/src/players/UserInterfacePlayer.js:
	Implementation of player user interfaces and proxies in the Ludorum 
	library.

	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// User interfaces proxies for Player. /////////////////////////////////////////
	
var UserInterfacePlayer = players.UserInterfacePlayer = basis.declare(Player, {
	/** new UserInterfacePlayer(name):
		Base class of all players that are proxies of user interfaces.
	*/
	constructor: function UserInterfacePlayer(name) {
		Player.call(this, name);
	},

	/** UserInterfacePlayer.decision(game, player):
		Returns a future that will be resolved when the perform() method is 
		called.
	*/
	decision: function decision(game, player) {
		if (this.__future__ && this.__future__.isPending()) {
			var error = new Error("Last decision has not been made. Match probably aborted.");
			this.__future__.reject(error);
		}
		return this.__future__ = new basis.Future();
	},
	
	/** UserInterfacePlayer.perform(action):
		Resolves the decision future. This method is meant to be called by 
		the user interface.
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
	
// User interfaces base constructor. ///////////////////////////////////////////

var UserInterface = players.UserInterface = basis.declare({
	/** new players.UserInterface(match, config):
		Base class for user interfaces that display a game and allow one
		or more players to play.
	*/
	constructor: function UserInterface(match, config) {
		this.match = match;
		basis.initialize(this, config)
			.array('players', { defaultValue: match.state().players });
		match.events.on('begin', this.onBegin.bind(this));
		match.events.on('move', this.onMove.bind(this));
		match.events.on('end', this.onEnd.bind(this));
	},
	
	/** players.UserInterface.onBegin(players, game):
		Handler for the 'begin' event of the match.
	*/
	onBegin: function onBegin(players, game) {
		this.activePlayer = game.activePlayer();
		this.display(game);
	},
	
	/** players.UserInterface.onMove(moves, game, next):
		Handler for the 'move' event of the match.
	*/
	onMove: function onMove(moves, game, next) {
		this.activePlayer = next.activePlayer();
		this.display(next);
	},
	
	/** players.UserInterface.onEnd(results, game):
		Handler for the 'end' event of the match.
	*/
	onEnd: function onEnd(results, game) {
		this.activePlayer = null;
		this.results = results;
		this.display(game);
	},
	
	/** players.UserInterface.display(game):
		Renders the game in this user interface. Not implemented, so please
		override.
	*/
	display: function display(game) {
		throw new Error("UserInterface.display is not defined. Please override.");
	},
	
	/** players.UserInterface.perform(action, player=<active player>):
		Makes the given player perform the action if the player has a 
		perform method and is included in this UI's players.
	*/
	perform: function perform(action, player) {
		player = player || this.match.state().activePlayer();
		if (this.players.indexOf(player) >= 0) {
			var activePlayer = this.match.players[player];
			if (activePlayer && typeof activePlayer.perform === 'function') {
				activePlayer.perform(action);
			}
		}
	}
}); // declare UserInterface.
	
// Basic HTML user interface support. //////////////////////////////////////////
	
UserInterface.BasicHTMLInterface = basis.declare(UserInterface, {
	/** new BasicHTMLInterface(match, players, domElement):
		Simple HTML based UI, that renders the game to the given domElement
		using its toHTML method.
	*/
	constructor: function BasicHTMLInterfacePlayer(match, config) {
		exports.UserInterface.call(this, match, config);
		this.domElement = config.domElement;
		if (typeof this.domElement === 'string') {
			this.domElement = document.getElementById(this.domElement);
		}
	},

	/** BasicHTMLInterface.display(game):
		When the player is participated of a match, a callback is registered
		to the match's events. This method renders the game to HTML at each 
		step in the match.
	*/
	display: function display(game) {
		domElement.innerHTML = game.toHTML();
	}
}); // declare HTMLInterface.
	
// KineticJS graphical user interface. //////////////////////////////////////////

UserInterface.KineticJSInterface = basis.declare(UserInterface, {
	/** new KineticJSInterface(match, config):
		TODO.
	*/
	constructor: function KineticJSInterface(match, config) {
		exports.UserInterface.call(this, match, config);
		basis.initialize(this, config)
			.object('container')
			.object('Kinetic', { defaultValue: window.Kinetic });
		this.container.destroyChildren(); // Clear the container.
	}
}); // declare KineticJSInterface.


/** ludorum/src/games/__Predefined__.js:
	Simple reference games with a predefined outcome, mostly for testing 
	purposes.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
games.__Predefined__ = basis.declare(Game, {
	/** new games.__Predefined__(activePlayer, results, height=5, width=5):
		A pseudogame used for testing purposes. It will give width amount of 
		moves for each player until height moves pass. Then the match is 
		finished with the given results, or a tie as default.
	*/
	constructor: function __Predefined__(activePlayer, results, height, width) {
		if (results) {
			this.__results__ = results;
			this.players = Object.keys(results);
		}
		Game.call(this, activePlayer);
		this.height = isNaN(height) ? 5 : +height;
		this.width = isNaN(width) ? 5 : +width;
	},

	name: '__Predefined__',
	
	/** games.__Predefined__.players:
		Default players for __Predefined__: A and B.
	*/
	players: ['A', 'B'],

	/** games.__Predefined__.__results__:
		Default results for __Predefined__: a tie between A and B.
	*/
	__results__: {'A': 0, 'B': 0},

	/** games.__Predefined__.moves():
		Moves for a __Predefined__ are numbers from 1 to this.width. 
	*/
	moves: function moves() {
		if (this.height > 0) {
			return basis.obj(this.activePlayer(), 
				basis.Iterable.range(1, this.width + 1).toArray()
			);
		}
	},

	/** games.__Predefined__.result():
		Returned the predefined results if height is zero or less.
	*/
	result: function result() {
		return this.height > 0 ? null : this.__results__;
	},

	/** games.__Predefined__.next(moves):
		Moves are completely irrelevant. They only advance in the match.
	*/
	next: function next() {
		return new this.constructor(this.opponent(), this.__results__, this.height - 1, this.width);
	},
	
	args: function args() {
		return [this.name, this.activePlayer(), this.results, this.height, this.width];
	},
	
	toString: function toString() {
		return '__Predefined__('+ [this.activePlayer(), this.__results__,
			this.height, this.width].map(JSON.stringify).join(', ') +')';
	}
}); // declare __Predefined__.


/** ludorum/src/games/Choose2Win.js:
	Simple silly game where players can instantly choose to win, loose, draw or
	just continue. Mostly for testing purposes.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
games.Choose2Win = basis.declare(Game, {
	/** new games.Choose2Win(turns=Infinity, activePlayer=players[0], winner=none):
		Choose2Win is a silly game indeed. Each turn one of the players can
		decide to win, to lose or to pass the turn. It is meant to be used 
		only for testing Ludorum, since a game can hardly become less 
		interesting than this.
	*/
	constructor: function Choose2Win(turns, activePlayer, winner) {
		Game.call(this, activePlayer);
		this.__turns__ = isNaN(turns) ? Infinity : +turns;
		this.__winner__ = winner;		
	},

	name: 'Choose2Win',
	
	/** games.Choose2Win.players=['This', 'That']:
		Players of the dummy game.
	*/
	players: ['This', 'That'],

	/** games.Choose2Win.moves():
		Moves always are 'win', 'lose', 'pass'.
	*/
	moves: function moves() {
		if (!this.__winner__ && this.__turns__ > 0) {
			return basis.obj(this.activePlayer(), ['win', 'lose', 'pass']);
		}
	},

	/** games.Choose2Win.result():
		Victory for who chooses to win. Defeat for who chooses to lose. Draw 
		only when a limit of turns (if given) is met.
	*/
	result: function result() {
		return this.__winner__ ? this.victory(this.__winner__) :
			this.__turns__ < 1 ? this.draw() : null;
	},

	/** games.Choose2Win.next(moves):
		Moves must be always 'win', 'lose' or 'pass'.
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(),
			opponent = this.opponent(activePlayer);
		switch (moves[activePlayer]) {
			case 'win': return new this.constructor(this.__turns__ - 1, opponent, activePlayer);
			case 'lose': return new this.constructor(this.__turns__ - 1, opponent, opponent);
			case 'pass': return new this.constructor(this.__turns__ - 1, opponent);
			default: break; // So the lint would not complaint.
		}
		return basis.raise('Invalid move '+ moves[activePlayer] +' for player '+ activePlayer +'.');
	},
	
	args: function args() {
		return [this.name, this.__turns__, this.activePlayer(), this.__winner__];
	},
	
	toString: function toString() {
		//WARN JSON does not support Infinity nor -Infinity.
		return 'Choose2Win('+ this.__turns__ +","+ JSON.stringify(this.activePlayer()) +","+ JSON.stringify(this.__winner__) +')';
	}
}); // declare Choose2Win.


/** ludorum/src/games/OddsAndEvens.js:
	Classic child game, implemented as a simple example of a simultaneous game.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
games.OddsAndEvens = basis.declare(Game, {
	/** new games.OddsAndEvens(turns=1, points=<cero for both players>):
		Odds and evens is a very simple simultaneous game. Each turn both 
		players draw either a one or a two.
	*/
	constructor: function OddsAndEvens(turns, points) {
		Game.call(this, this.players); // Both players are active.
		this.turns = isNaN(turns) ? 1 : +turns;
		this.points = points || { Evens: 0, Odds: 0 };
	},

	name: 'OddsAndEvens',
	
	/** games.OddsAndEvens.players=['Evens', 'Odds']:
		Players for odds and evens.
	*/
	players: ['Evens', 'Odds'],

	/** games.OddsAndEvens.moves():
		Moves always are 1 and 2.
	*/
	moves: function moves() {
		return this.turns < 1 ? null : { Evens: [1, 2], Odds: [1, 2] };
	},

	/** games.OddsAndEvens.result():
		The winner is the player with more points.
	*/
	result: function result() {
		var pointDifference = this.points.Evens - this.points.Odds;
		return this.turns > 0 ? null : {
			Evens: +pointDifference,
			Odds: -pointDifference
		};
	},

	/** games.OddsAndEvens.next(moves):
		The player matching the parity of the moves sum earns a point.
	*/
	next: function next(moves) {
		var parity = !((moves.Evens + moves.Odds) % 2);
		return new this.constructor(this.turns - 1, {
			Evens: this.points.Evens + (parity ? 1 : 0),
			Odds: this.points.Odds + (parity ? 0 : 1)
		});
	},
	
	args: function args() {
		return [this.name, this.turns, this.points];
	},
	
	toString: function toString() {
		return JSON.stringify(this.points);
	}
}); // declare OddsAndEvens.


/** ludorum/src/games/TicTacToe.js
	Implementation of the traditional Tic-Tac-Toe game.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
games.TicTacToe = basis.declare(Game, {
	/** new games.TicTacToe(activePlayer="Xs", board='_________'):
		Constructor of TicTacToe games. The first player is always Xs.
	*/
	constructor: function TicTacToe(activePlayer, board) {
		Game.call(this, activePlayer);
		this.board = board || '_________';
	},
	
	name: 'TicTacToe',
	
	/** games.TicTacToe.players:
		There are two roles in this game: "Xs" and "Os".
	*/
	players: ['Xs', 'Os'],
	
	/** games.TicTacToe.result():
		Returns a victory if any player has three marks in line, a draw if the
		board is full, or null otherwise.
	*/
	result: (function () {
		var WIN_X = /XXX......|...XXX...|......XXX|X..X..X..|.X..X..X.|..X..X..X|X...X...X|..X.X.X../,
			WIN_O = /OOO......|...OOO...|......OOO|O..O..O..|.O..O..O.|..O..O..O|O...O...O|..O.O.O../;
		return function result() {			
			if (this.board.match(WIN_X)) { // Xs wins.
				return this.victory(["Xs"]);
			} else if (this.board.match(WIN_O)) { // Os wins.
				return this.victory(["Os"]);
			} else if (this.board.indexOf('_') < 0) { // No empty squares means a tie.
				return this.draw();
			} else {
				return null; // The game continues.
			}
		};
	})(),
	
	/** games.TicTacToe.moves():
		Returns the indexes of empty squares in the board.
	*/
	moves: function moves() {
		if (!this.result()) {
			var result = {};
			result[this.activePlayer()] = basis.iterable(this.board).filter(function (chr, i) {
				return chr == '_'; // Keep only empty squares.
			}, function (chr, i) {
				return i; // Grab the index.
			}).toArray();
			return result;
		} else {
			return null;
		}		
	},
	
	/** games.TicTacToe.next(moves):
		Puts the mark of the active player in the square indicated by the move. 
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(), 
			move = +moves[activePlayer];
		basis.raiseIf(this.board.charAt(move) !== '_', 'Invalid move ', move, ' for board ', this.board, 
			' (moves= ', JSON.stringify(moves) +').');
		var newBoard = this.board.substring(0, move) + activePlayer.charAt(0) + this.board.substring(move + 1);
		return new this.constructor(this.opponent(activePlayer), newBoard);
	},

	args: function args() {
		return [this.name, this.activePlayer(), this.board];
	},
	
	/** games.TicTacToe.toString():
		Text version of the TicTacToe board.
	*/
	toString: function toString() {
		return [
			this.board.substring(0,2).split('').join('|'), '-+-+-',
			board.substring(3,5).split('').join('|'), '-+-+-',
			board.substring(6,8).split('').join('|')
		].join('\n');
	}
}); // declare TicTacToe
	
// TicTacToe AI ////////////////////////////////////////////////////////////////
/** static games.TicTacToe.heuristics:
	Bundle of heuristic evaluation functions for TicTacToe.
*/
games.TicTacToe.heuristics = {};

/** games.TicTacToe.heuristics.heuristicFromWeights(weights):
	Builds an heuristic evaluation function from weights for each square in the 
	board. The result of the function is the weighted sum, empty squares being
	ignored, opponent squares considered negative.
*/
games.TicTacToe.heuristics.heuristicFromWeights = function heuristicFromWeights(weights) {
	var weightSum = basis.iterable(weights).map(Math.abs).sum();
	function __heuristic__(game, player) {
		var playerChar = player.charAt(0);
		return iterable(game.board).map(function (square, i) {
			return (square === '_' ? 0 : weights[i] * (square === playerChar ? 1 : -1));
		}).sum() / weightSum;
	}
	__heuristic__.weights = weights;
	return __heuristic__;
};
	
/** games.TicTacToe.heuristics.defaultHeuristic(game, player):
	Default heuristic for TicTacToe, based on weights for each square.
*/
games.TicTacToe.heuristics.defaultHeuristic = games.TicTacToe.heuristics.heuristicFromWeights([2,1,2,1,5,1,2,1,2]);


/** ludorum/src/games/ToadsAndFrogs.js
	Implementation of the Toads & Frogs game. 
	See <http://en.wikipedia.org/wiki/Toads_and_Frogs_%28game%29>.

	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
games.ToadsAndFrogs = basis.declare(Game, {
	/** new games.ToadsAndFrogs(activePlayer="Toads", board='TTT__FFF'):
		Constructor of Toads & Frogs games. The first player is always Toads.
	*/
	constructor: function ToadsAndFrogs(activePlayer, board) {
		Game.call(this, activePlayer);
		this.board = board || ToadsAndFrogs.board();
	},
	
	name: 'ToadsAndFrogs',
	
	/** games.ToadsAndFrogs.players:
		There are two roles in this game: "Toads" and "Frogs".
	*/
	players: ['Toads', 'Frogs'],
	
	/** games.ToadsAndFrogs.results():
		The match finishes when one player cannot move, hence losing the game.
	*/
	results: function results() {
		return this.moves() ? null : this.defeat();
	},
	
	/** games.ToadsAndFrogs.moves():
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
	
	/** games.ToadsAndFrogs.next(moves):
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(), 
			move = moves[activePlayer], 
			chip = activePlayer.charAt(0),
			board = this.board;
		if (board.substr(move, 2) == 'T_') {
			board = board.substring(0, move) + '_T' + board.substring(move + 2);
		} else if (board.substr(move, 2) == '_F') {
			board = board.substring(0, move) + 'F_' + board.substring(move + 2);
		} else if (board.substr(move, 3) == 'TF_') {
			board = board.substring(0, move) + '_FT' + board.substring(move + 3);
		} else if (board.substr(move, 3) == '_TF') {
			board = board.substring(0, move) + 'FT_' + board.substring(move + 3);
		} else {
			throw new Error('Invalid move ', move, ' for board <', board, '>.');
		}
		return new this.constructor(this.opponent(activePlayer), board);
	},

	args: function args() {
		 return [this.name, this.activePlayer, this.board];
	},
	
	/** games.ToadsAndFrogs.toString():
		Prints the game's board.
	*/
	toString: function toString() {
		return this.board;
	}
}); // declare ToadsAndFrogs
	
/** static games.ToadsAndFrogs.board(chips=3, separation=2):
	Makes a board for Toads & Frogs. This is a single row with the given 
	number of chips for each player (toads to the left and frogs to the
	right) separated by the given number of empty spaces.
*/
games.ToadsAndFrogs.board = function board(chips, separation) {
	chips = isNaN(chips) ? 3 : +chips;
	separation = isNaN(separation) ? 2 : +separation;
	return 'T'.repeat(chips) + '_'.repeat(separation) + 'F'.repeat(chips);
};


/** ludorum/src/games/Mancala.js
	Implementation of the Kalah member of the Mancala family of games.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@author <a href="mailto:">Maximiliano Martins</a>
	@licence MIT Licence
*/
games.Mancala = basis.declare(Game, {
	/** new Mancala(activePlayer="North", board=makeBoard()):
		TODO.
	*/
	constructor: function Mancala(activePlayer, board){
		Game.call(this, activePlayer);
		this.board = board || this.makeBoard();
	},
	
	/** Mancala.makeBoard(seeds=3, houses=6):
		Builds a board array to use as the game state.
	*/
	makeBoard: function makeBoard(seeds, houses){
		seeds = isNaN(seeds) ? 3 : +seeds;
		houses = isNaN(houses) ? 6 : +houses;
		var result = [];
		for(var j = 0; j < 2; j++){
			for(var i = 0; i < houses; i++){
				result.push(seeds);
			}
			result.push(0);
		}
		return result;
	},
	
	name: 'Mancala',
	
	/** Mancala.players:
		Players of Mancala are North and South.
	*/
	players: ["North", "South"],
	
	/** Mancala.emptyCapture=false:
		If true, making a capture only moves the active player's seed to his
		store. The opponents seeds are not captured.
	*/
	emptyCapture: false,
	
	/** Mancala.countRemainingSeeds=true:
		If true, at the end of the game if a player has seeds on his houses,
		those seeds are included in his score.
	*/
	countRemainingSeeds: true,
	
	/** Mancala.store(player):
		Returns the index in this game's board of the player's store.
	*/
	store: function store(player){
		switch (this.players.indexOf(player)) {
			case 0: return this.board.length / 2 - 1; // Store of North.
			case 1: return this.board.length - 1; // Store of South.
			default: throw new Error("Invalid player "+ player +".");
		}
	},

	/** Mancala.houses(player):
		Returns an array with the indexes of the player's houses in this
		game's board.
	*/
	houses: function houses(player){
		switch (this.players.indexOf(player)) {
			case 0: return basis.Iterable.range(0, this.board.length / 2 - 1).toArray(); // Store of North.
			case 1: return basis.Iterable.range(this.board.length / 2, this.board.length - 1).toArray(); // Store of South.
			default: throw new Error("Invalid player "+ player +".");
		}
	},
	
	/** Mancala.oppositeHouse(player, i):
		Returns the index of the opposite house of i for the given player,
		or a negative if i is not a house of the given player.
	*/
	oppositeHouse: function oppositeHouse(player, i) {
		var playerHouses = this.houses(player),
			opponentHouses = this.houses(this.opponent(player)),
			index = playerHouses.indexOf(i);
		return index < 0 ? index : opponentHouses.reverse()[index];
	},
	
	/** Mancala.nextSquare(player, i):
		Returns the index of the square following i for the given player.
	*/
	nextSquare: function nextSquare(player, i){
		do {
			i = (i + 1) % this.board.length;
		} while (i === this.store(this.opponent(player)));
		return i;
	},
	
	/** Mancala.moves():
		A move for this game is an index of the square in the board.
	*/
	moves: function moves(){
		var board = this.board,
			result = {},
			activePlayer = this.activePlayer();
		result[activePlayer] = this.houses(activePlayer).filter(function(house){
			return board[house] > 0; // The house has seeds.
		});
		return result[activePlayer].length > 0 ? result : null;
	},
	
	/** Mancala.result():
		The game ends when the active player cannot move. The result for
		each player is the difference between the seed count of the stores.
		If a player has seeds in his side, those are added to his count.
	*/
	result: function result() {
		if (!this.moves()) {
			var result = {}, 
				game = this,
				board = this.board;
			// Calculate score.
			this.players.forEach(function (player) {
				result[player] = board[game.store(player)];
				if (game.countRemainingSeeds) {
					game.houses(player).forEach(function (house) {
						result[player] += board[house];
					});
				}
			});
			// Calculate result.
			result[this.players[0]] -= result[this.players[1]];
			result[this.players[1]] = -result[this.players[0]];
			return result;
		} else {
			return null;
		}
	},
	
	/** Mancala.next(moves):
		TODO.
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(), 
			move = +moves[activePlayer],
			newBoard = this.board.slice(0),
			seeds = newBoard[move],
			freeTurn = false,
			store, oppositeHouse;
		basis.raiseIf(seeds < 1, "Invalid move ", move, " for game ", this);
		// Move.
		newBoard[move] = 0;
		for (; seeds > 0; seeds--) {
			move = this.nextSquare(activePlayer, move);
			newBoard[move]++;
		}
		// Free turn if last square of the move is the player's store.
		freeTurn = move == this.store(activePlayer); 
		// Capture.
		if (!freeTurn) {
			oppositeHouse = this.oppositeHouse(activePlayer, move);
			if (oppositeHouse >= 0 && newBoard[move] == 1 && newBoard[oppositeHouse] > 0) { 
				store = this.store(activePlayer);
				newBoard[store]++;
				newBoard[move] = 0;
				if (!this.emptyCapture) {
					newBoard[store] += newBoard[oppositeHouse];
					newBoard[oppositeHouse] = 0;
				}					
			}
		}
		return new this.constructor(freeTurn ? activePlayer : this.opponent(), newBoard);
	},
	
	/** Mancala.resultBounds():
		Result bounds are estimated with the total number of stones in the
		board. It is very unlikely to get these result though.
	*/
	resultBounds: function resultBounds() {
		var stoneCount = basis.iterable(this.board).sum();
		return [-stoneCount,+stoneCount];
	},
	
	// Utility methods. ////////////////////////////////////////////////////
	
	args: function args() {
		return [this.name, this.activePlayer(), this.board.slice()];
	},

	identifier: function identifier() {
		return this.activePlayer().charAt(0) + this.board.map(function (n) {
			return ('00'+ n.toString(36)).substr(-2);
		}).join('');
	},

	toString: function toString() {
		var game = this,
			north = this.players[0],
			northHouses = this.houses(north).map(function (h) {
				return (''+ game.board[h]).lpad(2, '0');
			}).reverse(),
			northStore = (''+ this.board[this.store(north)]).lpad(2, '0'),
			south = this.players[1],
			southHouses = this.houses(south).map(function (h) {
				return (''+ game.board[h]).lpad(2, '0');
			}),
			southStore = (''+ this.board[this.store(south)]).lpad(2, '0');
		return "   "+ northHouses.join(" | ") +"   \n"+
			northStore +" ".repeat(northHouses.length * 2 + (northHouses.length - 1) * 3 + 2) + southStore +"\n"+
			"   "+ southHouses.join(" | ") +"   ";
	}
}); // declare Mancala.
	
games.Mancala.makeBoard = games.Mancala.prototype.makeBoard;

// Heuristics //////////////////////////////////////////////////////////////////

/** static games.Mancala.heuristics:
	Bundle of heuristic evaluation functions for Mancala.
*/
games.Mancala.heuristics = {};
	
/** games.Mancala.heuristics.heuristicFromWeights(weights):
	Builds an heuristic evaluation function from weights for each square in
	the board. The result of the function is the normalized weighted sum.
*/
games.Mancala.heuristics.heuristicFromWeights = function heuristicFromWeights(weights) {
	var weightSum = basis.iterable(weights).map(Math.abs).sum();
	function __heuristic__(game, player) {
		var seedSum = 0, signum;
		switch (game.players.indexOf(player)) {
			case 0: signum = 1; break; // North.
			case 1: signum = -1; break; // South.
			default: throw new Error("Invalid player "+ player +".");
		}
		return basis.iterable(game.board).map(function (seeds, i) {
			seedSum += seeds;
			return seeds * weights[i]; //TODO Normalize weights before.
		}).sum() / weightSum / seedSum * signum;
	}
	__heuristic__.weights = weights;
	return __heuristic__;
};
	
/** games.Mancala.heuristics.defaultHeuristic(game, player):
	Default heuristic for Mancala, based on weights for each square.
*/
games.Mancala.heuristics.defaultHeuristic = games.Mancala.heuristics.heuristicFromWeights(
	[+1,+1,+1,+1,+1,+1,+5,
	 -1,-1,-1,-1,-1,-1,-5]
);


/** ludorum/src/games/Pig.js:
	Simple dice game, an example of a game with random variables. See
	<http://en.wikipedia.org/wiki/Pig_%28dice_game%29>.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
games.Pig = basis.declare(Game, {
	/** new games.Pig(activePlayer='One', scores, rolls):
		Pig is a dice betting game, where the active player rolls dice until it
		rolls one or passes its turn scoring the sum of previous rolls.
	*/
	constructor: function Pig(activePlayer, scores, rolls) {
		Game.call(this, activePlayer);
		this.__scores__ = scores || basis.iterable(this.players).zip([0, 0]).toObject();
		this.rolls = rolls || [];
	},

	/** games.Pig.goal=100:
		Amount of points a player has to reach to win the game.
	*/
	goal: 100,
	
	name: 'Pig',
	
	/** games.Pig.players=['One', 'Two']:
		Players for Pig.
	*/
	players: ['One', 'Two'],

	/** games.Pig.moves():
		The active player can either hold and pass the turn, or roll.
	*/
	moves: function moves() {
		if (!this.result()) {
			return basis.obj(this.activePlayer(), ['roll', 'hold']);
		}
	},

	/** games.Pig.result():
		Game finishes when one player reaches or passes the goal score. The 
		result for each player is the difference between its score and its
		opponent's score.
	*/
	result: function result() {
		if (this.__scores__[this.players[0]] >= this.goal || this.__scores__[this.players[1]] >= this.goal) {
			var r = {};
			r[this.players[0]] = this.__scores__[this.players[0]] - this.__scores__[this.players[1]];
			r[this.players[1]] = -r[this.players[0]];
			return r;
		}
	},

	/** games.Pig.next(moves):
		The player matching the parity of the moves sum earns a point.
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(),
			move = moves[activePlayer];
		if (move === 'hold') {
			var scores = basis.copy(this.__scores__);
			scores[activePlayer] += basis.iterable(this.rolls).sum();
			return new this.constructor(this.opponent(), scores, []);
		} else if (move === 'roll') {
			var game = this;
			return new aleatories.Dice(6, function (value) {
				return (value > 1) 
					? new game.constructor(activePlayer, game.__scores__, game.rolls.concat(value))
					: new game.constructor(game.opponent(), game.__scores__, []);
			});
		} else {
			throw new Error("Invalid moves: "+ JSON.stringify(moves));
		}
	},
	
	args: function args() {
		return [this.name, this.activePlayer(), this.__scores__, this.rolls];
	}
}); // declare Pig.


/** ludorum/src/tournaments/AllAgainstAll.js:
	Tournament where all players play against each other a certain number of
	times.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Measurement tournament. /////////////////////////////////////////////////////

tournaments.AllAgainstAll = basis.declare(Tournament, {
	/** new tournaments.AllAgainstAll(game, players, matchCount=game.players.length):
		A tournament that confronts all players against each other rotating 
		their roles in the matches.
	*/
	constructor: function AllAgainstAll(game, players, matchCount) {
		Tournament.call(this, game, players);
		this.matchCount = isNaN(matchCount) ? game.players.length : +matchCount;
	},

	/** tournaments.AllAgainstAll.matches():
		Every player plays matchCount matches for each role in the game against
		all the other opponents.
	*/
	matches: function matches() {
		var tournament = this,
			game = this.game,
			ms = basis.iterable(this.players);
		ms = ms.product.apply(ms, basis.Iterable.repeat(this.players, game.players.length - 1).toArray());
		return ms.filter(function (tuple) { // Check for repeated.
			for (var i = 1; i < tuple.length; i++) {
				for (var j = 0; j < i; j++) {
					if (tuple[i] === tuple[j]) {
						return false;
					}
				}
			}
			return true;
		}).product(basis.Iterable.range(this.matchCount)).map(function (tuple) {
			return new Match(game, tuple[0]);
		});
	}
}); // declare AllAgainstAll.


/** ludorum/src/tournaments/Measurement.js:
	Measurement tournament pit the player being measured against others in order
	to assess that player's performance at a game.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Measurement tournament. /////////////////////////////////////////////////////

tournaments.Measurement = basis.declare(Tournament, {
	/** new tournaments.Measurement(game, players, opponents, matchCount=game.players.length):
		A tournament used to evaluate how well the players play by confronting
		them with the opponents, rotating their roles in the matches.
	*/
	constructor: function Measurement(game, players, opponents, matchCount) {
		Tournament.call(this, game, Array.isArray(players) ? players : [players]);
		this.opponents = Array.isArray(opponents) ? opponents : [opponents];
		basis.raiseIf(this.opponents.length < game.players.length - 1, "Not enough opponents.");
		this.matchCount = isNaN(matchCount) ? game.players.length : +matchCount;
	},

	/** tournaments.Measurement.matches():
		Every player plays matchCount matches for each role in the game against
		all possible combinations of opponents.
	*/
	matches: function matches() {
		var game = this.game,
			playerCount = game.players.length,
			opponentCombinations = basis.iterable(this.opponents);
		if (playerCount > 2) {
			opponentCombinations = opponentCombinations.product.apply(opponentCombinations, 
				basis.Iterable.repeat(this.opponents, playerCount - 2).toArray());
		} else {
			opponentCombinations = opponentCombinations.map(function (p) {
				return [p];
			});
		}
		return basis.iterable(this.players).product( 
			basis.Iterable.range(playerCount),
			opponentCombinations,
			basis.Iterable.range(this.matchCount)).map(function (tuple){
				var players = tuple[2].slice(0);
				players.splice(tuple[1], 0, tuple[0]);
				return new Match(game, players);
			});
	}
}); // declare Measurement.


/** ludorum/src/aleatories/Dice.js:
	Dice random variables.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
aleatories.Dice = basis.declare(Aleatory, {
	/** new Dice(name, base=6, random=basis.Randomness.DEFAULT):
		Simple uniform random variable with values in [1, base]. 
	*/
	constructor: function Dice(base, next, random) {
		Aleatory.call(this, next, random);
		this.base = isNaN(base) ? 6 : Math.max(2, +base);
	},
	
	value: function value() {
		return this.random.randomInt(1, this.base + 1);
	},
	
	distribution: function distribution() {
		var prob = 1 / this.base;
		return basis.Iterable.range(1, this.base + 1).map(function (n, i) {
			return [n, prob];
		});
	}		
}); // declare Dice.

return exports;
});