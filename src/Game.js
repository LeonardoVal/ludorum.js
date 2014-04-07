/** ## Class `Game`

The class `ludorum.Game` is the base type for all games.
*/
var Game = exports.Game = declare({
	/** Its constructor takes the active player/s. A player is active if and 
	only if it can move. The argument may be either a player's name (string) or 
	an array of players' names. It is used to initialize `Game.activePlayers`, 
	an array with the active players' names.
	*/
	constructor: function Game(activePlayers) {
		this.activePlayers = !activePlayers ? [this.players[0]] : 
			(!Array.isArray(activePlayers) ? [activePlayers] : activePlayers);
	},

	/** The game's name at `Game.name` is used mainly for displaying purposes.
	*/
	name: '?',
	
	/** The game players are specified in the class property `Game.players`, an 
	array of role names (strings), that the players can assume in a match of 
	this game. For example: `"Xs"` and `"Os"` in TicTacToe, or `"Whites"` and 
	`"Blacks"` in Chess.
	*/
	players: [],

	/** The moves of each active player are calculated by `Game.moves()`. This 
	method returns an object with every active player related to the moves each
	can make in this turn. For example: 
	
		{ Player1: ['Rock', 'Paper', 'Scissors'], 
		Player2: ['Rock', 'Paper', 'Scissors'] }
		
	If the game has finished then a falsy value must be returned (`null` is 
	recommended).
	*/
	moves: unimplemented("Game", "moves"),

	/** Once the players have chosen their moves, the method `Game.next(moves)`
	is used to perform the given moves. It returns a new game instance with the
	resulting state. The moves object should have a move for each active player.
	For example:

		{ Player1: 'Rock', Player2: 'Paper' }
	
	There isn't a default implementation, so it must be overriden. It is 
	strongly advised to check if the moves argument has valid moves.
	*/
	next: unimplemented("Game", "next"),

	/** If the game is finished the result of the game is calculated with 
	`Game.result()`. It returns an object with every player in the game related 
	to a number. This number must be positive if the player wins, negative if 
	the player loses or zero if the game is a tie. For example:
	
		{ Player1: -1, Player2: +1 }
	
	If the game is not finished, this function must return a falsy value (`null`
	is recommended).
	*/
	result: unimplemented("Game", "result"),

	/** Some games may assign scores to the players in a finished game. This may
	differ from the result, since the score sign doesn't have to indicate 
	victory or defeat. For example:
	
		result: { Player1: -1, Player2: +1 }
		scores: { Player1: 4, Player2: 15 }
	
	The method `Game.scores()` returns the scores if such is the case. By 
	default, it return the same that `Game.result()` does.
	*/
	scores: function scores() {
		return this.results();
	},
	
	/** In incomplete or imperfect information games all players have different
	access to the game state data. `Game.view(player)` returns a modified 
	version of this game, that shows only the information from the perspective 
	of the given player. The other information is modelled as aleatory 
	variables.
	
	In this way searches in the game tree can be performed without revealing to
	the automatic player information it shouldn't have access to (a.k.a 
	_cheating_).
	*/
	view: function view(player) {
		return this;
	},
	
	// ### Player information ##################################################

	/** `Game.isActive(player...)` checks if the given players are all active.
	*/
	isActive: function isActive() {
		for (var i = 0; i < arguments.length; i++) {
			if (this.activePlayers.indexOf(arguments[i]) < 0) {
				return false;
			}
		}
		return true;
	},

	/** In most games there is only one active player per turn. The method
	`Game.activePlayer()` returns that active player's role if there is one and 
	only one, else it raises an error.
	*/
	activePlayer: function activePlayer() {
		var len = this.activePlayers.length;
		raiseIf(len < 1, 'There is no active player.');
		raiseIf(len > 1, 'More than one player is active.');
		return this.activePlayers[0];
	},

	/** All players in a game are assumed to be opponents. The method 
	`Game.opponents(players=activePlayers)` returns an array with the opponent 
	roles of the given players, or of the active players by default. If not all
	players are opponents this method can be overriden.
	*/
	opponents: function opponents(players) {
		players = players || this.activePlayers;
		return this.players.filter(function (p) {
			return players.indexOf(p) < 0;
		});
	},

	/** Since most games have only two players, the method 
	`Game.opponent(player=activePlayer)` conveniently returns the opponent of 
	the given player, or the active player by default.
	*/
	opponent: function opponent(player) {
		var playerIndex = this.players.indexOf(player || this.activePlayer());
		return this.players[(playerIndex + 1) % this.players.length];
	},

	// ### Game flow ###########################################################
	
	/** Since `Game.next()` expects a moves object, the method 
	`Game.perform(move, player=activePlayer, ...)` pretends to simplify simpler
	game mechanics. It performs the given moves for the given players 
	(activePlayer by default) and returns the next game state.
	*/
	perform: function perform(move, player) {
		player = player || this.activePlayer();
		var moves = {};
		moves[player] = move;
		for (var i = 2; i < arguments.length; ++i) {
			player = arguments[i+1] || this.activePlayer();
			moves[player] = arguments[i];
		}
		return this.next(moves);
	},

	// ### Result functions ####################################################

	/** The maximum and minimum results may be useful and even required by some 
	game search algorithm. To expose these values, `Game.resultBounds()` returns
	an array with first the minimum and then the maximum. Most game have one type 
	of victory (+1) and one type of defeat (-1). Thats why `Game.resultBounds()`
	returns [-1,+1] by default. Yet some games can define different bounds by 
	overriding it.
	*/
	resultBounds: function resultBounds() {
		return [-1,+1];
	},
	
	/** Most games have victory and defeat results that cancel each other. It is
	said that all the victors wins the defeated player loses. Those games are
	called _zerosum games_. The method 
	`Game.zerosumResult(score, players=activePlayers)` builds a game result 
	object for a zerosum game. The given score is split between the given 
	players (the active players by default), and (-score) is split between their 
	opponents.
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

	/** `Game.zerosumResult()` has two shorcuts. 
	`Game.victory(players=activePlayers, score=1)` returns the zerosum game 
	result with the given players (or the active players by default) as winners,
	and their opponents as losers.
	*/
	victory: function victory(players, score) {
		return this.zerosumResult(score || 1, players);
	},

	/** `Game.defeat(players=activePlayers, score=-1)` returns the zerosum game 
	result with the given players (or the active players by default) as losers, 
	and their opponents as winners.
	*/
	defeat: function defeat(players, score) {
		return this.zerosumResult(score || -1, players);
	},

	/** A tied game must always have the same result for all players. 
	`Game.draw(players=this.players, score=0)` returns the game result of a tied 
	game with the given players (or the active players by default) all with the 
	same score (zero by default).
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

	// ### Conversions & presentations #########################################

	/** Many methods are based in the serialization of the game instances. The
	abstract method `Game.__serialize__()` should returns an array, where the 
	first element should be the name of the game, and the rest are the arguments
	to call the game's constructor in order to rebuild this game's state.
	*/
	__serialize__: unimplemented("Game", "__serialize__"),
	
	/** Based on the game's serialization, `Game.clone()` creates a copy of this 
	game state.
	*/
	clone: function clone() {
		var args = this.__serialize__();
		args.shift(); // Remove first element (game's name).
		return new (this.constructor.bind.apply(this.constructor, args))();
	},

	/** Some algorithms require an identifier for each game state, in order to 
	store them in caches or hashes. `Game.identifier()` calculates a string that 
	uniquely identifies this game state, based on the game's serialization.
	*/
	identifier: function identifier() {
		var args = this.__serialize__();
		return args.shift() + args.map(JSON.stringify).join('');
	},

	/** The default string representation of a Game (i.e. `Game.toString()`) is
	also based on the serialization. Changing this is not recommended.
	*/
	toString: function toString() {
		var args = this.__serialize__();
		return args.shift() +'('+ args.map(JSON.stringify).join(',') +')';
	},
	
	/** The default JSON representation (i.e. `Game.toJSON()`) is a straight 
	JSON stringification of the serialization. It may be used to transfer the 
	game state between server and client, frames or workers.
	*/
	toJSON: function toJSON() {
		return JSON.stringify(this.__serialize__());
	},
	
	/** The static counterpart of `Game.toJSON` is `Game.fromJSON(data)`, which
	creates a new instance of this game from the given JSON. The function in the 
	Game abstract class finds the proper constructor with the game name and 
	calls it.
	*/
	"static fromJSON": function fromJSON(data) {
		if (typeof data === 'string') {
			data = JSON.parse(data);
		}
		raiseIf(!Array.isArray(data) || data.length < 1, "Invalid JSON data: "+ data +"!");
		var cons = games[data[0]];
		raiseIf(typeof cons !== 'function', "Unknown game '", data[0], "'!");
		if (typeof cons.fromJSON === 'function') {
			return cons.fromJSON(data); // Call game's fromJSON.
		} else {
			data[0] = basis.global; // Call game's constructor.
			return new (cons.bind.apply(cons, data))();
		}
	}
}); // declare Game.
	
/** The namespace `ludorum.games` contains all game implementations (as Game 
subclasses) provided by this library.
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
	return declare(this, {
		/** Game.serialized.moves():
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
	
		/** Game.serialized.next(moves):
			If with the given move all active players in the real game state
			have moves, then the actual game advances. Else the next player 
			that has to move becomes active.
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
	return declare(this, {
		/** Game.cached.moves():
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
		
		/** Game.cached.result():
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
