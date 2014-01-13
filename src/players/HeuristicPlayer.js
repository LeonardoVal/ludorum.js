/** Base type for automatic players based on heuristic evaluations of game
	states or moves.
*/
var HeuristicPlayer = players.HeuristicPlayer = basis.declare(Player, {
	/** new players.HeuristicPlayer(name, random, heuristic):
		Builds a player that evaluates its moves and chooses one of the best
		evaluated.
	*/
	constructor: function HeuristicPlayer(name, random, moveEvaluation, stateEvaluation) {
		Player.call(this, name);
		this.random = random || basis.Randomness.DEFAULT;
		if (moveEvaluation) {
			this.moveEvaluation = moveEvaluation;
		}
		if (stateEvaluation) {
			this.stateEvaluation = stateEvaluation;
		}
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
		return this.stateEvaluation(game.next(basis.obj(player, move)), player);
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

	/** players.HeuristicPlayer.decision(game, player):
		Selects randomly from the best evaluated moves.
	*/
	decision: function decision(game, player) {
		var heuristicPlayer = this,
			future = new basis.Future();
		setTimeout(function () {
			try {
				var max = -Infinity, best = [], 
					moves = heuristicPlayer.__moves__(game, player), move, e;
				for (var i = 0; i < moves.length; i++) {
					move = moves[i];
					e = heuristicPlayer.moveEvaluation(move, game, player);
					if (e > max) {
						best = [move];
						max = e;
					} else if (e == max) {
						best.push(move);
					}
				}
				future.resolve(heuristicPlayer.random.choice(best));
			} catch (err) {
				future.reject(err);
			}
		}, 1);
		return future;
	}
}); // declare HeuristicPlayer.
