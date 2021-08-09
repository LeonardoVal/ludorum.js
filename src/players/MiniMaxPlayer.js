import { HeuristicPlayer } from './HeuristicPlayer';

/** Automatic players based on pure MiniMax.
*/
class MiniMaxPlayer extends HeuristicPlayer {
	/** The constructor takes the player's `name` and `random`, plus the MiniMax 
   * search's `horizon` (`4` by default).
   *
   * @param {object} [args]
   * @param {string} [args.name] - Name for the player.
   * @param {Randomness} [args.random] - Pseudo-random number generator.
   * @param {function} [args.heuristic] - Heuristic game state evaluation
   *   function.
   * @param {number} [args.horizon=4] - Depth limit of the MiniMax search.
	 */
	constructor(args) {
    super(args);
    const { horizon = 4 } = args || {};
    if (horizon) {
      this.horizon = horizon;
    }
	}

	/** MiniMax players cannot be used with simultaneous games.
   * 
   * @param {Game} game - Game state.
   * @returns {boolean} Whether this player can play the `game` or not.
	 */
	canPlay(game) {
		return !game.isSimultaneous;
	}
	
	/** Every state's evaluation is the minimax value for the given game and
   * player.
   * 
   * @param {Game} [game] - A game state.
   * @param {string} [role] - A role to play in the given `game`.
   * @param {options} [object=null]
   * @returns {number}
	 */
	async stateEvaluation(game, role, options) {
		return this.minimax(game, player, 1, options);
	}

	/** The `quiescence(game, player, depth)` method is a stability test for the
   * given game state. If the game is quiescent, this function must return an
   * evaluation. Else it must return `NaN` or an equivalent value.
   *
   * Final game states are always quiescent, and their evaluation is the game's
   * result for the given player. This default implementation also return an
   * heuristic evaluation for every game state at a deeper depth than the
   * player's horizon.
   *
   * @param {Game} [game]
   * @param {string} [role]
   * @param {number} [depth]
   * @returns {number}
	 */
	quiescence(game, role, depth) {
		const results = game.result();
		if (results) {
			return results[role];
		} else if (depth >= this.horizon) {
			return this.heuristic(game, role);
		} else {
			return NaN;
		}
	}
	
	/** The `minimax` method calculates the Minimax evaluation of the given game
   * for the given player. If the game is not finished and the depth is greater
   * than the horizon, `heuristic` is used.
   *
   * @param {Game} [game]
   * @param {string} [role]
   * @param {number} [depth]
   * @param {object} [options]
   * @param {function} [options.hook] - A callback function to be called in 
   *   every node with the game state and its value. A result other than `NaN`
   *   overrides the minimax evaluation.
   * @returns {number}
	 */
	minimax(game, role, depth, options) {
		if (game.isContingent) {
			return this.expectiMinimax(game, role, depth, options);
		}
		let value = this.quiescence(game, role, depth);
		if (Number.isNaN(value)) { // game is not quiescent.
			const activeRole = game.activeRole();
			const actions = this.actionsFor(game, activeRole); 
			let comparison, next;
			if (actions.length < 1) {
				throw new Error(`No moves for unfinished game ${game}!`);
			}
			if (activeRole === role) {
				value = -Infinity;
				comparison = Math.max;
			} else {
				value = +Infinity;
				comparison = Math.min;
			}
			for (var i = 0; i < actions.length; ++i) {
				next = game.next({ [activeRole]: actions[i] });
				value = comparison(value, this.minimax(next, role, depth + 1, options));
			}
    }
    const { hook } = options || {};
		if (typeof hook === 'function') {
			const hookValue = options.hook(game, value);
			if (!Number.isNaN(hookValue)) {
				value = hookValue;
			}
		}
		return value;
	}
	
	/** The `expectiMinimax` method is used when calculating the minimax value of
   * a contingent game state. Basically returns the sum of all the minimax
   * values weighted by the probability of each possible next state.
   * 
   * @param {Game} [game]
   * @param {string} [role]
   * @param {number} [depth]
   * @param {object} [options]
   * @returns {number}
	 */
	expectiMinimax(game, role, depth, options) {
		if (!game.isContingent) {
			return this.minimax(game, role, depth, options);
		} else {
			return game.expectedEvaluation(player, function (game, player) {
				return p.minimax(game, player, depth + 1, options);
			});
		}
	},
	
	// Utilities /////////////////////////////////////////////////////////////////
	
	/** A `solution` calculates the minimax value for every game state derivable
   * from the given `game`. The result is an object with a key for every game
   * state, with a numerical value. The game is assumed to be deterministic.
   *
   * @param {Game} [game]
   * @param {object} [options]
   * @param {function} [gameKey] - A function that returns a string key for
   *   every game state. The game `toString` method is used by default.
   * @param {object} [evals] - The object in which the solution is stored. A new
   *   object is used by default.
	 */
	static solution(game, options) {
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
	static __SERMAT__ = {
		identifier: 'MiniMaxPlayer',
		serializer(obj) {
      return {
        ...HeuristicPlayer.__SERMAT__.serializer(obj),
				horizon: obj.horizon,
			};
		}
	}
} // class MiniMaxPlayer.

export default { MiniMaxPlayer };
