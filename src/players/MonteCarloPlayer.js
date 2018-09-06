/** # MonteCarloPlayer

Automatic player based on flat Monte Carlo tree search.
*/
var MonteCarloPlayer = players.MonteCarloPlayer = declare(HeuristicPlayer, {
	/** The constructor builds a player that chooses its moves using the
	[flat Monte Carlo game tree search method](http://en.wikipedia.org/wiki/Monte-Carlo_tree_search).
	The parameters may include:

	+ `simulationCount=30`: Maximum amount of simulations performed for each available move at each
		decision.
	+ `timeCap=1000ms`: Time limit for the player to decide.
	+ `horizon=500`: Maximum amount of moves performed in simulations.
	+ `agent`: Player instance used in the simulations. If undefined moves are chosen at random.
		Agents with asynchronous decisions are not supported.
	*/
	constructor: function MonteCarloPlayer(params) {
		HeuristicPlayer.call(this, params);
		var prototype = Object.getPrototypeOf(this);
		initialize(this, params)
			.number('simulationCount', { defaultValue: prototype.simulationCount, coerce: true })
			.number('timeCap', { defaultValue: prototype.timeCap, coerce: true })
			.number('horizon', { defaultValue: prototype.horizon, coerce: true });
		if (params) switch (typeof params.agent) {
			case 'function': this.agent = new HeuristicPlayer({ heuristic: params.agent }); break;
			case 'object': this.agent = params.agent; break;
			default: this.agent = null;
		}
	},

	simulationCount: 30,
	timeCap: 1000,
	horizon: 500,

	/** `evaluatedMoves(game, player)` returns a sequence with the evaluated moves.
	*/
	evaluatedMoves: function evaluatedMoves(game, player) {
		raiseIf(game.isContingent, "MonteCarloPlayer cannot evaluate root contingent states!"); //FIXME
		var monteCarloPlayer = this,
			startTime = Date.now(),
			options = this.possibleMoves(game, player).map(function (move) {
				return {
					move: move,
					nexts: (Object.keys(move).length < 2 ?
						[game.next(move)] :
						game.possibleMoves(copy(obj(player, [move[player]]), move)).map(function (moves) {
							return game.next(moves);
						})
					),
					sum: 0,
					count: 0
				};
			}); // Else the following updates won't work.
		for (var i = 0; !this.__finishMoveEvaluation__(i, startTime, options); ) {
			options.forEach(function (option) {
				option.nexts = option.nexts.filter(function (next) {
					var sim = monteCarloPlayer.simulation(next, player);
					option.sum += sim.result;
					++option.count;
					return sim.plies > 0;
				});
				i++;
			});
		}
		return options.map(function (option) {
			raiseIf(isNaN(option.sum), "State evaluation is NaN for move ", option.move, "!");
			return [option.move, option.count > 0 ? option.sum / option.count : 0, option.count];
		});
	},

	/** The move evaluation can be finished on many criteria. By default, `simulationCount` and 
	`timeCap` are considered.
	*/
	__finishMoveEvaluation__: function __finishMoveEvaluation__(simCount, startTime, data) {
		return simCount > this.simulationCount || startTime + this.timeCap < Date.now();
	},

	/** This player's `stateEvaluation(game, player)` runs `simulationCount` simulations and returns
	the average result. It is provided for compatibility, since `evaluatedMoves` does not call it.
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

	/**TODO
	*/
	quiescence: function quiescence(game, player, depth) {
		var result = game.result();
		if (result) {
			return result[player];
		} else if (depth >= this.horizon) {
			return this.heuristic(game, player);
		} else {
			return NaN;
		}
	},

	/** A `simulation(game, player)` plays a random match from the given `game` state and returns an
	object with the final state (`game`), its result (`result`) and the number of plies simulated
	(`plies`).
	*/
	simulation: function simulation(game, player) {
		var result = { game: game },
			plies;
		for (plies = 0; true; ++plies) {
			if (game.isContingent) {
				game = game.randomNext(this.random);
			} else {
				var q = this.quiescence(game, player, plies + 1);
				if (isNaN(q)) { // The simulation continues.
					game = game.randomNext(this.random, plies > 0).state; // The original `game` argument must not be changed.
				} else { // The simulation has a result and ends.
					result.result = q;
					result.plies = plies;
					return result;
				}
			}
		}
		raise("Simulation ended unexpectedly for player ", player, " in game ", game, "!");
	},

	// ## Utilities ################################################################################

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'MonteCarloPlayer',
		serializer: function serialize_MonteCarloPlayer(obj) {
			var ser = HeuristicPlayer.__SERMAT__.serializer(obj),
				args = ser[0];
			args.simulationCount = obj.simulationCount;
			args.timeCap = obj.timeCap;
			args.horizon = obj.horizon;
			if (obj.agent) {
				args.agent = obj.agent;
			}
			return ser;
		}
	}
}); // declare MonteCarloPlayer
