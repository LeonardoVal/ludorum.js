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
			return n.uct.results / n.uct.visits + 
				explorationConstant * Math.sqrt(Math.log(totalSimulationCount) / n.uct.visits);
		}));
	},
	
	/** `selectMoves(moves, game, player)` return an array with the best evaluated moves.
	*/
	selectMoves: function selectMoves(moves, game, player) {
		var root = new GameTree(null, game),
			endTime = Date.now() + this.timeCap,
			node, simulationResult;
		root.uct = {
			pending: this.random.shuffle(root.possibleTransitions()), visits: 0, results: 0
		};
		for (var i = 0; i < this.simulationCount && Date.now() < endTime; ++i) {
			node = root;
			while (node.uct.pending.length < 1 && node.childrenCount() > 0) { // Selection
				node = this.selectNode(node, i+1, this.explorationConstant);
			}
			if (node.uct.pending.length > 0) { // Expansion
				node = node.expand(node.uct.pending.pop());
				node.uct = {
					pending: this.random.shuffle(node.possibleTransitions()), visits: 0, results: 0
				};
			}
			simulationResult = this.simulation(node.state, player); // Simulation
			for (; node; node = node.parent) { // Backpropagation
				++node.uct.visits;
				node.uct.results += simulationResult.result[player];
				/* if (simulationResult.result[player] > 0) { // If player won in the simulation ...
					node.uct.wins = (node.uct.wins |0) + 1;
				}*/
			}
		}
		moves = iterable(root.children).select(1).greater(function (n) {
			return n.uct.visits;
		}).map(function (n) {
			return n.transition;
		});
		return moves;
	},
	
	__serialize__: function __serialize__() {
		return [this.constructor.name, { name: this.name, 
			simulationCount: this.simulationCount, timeCap: this.timeCap, 
			explorationConstant: this.explorationConstant 
		}];
	}
}); // declare MonteCarloPlayer
