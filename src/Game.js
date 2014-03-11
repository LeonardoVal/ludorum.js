/** Game is the base type for all games.
*/
var Game = exports.Game = declare({
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
	name: '',
	
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

	/** abstract Game.next(moves):
		Performs the given moves and returns a new game instance with the 
		resulting state. The moves object should have a move for each active
		player.
		If the game has random variables, their instantiation can be added
		to the moves object. Else the function must instantiate them, before
		returning the next game state.
		Note: it is strongly advised to double check the moves object. 
	*/
	next: unimplemented("Game", "next"),

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
		raiseIf(len < 1, 'There is no active player.');
		raiseIf(len > 1, 'More than one player is active.');
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

	// Conversions & presentations. ////////////////////////////////////////////

	/** abstract Game.__serialize__():
		Returns an array, where the first element should be the name of the 
		game, and the rest the arguments to call the game's constructor in order
		to rebuild this game's state. Not implemented, so please override.
	*/
	__serialize__: unimplemented("Game", "__serialize__"),
	
	/** Game.clone():
		Creates a copy of this game state. Uses this.__serialize__().
	*/
	clone: function clone() {
		var args = this.__serialize__();
		args.shift(); // Remove first element (game's name).
		return new (this.constructor.bind.apply(this.constructor, args))();
	},

	/** Game.identifier():
		Calculates a string that uniquely identifies this game state. Useful
		for storing it in hash tables. By default returns this.arguments() in
		JSON.
	*/
	identifier: function identifier() {
		var args = this.__serialize__();
		return args.shift() + args.map(JSON.stringify).join('');
	},

	/** Game.toString():
		Returns a textual representation of this game state. Meant for logging
		or debugging, but not for user presentation.
	*/
	toString: function toString() {
		var args = this.__serialize__();
		return args.shift() +'('+ args.map(JSON.stringify).join(',') +')';
	},
	
	/** Game.toJSON():
		Encodes the game in JSON for decoding with the fromJSON method. The 
		encoded data must be an array starting with this games name, followed
		by its constructor arguments.
	*/
	toJSON: function toJSON() {
		return JSON.stringify(this.__serialize__());
	},
	
	/** static Game.fromJSON(data):
		Creates a new instance of this game from the given JSON. The function
		in the Game abstract class finds the proper constructor with the game
		name and calls it.
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
