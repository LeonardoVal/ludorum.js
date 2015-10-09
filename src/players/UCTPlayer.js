/** # UCTPlayer

Automatic player based on Upper Confidence Bound Monte Carlo tree search.
*/
players.UCTPlayer = declare(MonteCarloPlayer, {
	/** The constructor parameters may include:
	
	+ `simulationCount=30`: Maximum amount of simulations performed at each decision.
	+ `timeCap=1000ms`: Time limit for the player to decide.
	*/
	constructor: function UCBPlayer(params) {
		MonteCarloPlayer.call(this, params);
		initialize(this, params)
		/** + `explorationConstant=sqrt(2)`: The exploration factor used in the UCT selection.
		*/
			.number('explorationConstant', { defaultValue: Math.sqrt(2), coerce: true })
		;
	},
	
	/** Evaluate all child nodes of the given `gameTree` according to the [Upper Confidence Bound
	formula by L. Kocsis and Cs. Szepesvári](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.102.1296). 
	Returns one of the greatest evaluated, chosen at random.
	*/
	selectNode: function selectNode(gameTree, totalSimulationCount, explorationConstant) {
		explorationConstant = isNaN(explorationConstant) ? this.explorationConstant : +explorationConstant;
		return this.random.choice(iterable(gameTree.children).select(1).greater(function (n) {
			return n.uct.rewards / n.uct.visits + 
				explorationConstant * Math.sqrt(Math.log(totalSimulationCount) / n.uct.visits);
		}));
	},
	
	/** `evaluatedMoves(game, player)` return a sequence with the evaluated moves.
	*/
	evaluatedMoves: function evaluatedMoves(game, player) {
		var root = new GameTree(null, game),
			endTime = Date.now() + this.timeCap,
			node, simulationResult;
		root.uct = {
			pending: this.random.shuffle(root.possibleTransitions()), visits: 0, rewards: 0
		};
		for (var i = 0; i < this.simulationCount && Date.now() < endTime; ++i) {
			node = root;
			while (node.uct.pending.length < 1 && node.childrenCount() > 0) { // Selection
				node = this.selectNode(node, i+1, this.explorationConstant);
			}
			if (node.uct.pending.length > 0) { // Expansion
				node = node.expand(node.uct.pending.pop());
				node.uct = {
					pending: this.random.shuffle(node.possibleTransitions()), visits: 0, rewards: 0
				};
			}
			simulationResult = this.simulation(node.state, player); // Simulation
			for (; node; node = node.parent) { // Backpropagation
				++node.uct.visits;
				node.uct.rewards += (game.normalizedResult(simulationResult.result)[player] + 1) / 2;
			}
		}
		return iterable(root.children).select(1).map(function (n) {
			return [n.transition, n.uct.visits];
		});
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'UCTPlayer',
		serializer: function serialize_UCTPlayer(obj) {
			return this.serializeAsProperties(obj, ['name', 'simulationCount', 'timeCap', 'explorationConstant']);
		}
	}
}); // declare UCTPlayer
