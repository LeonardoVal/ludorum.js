/** Base type for automatic players based on heuristic evaluations of game
	states or moves.
*/
var HeuristicPlayer = players.HeuristicPlayer = declare(Player, {
	/** new players.HeuristicPlayer(name, params):
		Builds a player that evaluates its moves and chooses one of the best
		evaluated.
	*/
	constructor: function HeuristicPlayer(name, params) {
		Player.call(this, name);
		initialize(this, params)
		/** players.HeuristicPlayer.random=basis.Randomness.DEFAULT:
			Pseudorandom number generator used for random decisions.
		*/
			.object('random', { defaultValue: Randomness.DEFAULT })
			.func('moveEvaluation', { ignore: true })
			.func('stateEvaluation', { ignore: true });
	},

	toString: function toString() {
		return 'HeuristicPlayer('+ JSON.stringify(this.name) +')';
	},

	/** players.HeuristicPlayer.moveEvaluation(move, game, player):
		Calculates a number as the assessment of the given move. The base
		implementation calculates the resulting game state and returns the 
		stateEvaluation of it.
	*/
	moveEvaluation: function moveEvaluation(move, game, player) {
		return this.stateEvaluation(game.next(obj(player, move)), player);
	},

	/** players.HeuristicPlayer.stateEvaluation(game, player):
		Calculates a number as the assessment of the given game state. The 
		base implementation returns the result for the player is the game 
		has results. 
		Else it returns a random number in [-0.5, 0.5). This is only useful 
		in testing this framework. Any serious use should override it.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		var gameResult = game.result();
		return gameResult ? gameResult[player] : this.random.random(-0.5, 0.5);
	},

	/** players.HeuristicPlayer.selectMoves(moves, game, player):
		Return an array with the best evaluated moves. The evaluation is done by
		the moveEvaluation method. The default implementation always returns a
		Future.
	*/
	selectMoves: function selectMoves(moves, game, player) {
		var heuristicPlayer = this;
		return Future.all(moves.map(function (move) {
			return heuristicPlayer.moveEvaluation(move, game, player);
		})).then(function (evals) {
			return iterable(moves).zip(evals).greater(function (pair) {
				return pair[1];
			}).map(function (pair) {
				return pair[0];
			});
		});
	},
	
	/** players.HeuristicPlayer.decision(game, player):
		Selects randomly from the best evaluated moves.
	*/
	decision: function decision(game, player) {
		var heuristicPlayer = this;
		return Future.when(
			heuristicPlayer.selectMoves(heuristicPlayer.__moves__(game, player), game, player)
		).then(function (bestMoves) {
			return heuristicPlayer.random.choice(bestMoves);
		});
	}
}); // declare HeuristicPlayer.
