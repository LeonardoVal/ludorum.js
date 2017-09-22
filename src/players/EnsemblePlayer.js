/** # EnsemblePlayer

Players defined as a combination of other players.
*/
players.EnsemblePlayer = declare(Player, {
	/** The constructor takes the player's `name`, a `random` number generator
	(`base.Randomness.DEFAULT` by default), and (optionally) an array of `players`.
	*/
	constructor: function EnsemblePlayer(params) {
		Player.call(this, params);
		initialize(this, params)
			.object('random', { defaultValue: Randomness.DEFAULT })
			.array('players', { ignore: true });
	},

	players: [],

	/** The `playerSelection` returns a subset of all `players` which can be used to decide on the
	given `game` state. By default all players are selected.
	*/
	playerSelection: function playerSelection(game, role) {
		return this.players;
	},

	/** By default one of the selected players is chosen at random.
	*/
	decision: function(game, role) {
		return this.randomDecision(game, role);
	},

	// ## Posible combinations ####################################################################

	/** A `randomDecision` delegates the decision to one of the available `players` chosen at
	random.
	*/
	randomDecision: function randomDecision(game, role, players) {
		players = players || this.playerSelection(game, role);
		raiseIf(players.length < 1, "No player was selected!");
		return (players.length == 1 ? players[0] : this.random.choice(players))
			.decision(game, role);
	},

	__aggregateEvaluatedMoves__: function __aggregateEvaluatedMoves__(game, role, aggregation, evaluatedMoves) {
		var grouped = iterable(evaluatedMoves).flatten().groupAll(function (evm) {
			return JSON.stringify(evm[0]); //TODO Allow to customize
		}, function (evs, evm) {
			if (evs) {
				evs[1].push(evm[1]);
				return evs;
			} else {
				return [evm[0], [evm[1]]];
			}
		});
		return iterable(grouped).mapApply(function (k, v) {
			return [v[0], aggregation(v[0], v[1], game, role)];
		});
	},

	__bestAggregatedEvaluationMove__: function __bestAggregatedEvaluationMove__(game, role, aggregation, evaluatedMoves) {
		var aggregated = this.__aggregateEvaluatedMoves__(game, role, aggregation,
			evaluatedMoves);
		var bestMoves = HeuristicPlayer.prototype.bestMoves(aggregated);
		return this.random.choice(bestMoves)[role];
	},

	/**TODO
	*/
	heuristicCombination: (function () {
		function average(move, evals, game, role) {
			return iterable(evals).sum() / evals.length;
		}

		return function heuristicCombination(aggregation) {
			aggregation = aggregation || average;

			return function combinedHeuristicDecision(game, role) {
				var isAsync = false,
					ds = this.players.map(function (player) {
						raiseIf(!player.evaluatedMoves,
							"Cannot call `evaluatedMoves()` on player ", player.name, "!");
						var d = player.evaluatedMoves(game, role);
						isAsync = isAsync || Future.__isFuture__(d);
						return d;
					});
				if (isAsync) {
					return Future.all(ds).then(
						this.__bestAggregatedEvaluationMove__.bind(game, role, aggregation)
					);
				} else {
					return this.__bestAggregatedEvaluationMove__(game, role, aggregation, ds);
				}
			};
		};
	})(),

	// ## Utilities ################################################################################

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'EnsemblePlayer',
		serializer: function serialize_EnsemblePlayer(obj) {
			return this.serializeAsProperties(obj, ['name', 'random', 'players']);
		}
	},
}); // declare RandomPlayer.
