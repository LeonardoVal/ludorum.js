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
			.number('timeCap', { defaultValue: 1000, coerce: true })
		/** players.MonteCarloPlayer.agent:
			Player instance used in the simulations. If undefined moves are
			chosen at random.
			Warning! Agent with asynchronous decisions are not supported.
		*/
			.object('agent', { defaultValue: null });
	},
	
	/** players.MonteCarloPlayer.selectMoves(moves, game, player):
		Return an array with the best evaluated moves.
	*/
	selectMoves: function selectMoves(moves, game, player) {
		var monteCarloPlayer = this,
			endTime = Date.now() + this.timeCap,
			options = moves.map(function (move) {
				return { move: move, next: game.next(obj(player, move)), 
					isFinal: false, sum: 0, count: 0 
				};
			});
		for (var i = 0; i < this.simulationCount && Date.now() < endTime; ++i) {
			options.forEach(function (option) {
				if (!option.isFinal) {
					var sim = monteCarloPlayer.simulation(option.next, player);
					option.isFinal = sim.plies < 1;
					option.sum += sim.result[player];
					++option.count;
				}
			});
		}
		return iterable(options).greater(function (option) {
			return option.count > 0 ? option.sum / option.count : 0;
		}).map(function (option) {
			return option.move;
		});
	},
	
	/** players.MonteCarloPlayer.stateEvaluation(game, player):
		Runs this.simulationCount simulations and returns the average result.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		var resultSum = 0, 
			simulationCount = this.simulationCount,
			sim;
		for (var i = 0; i < simulationCount; ++i) {
			sim = this.simulation(game, player);
			resultSum += sim.result[player];
			if (sim.plies < 1) { // game is final.
				break;
			}
		}
		return simulationCount > 0 ? resultSum / simulationCount : 0;
	},
	
	/** players.MonteCarloPlayer.simulation(game, player):
		Simulates a random match from the given game and returns an object with
		the final state (game), its result (result) and the number of plies 
		simulated (plies).
	*/
	simulation: function simulation(game, player) {
		var mc = this,
			plies, move, moves;
		for (plies = 0; true; ++plies) {
			if (game instanceof Aleatory) {
				game = game.instantiate();
			} else {
				moves = game.moves();
				if (!moves) {
					return { game: game, result: game.result(), plies: plies };
				}
				move = {};
				game.activePlayers.forEach(function (activePlayer) {
					move[activePlayer] = mc.agent ? mc.agent.decision(game, activePlayer) 
						: mc.random.choice(moves[activePlayer]);
				});
				game = game.next(move);
			}
		}
		//return { game: game, result: game.result(), plies: plies };
	},
	
	toString: function toString() {
		return (this.constructor.name || 'MonteCarloPlayer') +'('+ JSON.stringify({
			name: this.name, simulationCount: this.simulationCount, timeCap: this.timeCap
		}) +')';
	}
}); // declare MonteCarloPlayer
