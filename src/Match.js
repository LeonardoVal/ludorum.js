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
		this.history = [[game]];
		/** Match.events:
			Event handler for this match. Emitted events are: begin, move, next 
			& end.
		*/
		this.events = new basis.Events({ 
			events: ['begin', 'move', 'next', 'end']
		});
		// Participate the players.
		for (var p in this.players) {
			this.players[p] = this.players[p].participate(this, p) || this.players[p];
		}
	},

	toString: function toString() {
		return 'Match('+ this.game +', '+ JSON.stringify(this.players) +')';
	},

	/** Match.ply():
		Returns the current ply number.
	*/
	ply: function ply() {
		return this.history.length - 1;
	},

	/** Match.state(ply=current):
		Returns the game state of the given ply. If no one is specified, the
		current game state is returned.
	*/
	state: function state(ply) {
		ply = isNaN(ply) ? this.ply() : +ply < 0 ? this.ply() + (+ply) : +ply;
		return this.history[ply | 0][0];
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

	/** Match.__advance__(...):
		Pushes the given entry into this match's history. Returns the game state
		in entry[0].
	*/
	__advance__: function __advance__() {
		var game = this.state(),
			entry = Array.prototype.slice.call(arguments),
			next = entry[0];
		this.history.push(entry);
		this.onNext(game, next);
		return next;
	},

	/** Match.run(plys=Infinity):
		Runs the match the given number of plys or until the game finishes.
		The result is a future that gets resolved when running ends.
	*/
	run: function run(plys) {
		var ply, game, results;
		plys = isNaN(plys) ? Infinity : +plys;
		if (plys < 1) { // If the run must stop...
			return basis.when(this);
		}
		ply = this.ply();
		game = this.state();
		(ply === 0) && this.onBegin(game);
		while (game instanceof Aleatory) {
			this.__advance__(game.instantiate());
			game = this.state();
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
				match.__advance__(game.next(moves), moves);
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
