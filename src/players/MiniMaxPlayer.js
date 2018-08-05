/** # MiniMaxPlayer

Automatic players based on pure MiniMax.
*/
var MiniMaxPlayer = players.MiniMaxPlayer = declare(HeuristicPlayer, {
	/** The constructor takes the player's `name` and the MiniMax search's `horizon` (`4` by 
	default).
	*/
	constructor: function MiniMaxPlayer(params) {
		HeuristicPlayer.call(this, params);
		var prototype = Object.getPrototypeOf(this);
		initialize(this, params)
			.integer('horizon', { defaultValue: prototype.horizon, coerce: true });
	},

	horizon: 4,

	/** MiniMax players cannot be used with simultaneous games.
	*/
	isCompatibleWith: function isCompatibleWith(game) {
		return !game.isSimultaneous;
	},
	
	/** Every state's evaluation is the minimax value for the given game and player.
	*/
	stateEvaluation: function stateEvaluation(game, player, options) {
		return this.minimax(game, player, 0, options);
	},

	/** The `quiescence(game, player, depth)` method is a stability test for the given game state. 
	If the game is quiescent, this function must return an evaluation. Else it must return `NaN` or 
	an equivalent value. 
	
	Final game states are always quiescent, and their evaluation is the game's result for the given 
	player. This default implementation also return an heuristic evaluation for every game state at 
	a deeper depth than the player's horizon.
	*/
	quiescence: function quiescence(game, player, depth) {
		var results = game.result();
		if (results) {
			return results[player];
		} else if (depth >= this.horizon) {
			return this.heuristic(game, player);
		} else {
			return NaN;
		}
	},
	
	/** The `minimax(game, player, depth, options)` method calculates the Minimax evaluation of the 
	given game for the given player. If the game is not finished and the depth is greater than the 
	horizon, `heuristic` is used.
	
	The `options` optional argument may include:

	+ `hook`: A callback function to be called in every node with the game state and its value. A
	result other than NaN overrides the minimax evaluation.
	*/
	minimax: function minimax(game, player, depth, options) {
		if (game.isContingent) {
			return this.expectiMinimax(game, player, depth, options);
		}
		var value = this.quiescence(game, player, depth);
		if (isNaN(value)) { // game is not quiescent.
			var activePlayer = game.activePlayer(),
				moves = this.movesFor(game, activePlayer), 
				comparison, next;
			if (moves.length < 1) {
				throw new Error('No moves for unfinished game '+ game +'.');
			}
			if (activePlayer == player) {
				value = -Infinity;
				comparison = Math.max;
			} else {
				value = +Infinity;
				comparison = Math.min;
			}
			for (var i = 0; i < moves.length; ++i) {
				next = game.next(obj(activePlayer, moves[i]));
				value = comparison(value, this.minimax(next, player, depth + 1, options));
			}
		}
		if (options && typeof options.hook === 'function') {
			var hookValue = options.hook(game, value);
			if (!isNaN(hookValue)) {
				value = hookValue;
			}
		}
		return value;
	},
	
	/** The `expectiMinimax(game, player, depth)` method is used when calculating the minimax value
	of a contingent game state. Basically returns the sum of all the minimax values weighted by the 
	probability of each possible next state. 
	*/
	expectiMinimax: function expectiMinimax(game, player, depth, options) {
		if (!game.isContingent) {
			return this.minimax(game, player, depth, options);
		} else {
			var p = this;
			return game.expectedEvaluation(player, function (game, player) {
				return p.minimax(game, player, depth + 1, options);
			});
		}
	},
	
	// ## Utilities ###############################################################################
	
	/** A `solution` calculates the minimax value for every game state derivable from the given 
	`game`. The result is an object with a key for every game state, with a numerical value. The
	game is assumed to be deterministic.
	
	The optional `options` argument can have:

	+ `gameKey`: A function that returns a string key for every game state. The game `toString` 
	method is used by default.

	+ `evals`: The object in which the solution is stored. A new object is used by default.
	*/
	'static solution': function solution(game, options) {
		var evals = options && options.evals || {},
			mmPlayer = new this({ horizon: 1e8 }),
			gameKey = options.gameKey || function (game) {
				return game.toString();
			};
		mmPlayer.minimax(game, game.activePlayer(), 0, { 
			hook: function (game, value) {
				var k = gameKey(game);
				raiseIf(evals.hasOwnProperty(k) && evals[k] !== value, "Game ", game, "(key ", 
					k, ") has different values ", evals[k], " and ", value, "!");
				evals[k] = value;
			}
		});
		return evals;
	},

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'MiniMaxPlayer',
		serializer: function serialize_MiniMaxPlayer(obj) {
			var ser = HeuristicPlayer.__SERMAT__.serializer(obj),
				args = ser[0];
			args.horizon = obj.horizon;
			return ser;
		}
	}
}); // declare MiniMaxPlayer.