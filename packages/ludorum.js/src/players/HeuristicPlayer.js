/** # HeuristicPlayer

This is the base type of automatic players based on heuristic evaluations of game states or moves.
*/

var HeuristicPlayer = players.HeuristicPlayer = declare(Player, {
	/** The constructor takes the player's `name` and a `random` number generator 
	(`base.Randomness.DEFAULT` by default). Many heuristic can be based on randomness, but this is 
	also necessary to chose between moves with the same evaluation without any bias.
	*/
	constructor: function HeuristicPlayer(params) {
		Player.call(this, params);
		var prototype = Object.getPrototypeOf(this);
		initialize(this, params)
			.func('heuristic', { ignore: true });
	},

	/** An `HeuristicPlayer` choses the best moves at any given game state. For this purpose it 
	evaluates every move with `moveEvaluation(move, game, player)`. By default this function 
	evaluates the states resulting from making each move, which is the most common thing to do.
	*/
	moveEvaluation: function moveEvaluation(move, game, player) {
		var heuristicPlayer = this;
		if (Object.keys(move).length < 2) { // One active player.
			return this.stateEvaluation(game.next(move), player);
		} else { // Many active players.
			var sum = 0, count = 0;
			move = copy(obj(player, [move[player]]), move);
			game.possibleMoves(move).forEach(function (ms) {
				sum += heuristicPlayer.stateEvaluation(game.next(ms), player);
				++count;
			});
			return count > 0 ? sum / count : 0; // Average all evaluations.
		}
	},

	/** The `stateEvaluation(game, player)` calculates a number as the assessment of the given game 
	state for the given player. The base implementation returns the result for the player is the 
	game has results, else it returns the heuristic value for the state.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		if (!game.isContingent) {
			var gameResult = game.result();
			return gameResult ? gameResult[player] : this.heuristic(game, player);
		} else {
			/** Heuristics cannot be applied to contingent game states. Hence all posible haps are 
			explored, and when a non-contingent game state is reached the heuristic is called.
			*/
			return game.expectedEvaluation(player, this.stateEvaluation.bind(this));
		}
	},
	
	/** The `heuristic(game, player)` is an evaluation used at states that are not finished games. 
	The default implementation returns a random number in [-0.5, 0.5). This is only useful in 
	testing. Any serious use should redefine this.
	*/
	heuristic: function heuristic(game, player) {
		return this.random.random(-0.5, 0.5);
	},
	
	/** Heuristic players work by evaluating the moves of the `player` in the given `game` state. If
	the game state is contingent, then all possible scenarios are evaluated and aggregated. The 
	result of `evaluatedMoves` is a sequence of pairs `[move, evaluation]`, or a future for such 
	sequence if the evaluation function is asynchronous.
	*/
	evaluatedMoves: function evaluatedMoves(game, player) {
		var heuristicPlayer = this,
			isAsync = false;
		raiseIf(game.isContingent, "Contingent game state has no moves!");
		/** Every move is evaluated using `moveEvaluation`. This may be asynchronous and hence
		result in a `Future`.
		*/
		var result = this.possibleMoves(game, player).map(function (move) {
				var e = heuristicPlayer.moveEvaluation(move, game, player);
				isAsync = isAsync || Future.__isFuture__(e);
				return Future.then(e, function (e) {
					return [move, e];
				});
			});
		return isAsync ? Future.all(result) : result;
	}, // evaluatedMoves()
	
	/** The `possibleMoves` for a `player` in a given `game` is a set of objects, with one move for
	the player, and all the options for the opponents.
	*/
	possibleMoves: function possibleMoves(game, player) {
		var moves = game.moves();
		raiseIf(!moves || !moves[player] || !Array.isArray(moves[player]) || moves[player].length < 1,
			"Player "+ player +" has no moves in "+ game +" (moves= "+ moves +")!");
		return moves[player].map(function (move) {
			return copy(obj(player, move), moves);
		});
	},
	
	/** The `bestMoves(evaluatedMoves)` are all the best evaluated in the given sequence of tuples 
	[move, evaluation].
	*/
	bestMoves: function bestMoves(evaluatedMoves) {
		return Future.then(evaluatedMoves, function (evaluatedMoves) {
			return iterable(evaluatedMoves).greater(function (pair) {
				return pair[1];
			}).map(function (pair) {
				return pair[0];
			});
		});
	},
	
	/** The `decision(game, player)` selects randomly from the best evaluated moves.
	*/
	decision: function decision(game, player) {
		var random = this.random;
		return Future.then(this.bestMoves(this.evaluatedMoves(game, player)), function (bestMoves) {
			raiseIf(!bestMoves || !bestMoves.length, "No moves where selected at ", game,
				" for player ", player, "!");
			return random.choice(bestMoves)[player];
		});
	},
	
	// ## Utilities to build heuristics ############################################################
	
	/** A `composite` heuristic function returns the weighted sum of other functions. The arguments 
	must be a sequence of heuristic functions and a weight. All weights must be between 0 and 1 and
	add up to 1.
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
	},
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'HeuristicPlayer',
		serializer: function serialize_HeuristicPlayer(obj) {
			var ser = Player.__SERMAT__.serializer(obj),
				args = ser[0];
			if (obj.hasOwnProperty('heuristic')) {
				args.heuristic = obj.heuristic;
			}
			return ser;
		}
	}
}); // declare HeuristicPlayer.