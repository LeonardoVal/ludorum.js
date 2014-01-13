/** Automatic players based on MiniMax with alfa-beta pruning.
*/
players.MiniMaxPlayer = basis.declare(HeuristicPlayer, {
	/** new players.MiniMaxPlayer(name='MiniMax', heuristic, horizon=3, random=randomness.DEFAULT):
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

	/** players.MiniMaxPlayer.stateEvaluation(game, player):
		Returns the minimax value for the given game and player.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		var result = this.minimax(game, player, 0, -Infinity, Infinity);
		return result;
	},

	/** players.MiniMaxPlayer.heuristic(game, player):
		Game state evaluation used at the leaves of the game search tree that
		are not finished games.
	*/
	heuristic: function heuristic(game, player) {
		return this.random.random(-0.5, 0.5);
	},

	/** players.MiniMaxPlayer.minimax(game, player, depth, alfa, beta):
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
