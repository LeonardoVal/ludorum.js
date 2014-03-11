/** Match is the controller for a game, managing player decisions.
*/
var Match = exports.Match = declare({
	/** new Match(game, players):
		Match objects are game controllers, handling the flow of the turns 
		between the players. They also provide game events that players and 
		spectators can be registered to.
		The players argument must be either an array of Player objects or an
		object with a member for each player with a Player object as value.
	*/
	constructor: function Match(game, players) {
		this.game = game;
		this.players = Array.isArray(players) ? iterable(game.players).zip(players).toObject() : players;
		/** Match.history:
			Game state array, from the initial game state to the last.
		*/
		this.history = [game];
		/** Match.events:
			Event handler for this match. Emitted events are: begin, end, move,
			next and quit.
		*/
		this.events = new Events({ 
			events: ['begin', 'move', 'next', 'end', 'quit']
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
		var match = this,
			players = this.players,
			activePlayers = game.activePlayers;
		return Future.all(activePlayers.map(function (p) {
			return players[p].decision(game, p);
		})).then(function (decisions) {
			var moves = iterable(activePlayers).zip(decisions).toObject();
			match.onMove(game, moves);
			return moves;
		});
	},

	/** Match.__advanceAleatories__(game):
		If the given game has random variables (i.e. is an instance of Aleatory)
		it instantiates them until the players must move again.
	*/
	__advanceAleatories__: function __advanceAleatories__(game, moves) {
		for (var next; game instanceof Aleatory; game = next) {
			next = game.instantiate();
			this.history.push(next);
			this.onNext(game, next);
		}
		return game;
	},
	
	/** Match.__advance__(game, moves):
		Checks the moves for commands. If the match must continue, it pushes the 
		next game state in the match's history and returns true. Else it returns
		false.
	*/
	__advance__: function __advance__(game, moves) {
		var match = this,
			quitters = game.activePlayers.filter(function (p) {
				return match.isQuitCommand(moves[p]);
			});
		if (quitters.length > 0) {
			match.onQuit(game, quitters[0]);
			return false;
		}
		// Match must go on.
		var next = game.next(moves);
		this.history.push(next);
		this.onNext(game, next);
		return true;
	},
	
	/** Match.run(plys=Infinity):
		Runs the match the given number of plys or until the game finishes.
		The result is a future that gets resolved when running ends.
	*/
	run: function run(plys) {
		plys = isNaN(plys) ? Infinity : +plys;
		if (plys < 1) { // If the run must stop...
			return Future.when(this);
		}
		var ply = this.ply(), game = this.state(), results, next;
		(ply < 1) && this.onBegin(game);
		game = this.__advanceAleatories__(game); // Instantiate all random variables.
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
	
	// Commands. ///////////////////////////////////////////////////////////////
	
	/** Match.isQuitCommand(move):
		Checks if the move is a QUIT command. Such command means that the player
		that issued it is leaving the match. The match is then aborted.
		A QUIT command is any move that has a true '.QUIT' attribute.
	*/
	isQuitCommand: function (move) { 
		return move && move['.QUIT'];
	},
	
	"static commandQuit": { '.QUIT': true },
	
	// Events //////////////////////////////////////////////////////////////////
	
	/** Match.onBegin(game):
		Emits the 'begin' event, meant to signal when the match starts.
	*/
	onBegin: function onBegin(game) {
		this.events.emit('begin', game, this);
		this.logger && this.logger.info('Match begins with ', 
			iterable(this.players).map(function (attr) {
				return attr[1] +' as '+ attr[0];
			}).join(', '), '; for ', game, '.');
	},
	
	/** Match.onMove(game, moves):
		Emits the 'move' event, meant to signal when the active players have 
		moved.
	*/
	onMove: function onMove(game, moves) {
		this.events.emit('move', game, moves, this);
		this.logger && this.logger.info('Players move: ', JSON.stringify(moves), ' in ', game);
	},
	
	/** Match.onNext(game, next):
		Emits the 'next' event, meant to signal when the match advances to the
		next game state.
	*/
	onNext: function onNext(game, next) {
		this.events.emit('next', game, next, this);
		this.logger && this.logger.info('Match advances from ', game, ' to ', next);
	},
	
	/** Match.onEnd(game, results):
		Emits the 'end' event, meant to signal when the match has ended.
	*/
	onEnd: function onEnd(game, results) {
		this.events.emit('end', game, results, this);
		this.logger && this.logger.info('Match for ', game, 'ends with ', JSON.stringify(results));
	},
	
	/** Match.onQuit(game, player):
		Emits the 'quit' command, meant to signal the match is aborted due to
		the given player leaving it.
	*/
	onQuit: function onQuit(game, player) {
		this.events.emit('quit', game, player, this);
		this.logger && this.logger.info('Match for ', game, ' aborted because player '+ player +' quitted.');
	}
}); // declare Match.
