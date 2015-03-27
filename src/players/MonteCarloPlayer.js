/** # MonteCarloPlayer

Automatic player based on flat Monte Carlo tree search.
*/
var MonteCarloPlayer = players.MonteCarloPlayer = declare(HeuristicPlayer, {
	/** The constructor builds a player that chooses its moves using the 
	[flat Monte Carlo game tree search method](http://en.wikipedia.org/wiki/Monte-Carlo_tree_search). 
	The parameters may include:
	
	+ `simulationCount=30`: Maximum amount of simulations performed for each 
		available move at each decision.
	+ `timeCap=1000ms`: Time limit for the player to decide.
	+ `horizon=500`: Maximum amount of moves performed in simulations.
	+ `agent`: Player instance used in the simulations. If undefined moves are
		chosen at random. Agents with asynchronous decisions are not supported.
	*/
	constructor: function MonteCarloPlayer(params) {
		HeuristicPlayer.call(this, params);
		initialize(this, params)
			.number('simulationCount', { defaultValue: 30, coerce: true })
			.number('timeCap', { defaultValue: 1000, coerce: true })
			.number('horizon', { defaultValue: 500, coerce: true });
		if (params) switch (typeof params.agent) {
			case 'function': this.agent = new HeuristicPlayer({ heuristic: params.agent }); break;
			case 'object': this.agent = params.agent; break;
			default: this.agent = null;
		}
	},
	
	/** `selectMoves(moves, game, player)` return an array with the best 
	evaluated moves.
	*/
	selectMoves: function selectMoves(moves, game, player) {
		var monteCarloPlayer = this,
			endTime = Date.now() + this.timeCap,
			gameNext = game.next.bind(game),
			options = moves.map(function (move) {
				return { 
					move: move, 
					nexts: (Object.keys(move).length < 2 ? 
						[game.next(move)] :
						game.possibleMoves(copy(obj(player, [move[player]]), move)).map(gameNext)
					),
					sum: 0, 
					count: 0 
				};
			});
		for (var i = 0; i < this.simulationCount && Date.now() < endTime; ++i) {
			options.forEach(function (option) {
				option.nexts = option.nexts.filter(function (next) {
					var sim = monteCarloPlayer.simulation(next, player);
					option.sum += sim.result[player];
					++option.count;
					return sim.plies > 0;
				});
			});
		}
		options = iterable(options).greater(function (option) {
			raiseIf(isNaN(option.sum), "State evaluation is NaN for move ", option.move, "!");
			return option.count > 0 ? option.sum / option.count : 0;
		}).map(function (option) {
			return option.move;
		});
		return options;
	},
	
	/** This player's `stateEvaluation(game, player)` runs `simulationCount` 
	simulations and returns the average result.
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
	
	/** A `simulation(game, player)` plays a random match from the given `game`
	state and returns an object with the final state (`game`), its result 
	(`result`) and the number of plies simulated (`plies`).
	*/
	simulation: function simulation(game, player) {
		var mc = this,
			plies, move, moves;
		for (plies = 0; true; ++plies) {
			if (game instanceof Aleatory) {
				game = game.next();
			} else {
				moves = game.moves();
				if (!moves) { // If game state is final ...
					return { game: game, result: game.result(), plies: plies };
				} else if (plies > this.horizon) { // If past horizon ...
					return { game: game, result: obj(player, this.heuristic(game, player)), plies: plies };
				} else { // ... else advance.
					move = {};
					game.activePlayers.forEach(function (activePlayer) {
						move[activePlayer] = mc.agent ? mc.agent.decision(game, activePlayer) 
							: mc.random.choice(moves[activePlayer]);
					});
					game = game.next(move);
				}
			}
		}
		raise("Simulation ended unexpectedly for player ", player, " in game ", game, "!");
	},
	
	__serialize__: function __serialize__() {
		return [this.constructor.name, { name: this.name, 
			simulationCount: this.simulationCount, timeCap: this.timeCap, 
			agent: this.agent 
		}];
	}
}); // declare MonteCarloPlayer
