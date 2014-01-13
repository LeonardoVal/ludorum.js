/** Automatic players based on Monte Carlo tree search.
*/
players.MonteCarloPlayer = basis.declare(HeuristicPlayer, {
	/** new players.MonteCarloPlayer(name, random, simulationCount=30):
		Builds a player that evaluates its moves using Monte-Carlo 
		simulations (random games).
	*/
	constructor: function MonteCarloPlayer(name, random, simulationCount) {
		HeuristicPlayer.call(this, name, random);
		this.simulationCount = isNaN(simulationCount) ? 30 : +simulationCount >> 0;
	},
	
	/** players.MonteCarloPlayer.stateEvaluation(game, player):
		Returns the minimax value for the given game and player.
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
		for (moves = game.moves(); moves; moves = game.moves()) {
			move = {};
			game.activePlayers.forEach(function (activePlayer) {
				move[activePlayer] = mc.random.choice(moves[activePlayer]);
			});
			game = game.next(move)
		}
		return game.result()[player];
	}
}); // declare MonteCarloPlayer
