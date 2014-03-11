/** Automatic players based on the MaxN algorithm.
*/
var MaxNPlayer = players.MaxNPlayer = declare(HeuristicPlayer, {
	/** new players.MaxNPlayer(params):
		Builds a player that chooses its moves using the MiniMax algorithm with
		alfa-beta pruning.
	*/
	constructor: function MaxNPlayer(params) {
		HeuristicPlayer.call(this, params);
		initialize(this, params)
		/** players.MaxNPlayer.horizon=3:
			Maximum depth for the MiniMax search.
		*/
			.integer('horizon', { defaultValue: 3, coerce: true })
	},

	/** players.MaxNPlayer.stateEvaluation(game, player):
		Returns the minimax value for the given game and player.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		return this.maxN(game, player, 0)[player];
	},

	/** players.MaxNPlayer.heuristics(game):
		Returns the heuristics value for each players in the game, as an object.
	*/
	heuristics: function heuristic(game) {
		var result = {}, maxN = this;
		game.players.forEach(function (role) {
			result[role] = maxN.heuristic(game, role);
		});
		return result;
	},

	/** players.MaxNPlayer.quiescence(game, player, depth):
		An stability test for the given game state. If the game is quiescent, 
		this function must return evaluations. Else it must return null. 
		Final game states are always quiescent, and their evaluations are the 
		game's result for each player. This default implementation also return 
		heuristic evaluations for every game state at a deeper depth than the 
		player's horizon.
	*/
	quiescence: function quiescence(game, player, depth) {
		var results = game.result();
		if (results) {
			return results;
		} else if (depth >= this.horizon) {
			return this.heuristics(game);
		} else {
			return null;
		}
	},
	
	/** players.MaxNPlayer.maxN(game, player, depth):
		Return the evaluations for each player of the given game, assuming each
		player tries to maximize its own evaluation regardless of the others'.
	*/
	maxN: function maxN(game, player, depth) {
		var values = this.quiescence(game, player, depth);
		if (!values) { // game is not quiescent.
			var activePlayer = game.activePlayer(),
				moves = this.__moves__(game, activePlayer),
				values = {},
				otherValues, next;
			if (moves.length < 1) {
				throw new Error('No moves for unfinished game '+ game +'.');
			}
			for (var i = 0; i < moves.length; ++i) {
				next = game.next(obj(activePlayer, moves[i]));
				otherValues = this.maxN(next, player, depth + 1);
				if (otherValues[activePlayer] > (values[activePlayer] || -Infinity)) {
					values = otherValues;
				}
			}
		}
		return values;
	},
	
	toString: function toString() {
		return (this.constructor.name || 'MaxNPlayer') +'('+ JSON.stringify({
			name: this.name, horizon: this.horizon
		}) +')';
	}
}); // declare MiniMaxPlayer.
