/** # UCTPlayer

Automatic player based on Upper Confidence Bound Monte Carlo tree search.
*/
players.UCTPlayer = declare(MonteCarloPlayer, {
	/** The constructor parameters may include:

	+ `simulationCount`: Maximum amount of simulations performed at each decision.
	+ `timeCap`: Time limit for the player to decide.
	*/
	constructor: function UCTPlayer(params) {
		MonteCarloPlayer.call(this, params);
		var prototype = Object.getPrototypeOf(this);
		initialize(this, params)
		/** + `explorationConstant=sqrt(2)`: The exploration factor used in the UCT selection.
		*/
			.number('explorationConstant', { defaultValue: prototype.explorationConstant, coerce: true })
		;
	},

	explorationConstant: Math.sqrt(2),

	/** Evaluate all child nodes of the given `node` according to the [Upper Confidence Bound
	formula by L. Kocsis and Cs. Szepesvári](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.102.1296).
	Returns one of the greatest evaluated, chosen at random.
	*/
	selectNode: function selectNode(parent, totalSimulationCount, explorationConstant) {
		explorationConstant = isNaN(explorationConstant) ? this.explorationConstant : +explorationConstant;
		return this.random.choice(iterable(parent.children).greater(function (node) {
			raiseIf(!node.uct, 'Invalid UCT node `'+ node +'` under `'+ parent +'`!');//FIXME
			var visits = node.uct.visits;
			return (node.uct.rewards + visits) / visits / 2 +
				explorationConstant * Math.sqrt(Math.log(parent.uct.visits) / visits);
		}));
	},

	/** `evaluatedMoves(game, player)` return a sequence with the evaluated moves.
	*/
	evaluatedMoves: function evaluatedMoves(game, player) {
		var root = new GameTree({ state: game }),
			startTime = Date.now(),
			node, simulationResult;
		root.uct = { pending: root.childrenCount(), visits: 0, rewards: 0 };
		for (var i = 0;  !this.__finishMoveEvaluation__(i, startTime, root); i++) {
			node = root;
			while (node.uct.pending < 1 && node.childrenCount() > 0) { // Selection
				node = this.selectNode(node, i+1, this.explorationConstant);
			}
			if (node.uct.pending > 0) { // Expansion
				node.uct.pending--;
				node = node.expandRandom(this.random);
				node.uct = { pending: node.childrenCount(), visits: 0, rewards: 0 };
			}
			simulationResult = this.simulation(node.state, player); // Simulation
			for (; node; node = node.parent) { // Backpropagation
				node.uct.visits++;
				node.uct.rewards += game.normalizedResult(simulationResult.result);
			}
		}
		var result = iterable(root.children).map(function (n) {
				return n.uct ?
					[n.transition, n.uct.rewards / n.uct.visits, n.uct.visits] :
					[n.transition, 0, 0]; //FIXME Is 0 for unevaluated nodes OK? 
			}).toArray();
		//console.log(root);//FIXME
		//console.log(result);//FIXME
		return result;
	},

	// ## Utilities ################################################################################

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'UCTPlayer',
		serializer: function serialize_UCTPlayer(obj) {
			var ser = MonteCarloPlayer.__SERMAT__.serializer(obj),
				args = ser[0];
			args.explorationConstant = obj.explorationConstant;
			return ser;
		}
	}
}); // declare UCTPlayer
