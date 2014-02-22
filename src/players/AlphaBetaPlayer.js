/** Automatic players based on MiniMax with alfa-beta pruning.
*/
players.AlphaBetaPlayer = declare(MiniMaxPlayer, {
	/** new players.AlphaBetaPlayer(params):
		Builds a player that chooses its moves using the MiniMax algorithm with
		alfa-beta pruning.
	*/
	constructor: function AlphaBetaPlayer(params) {
		MiniMaxPlayer.call(this, params);
	},

	/** players.AlphaBetaPlayer.stateEvaluation(game, player):
		Returns the minimax value for the given game and player.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		return this.minimax(game, player, 0, -Infinity, Infinity);
	},

	/** players.AlphaBetaPlayer.minimax(game, player, depth, alfa, beta):
		Minimax evaluation of the given game for the given player. If the game
		is not finished and the depth is greater than the horizon, the heuristic
		is used.
	*/
	minimax: function minimax(game, player, depth, alpha, beta) {
		var value = this.quiescence(game, player, depth);
		if (!isNaN(value)) {
			return value;
		}
		var activePlayer = game.activePlayer(),
			isActive = activePlayer == player,
			moves = this.__moves__(game, activePlayer), next;
		if (moves.length < 1) {
			throw new Error('No moves for unfinished game '+ game +'.');
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
	}
}); // declare AlphaBetaPlayer.
