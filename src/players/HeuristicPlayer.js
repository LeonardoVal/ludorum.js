/** # HeuristicPlayer

This is the base type of automatic players based on heuristic evaluations of 
game states or moves.
*/
var HeuristicPlayer = players.HeuristicPlayer = declare(Player, {
	/** The constructor takes the player's `name` and a `random` number 
	generator (`base.Randomness.DEFAULT` by default). Many heuristic can be 
	based on randomness, but this is also necessary to chose between moves with
	the same evaluation without any bias.
	*/
	constructor: function HeuristicPlayer(params) {
		Player.call(this, params);
		initialize(this, params)
			.object('random', { defaultValue: Randomness.DEFAULT })
			.func('heuristic', { ignore: true });
	},

	/** An `HeuristicPlayer` choses the best moves at any given game state. For
	this purpose it evaluates every move with 
	`moveEvaluation(move, game, player)`. By default this function evaluates
	the states resulting from making each move, which is the most common thing
	to do.
	*/
	moveEvaluation: function moveEvaluation(move, game, player) {
		if (Object.keys(move).length < 2) { // One active player.
			return this.stateEvaluation(game.next(move), player);
		} else { // Many active players.
			var sum = 0, count = 0,
				move = copy(obj(player, [move[player]]), move);
			game.possibleMoves(move).forEach(function (ms) {
				sum += this.stateEvaluation(game.next(ms), player);
				++count;
			});
			return count > 0 ? sum / count : 0; // Average all evaluations.
		}
	},

	/** The `stateEvaluation(game, player)` calculates a number as the 
	assessment of the given game state for the given player. The base 
	implementation returns the result for the player is the game has results, 
	else it returns the heuristic value for the state.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		var gameResult = game.result();
		return gameResult ? gameResult[player] : this.heuristic(game, player);
	},

	/** The `heuristic(game, player)` is an evaluation used at states that are 
	not finished games. The default implementation returns a random number in 
	[-0.5, 0.5). This is only useful in testing. Any serious use should redefine 
	this.
	*/
	heuristic: function heuristic(game, player) {
		return this.random.random(-0.5, 0.5);
	},
	
	/** The `bestMoves(evaluatedMoves)` are all the best evaluated in the given
	sequence of tuples [move, evaluation].
	*/
	bestMoves: function bestMoves(evaluatedMoves) {
		return iterable(evaluatedMoves).greater(function (pair) {
			return pair[1];
		}).map(function (pair) {
			return pair[0];
		});
	},
	
	/** `selectMoves(moves, game, player)` return an array with the best 
	evaluated moves. The evaluation is done with the `moveEvaluation` method. 
	The default implementation always returns a `Future`.
	*/
	selectMoves: function selectMoves(moves, game, player) {
		var heuristicPlayer = this,
			asyncEvaluations = false,
			evaluatedMoves = moves.map(function (move) {
				var e = heuristicPlayer.moveEvaluation(move, game, player);
				if (e instanceof Future) {
					asyncEvaluations = asyncEvaluations || true;
					return e.then(function (e) {
						return [move, e];
					});
				} else {
					return [move, e];
				}
			});
		if (asyncEvaluations) { // Avoid using Future if possible.
			return Future.all(evaluatedMoves).then(this.bestMoves);
		} else {
			return this.bestMoves(evaluatedMoves);
		}
	},
	
	/** The `decision(game, player)` selects randomly from the best evaluated 
	moves.
	*/
	decision: function decision(game, player) {
		var heuristicPlayer = this,
			moves = game.moves();
		raiseIf(!moves || !moves.hasOwnProperty(player),
			"Player "+ player +" is not active (moves= "+ JSON.stringify(moves) +"!");
		var playerMoves = moves[player];
		raiseIf(!Array.isArray(playerMoves) || playerMoves.length < 1,
			"Player "+ player +" has no moves ("+ playerMoves +")!");
		moves = playerMoves.map(function (move) {
			return copy(obj(player, move), moves);
		});
		var selectedMoves = heuristicPlayer.selectMoves(moves, game, player);
		return Future.then(selectedMoves, function (selectedMoves) {
			raiseIf(!selectedMoves || !selectedMoves.length, 
				"No moves where selected at ", game, " for player ", player, "!");
			return heuristicPlayer.random.choice(selectedMoves)[player];
		});
	},
	
	// ## Utilities to build heuristics ########################################
	
	/** A `composite` heuristic function returns the weighted sum of other
	functions. The arguments must be a sequence of heuristic functions and a
	weight. All weights must be between 0 and 1 and add up to 1.
	*/
	'static composite': function composite() {
		var components = Array.prototype.slice.call(arguments), weightSum = 0;
		raiseIf(components.length < 1,
			"HeuristicPlayer.composite() cannot take an odd number of arguments!");
		for (var i = 0; i < components.length; i += 2) {
			raiseIf(typeof components[i] !== 'function', 
				"HeuristicPlayer.composite() argument ", i, " (", components[i], ") is not a function!");
			components[i+1] = +components[i+1];
			raiseIf(isNaN(components[i+1]) || components[i+1] < 0 || components[i+1] > 1, 
				"HeuristicPlayer.composite() argument ", i+1, " (", components[i+1], ") is not a valid weight!");
		}
		return function compositeHeuristic(game, player) {
			var sum = 0;
			for (var i = 0; i+1 < components.length; i += 2) {
				sum += components[i](game, player) * components[i+1];
			}
			return sum;
		};
	}
}); // declare HeuristicPlayer.
