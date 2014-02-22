/** Automatic players based on pure MiniMax.
*/
var MiniMaxPlayer = players.MiniMaxPlayer = declare(HeuristicPlayer, {
	/** new players.MiniMaxPlayer(params):
		Builds a player that chooses its moves using the MiniMax algorithm with
		alfa-beta pruning.
	*/
	constructor: function MiniMaxPlayer(params) {
		HeuristicPlayer.call(this, params);
		initialize(this, params)
		/** players.MiniMaxPlayer.horizon=3:
			Maximum depth for the MiniMax search.
		*/
			.integer('horizon', { defaultValue: 3, coerce: true })
			.func('heuristic', { ignore: true });
	},

	/** players.MiniMaxPlayer.stateEvaluation(game, player):
		Returns the minimax value for the given game and player.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		return this.minimax(game, player, 0);
	},

	/** players.MiniMaxPlayer.heuristic(game, player):
		Game state evaluation used at the leaves of the game search tree that
		are not finished games.
	*/
	heuristic: function heuristic(game, player) {
		return this.random.random(-0.5, 0.5);
	},

	/** players.MiniMaxPlayer.quiescence(game, player, depth):
		An stability test for the given game state. If the game is quiescent, 
		this function must return an evaluation. Else it must return NaN or an
		equivalente value. Final game states are always quiescent, and their
		evaluation is the game's result for the given player. This default
		implementation also return an heuristic evaluation for every game
		state at a deeper depth than the player's horizon.
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
	
	/** players.MiniMaxPlayer.minimax(game, player, depth):
		Minimax evaluation of the given game for the given player. If the game
		is not finished and the depth is greater than the horizon, the heuristic
		is used.
	*/
	minimax: function minimax(game, player, depth) {
		var value = this.quiescence(game, player, depth);
		if (isNaN(value)) { // game is not quiescent.
			var activePlayer = game.activePlayer(),
				moves = this.__moves__(game, activePlayer), 
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
	
	toString: function toString() {
		return (this.constructor.name || 'MiniMaxPlayer') +'('+ JSON.stringify({
			name: this.name, horizon: this.horizon
		}) +')';
	}
}); // declare MiniMaxPlayer.
