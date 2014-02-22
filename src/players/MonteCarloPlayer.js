/** Automatic player based on pure Monte Carlo tree search.
*/
players.MonteCarloPlayer = declare(HeuristicPlayer, {
	/** new players.MonteCarloPlayer(params):
		Builds a player that chooses its moves using the [pure Monte Carlo game
		tree search method](http://en.wikipedia.org/wiki/Monte-Carlo_tree_search).
	*/
	constructor: function MonteCarloPlayer(params) {
		HeuristicPlayer.call(this, params);
		initialize(this, params)
		/** players.MonteCarloPlayer.simulationCount=30:
			Maximum amount of simulations performed for each available move at
			each decision.
		*/
			.number('simulationCount', { defaultValue: 30, coerce: true })
		/** players.MonteCarloPlayer.timeCap=1000ms:
			Time limit for the player to decide.
		*/
			.number('timeCap', { defaultValue: 1000, coerce: true });
	},
	
	/** players.MonteCarloPlayer.selectMoves(moves, game, player):
		Return an array with the best evaluated moves.
	*/
	selectMoves: function selectMoves(moves, game, player) {
		var monteCarloPlayer = this,
			endTime = Date.now() + this.timeCap,
			moves = moves.map(function (move) {
				return { 
					move: move, 
					next: game.next(obj(player, move)), 
					sum: 0,
					count: 0
				};
			});
		for (var i = this.simulationCount; i > 0 && Date.now() < endTime; --i) {
			moves.forEach(function (move) {
				move.sum += monteCarloPlayer.simulation(move.next, player);
				++move.count;
			});
		}
		return iterable(moves).greater(function (move) {
			return move.sum / move.count;
		}).map(function (move) {
			return move.move;
		});
	},
	
	/** players.MonteCarloPlayer.stateEvaluation(game, player):
		Runs this.simulationCount simulations and returns the average result.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		var resultSum = 0;
		for (var i = this.simulationCount; i > 0; i--) {
			resultSum += this.simulation(game, player);
		}
		return resultSum / this.simulationCount;
	},
	
	/** players.MonteCarloPlayer.simulation(game, player):
		Simulates a random match from the given game and returns the result
		for the given player.
	*/
	simulation: function simulation(game, player) {
		var mc = this, move, moves;
		while (true) {
			if (game instanceof Aleatory) {
				game = game.instantiate();
			} else {
				moves = game.moves();
				if (!moves) {
					break;
				}
				move = {};
				game.activePlayers.forEach(function (activePlayer) {
					return move[activePlayer] = mc.random.choice(moves[activePlayer]);
				});
				game = game.next(move);
			}
		}
		return game.result()[player];
	},
	
	toString: function toString() {
		return (this.constructor.name || 'MonteCarloPlayer') +'('+ JSON.stringify({
			name: this.name, simulationCount: this.simulationCount, timeCap: this.timeCap
		}) +')';
	}
}); // declare MonteCarloPlayer
