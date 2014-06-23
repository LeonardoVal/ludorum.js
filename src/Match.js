/** # Match

A match is a controller for a game, managing player decisions, handling the flow
of the turns between the players by following the game's logic.
*/
var Match = exports.Match = declare({
	/** `Match` objects are build with the [game's](Game.html) starting state 
	and the players that participate. The players argument must be either an 
	array of [`Player`](Player.html) objects or an object with a member for each
	of the game's players with a Player object as value.
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

	/** Each step in the match's history is called a ply. `Match.ply()` 
	indicates the current ply number.
	*/
	ply: function ply() {
		return this.history.length - 1;
	},
	
	/** Each ply has a game state. `Match.state(ply=last)` retrieves the game 
	state for the given ply, or the last one by default.
	*/
	state: function state(ply) {
		ply = isNaN(ply) ? this.ply() : +ply < 0 ? this.ply() + (+ply) : +ply;
		return this.history[ply | 0];
	},

	/** If the last game state is finished, then the whole match is finished. If
	so, `Match.result()` returns the match result, which is the result of the 
	last game state.
	*/
	result: function result() {
		return this.state().result();
	},

	/** If the last game state is not finished, then the match continues. To
	move the play on, `Match.decisions(game=state())` asks the active players in 
	the game to choose their moves. Returns a future that is resolved when all 
	players have decided.
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

	/** `Match.run(plys=Infinity)` runs the match the given number of plys, or 
	until the game finishes. The result is a future that gets resolved when the
	game ends.
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
	
	__advanceAleatories__: function __advanceAleatories__(game, moves) {
		for (var next; game instanceof Aleatory; game = next) {
			next = game.next();
			this.history.push(next);
			this.onNext(game, next);
		}
		return game;
	},
	
	__advance__: function __advance__(game, moves) {
		var match = this,
			quitters = game.activePlayers.filter(function (p) {
				return moves[p] instanceof Match.CommandQuit;
			});
		if (quitters.length > 0) {
			match.onQuit(game, quitters[0]);
			return false;
		}
		var next = game.next(moves); // Match must go on.
		this.history.push(next);
		this.onNext(game, next);
		return true;
	},
	
	/** ## Commands ###########################################################
	
	Commands are pseudo-moves, which can be returned by the players instead of
	valid moves for the game being played. Their intent is to control the match
	itself.
	
	The available commands are:
	*/
	
	/** + `CommandQuit()`: A quit command means the player that issued it is 
	leaving the match. The match is then aborted.
	*/
	"static CommandQuit": function CommandQuit() { },
	
	/** ## Events #############################################################
	
	Matches provide game events that players and spectators can be registered 
	to. `Match.events` is the event handler. Emitted events are:
	*/
	
	/** + The `begin` event fired by `Match.onBegin(game)` when the match 
	begins. The callbacks should have the signature `function (game, match)`.
	*/
	onBegin: function onBegin(game) {
		this.events.emit('begin', game, this);
		this.logger && this.logger.info('Match begins with ', 
			iterable(this.players).map(function (attr) {
				return attr[1] +' as '+ attr[0];
			}).join(', '), '; for ', game, '.');
	},
	
	/** + The `move` event fired by `Match.onMove(game, moves)` every time the
	active players make moves. The callbacks should have the signature 
	`function (game, moves, match)`.
	*/
	onMove: function onMove(game, moves) {
		this.events.emit('move', game, moves, this);
		this.logger && this.logger.info('Players move: ', JSON.stringify(moves), ' in ', game);
	},
	
	/** + The `next` event fired by `Match.onNext(game, next)` signals when the
	match advances to the next game state. This may be due to moves or aleatory
	instantiation.  The callbacks should have the signature 
	`function (gameBefore, gameAfter, match)`.
	*/
	onNext: function onNext(game, next) {
		this.events.emit('next', game, next, this);
		this.logger && this.logger.info('Match advances from ', game, ' to ', next);
	},
	
	/** + The `end` event triggered by `Match.onEnd(game, results)` notifies 
	when the match ends.  The callbacks should have the signature 
	`function (game, result, match)`.
	*/
	onEnd: function onEnd(game, results) {
		this.events.emit('end', game, results, this);
		this.logger && this.logger.info('Match for ', game, 'ends with ', JSON.stringify(results));
	},
	
	/** + The `quit` event triggered by `Match.onQuit(game, player)` is emitted
	when the match is aborted due to the given player leaving it. The callbacks 
	should have the signature `function (game, quitter, match)`.
	*/
	onQuit: function onQuit(game, player) {
		this.events.emit('quit', game, player, this);
		this.logger && this.logger.info('Match for ', game, ' aborted because player '+ player +' quitted.');
	},
	
	toString: function toString() {
		return 'Match('+ this.game +', '+ JSON.stringify(this.players) +')';
	}
}); // declare Match.
