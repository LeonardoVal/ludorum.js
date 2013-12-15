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
		/** Match.moves:
			Moves array, running parallel to the history.
		*/
		this.moves = [null];
		/** Match.events:
			Event handler for this match. Emitted events are: begin, move & end.
		*/
		this.events = new basis.Events({ 
			events: "begin move end".split(' ')
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
			return basis.when(players[p].decision(game, p));
		}));
	},

	/** Match.__next__(moves):
		Advances this match's history to the next game state. Returns the 
		next game state.
	*/
	__next__: function __next__(moves) {
		var game = this.state();
		if (Array.isArray(moves)) { // If moves is an array, build a moves object from it.
			moves = basis.iterable(game.activePlayers).zip(moves).toObject();
		} 
		var next = game.next(moves);
		this.history.push(next);
		this.moves.push(moves);
		this.events.emit('begin', moves, game, next, this);
		this.logger && this.logger.info('Match advances: moves= ', JSON.stringify(moves), ' game= ', next);
		return next;
	},

	/** Match.run(plys=Infinity):
		Runs the match the given number of plys or until the game finishes.
		The result is a future that gets resolved when running ends.
	*/
	run: function run(plys) {
		plys = isNaN(plys) ? Infinity : +plys;
		var game = this.history[this.ply()],
			results = game.result();
		if (this.ply() === 0) {
			this.events.emit('begin', this.players, game, this);
			this.logger && this.logger.info('Match begins with ', 
				basis.iterable(this.players).map(function (attr) {
					return attr[1] +' as '+ attr[0];
				}).join(', '), '; for ', game, '.');
		}
		if (results) { // If the match has finished ...
			this.events.emit('end', game, results, this);
			this.logger && this.logger.info('Match ends: results= ', JSON.stringify(results), ' game= ', game);
			return basis.when(this);
		} else if (plys < 1) { // If the run must stop...
			return basis.when(this);
		} else { // Else the run must continue ...
			var match = this;
			return this.decisions(game).then(function (moves) {
				match.__next__(Array.isArray(moves) ? moves : [moves]);
				return match.run(plys - 1);
			});
		}
	}
}); // declare Match.
