/** # Contingent

Contingent states are game states that depend on other factors that the players choices. They are
used to represent randomness in non-deterministic games. The random variables (called `haps`) can
be dice, card decks, roulettes, etc.
*/
var Contingent = exports.Contingent = declare({
	/** Flag to distinguish contingent states from normal game states.
	*/
	isContingent: true,
	
	/** The default implementation takes a set of `haps`, a game `state` and a set of `moves`. See
	the `next` method for further details.
	*/
	constructor: function Contingent(haps, state, moves) {
		this.__haps__ = haps || null;
		this.__state__ = state || null;
		this.__moves__ = moves || null;
	},
	
	/** A contingent state's `haps` are the equivalent of `moves` in normal game states. The method 
	returns an object with the random variables on which this node depends, e.g.: 
	`{ die: aleatories.dice.D6 }`.
	*/
	haps: function haps() {
		return this.__haps__;
	},
	
	/** Contingent game states' `next` states depend on the `haps` provided, e.g. `{die1: 4, die2: 2}`.
	If values for the `haps` are not provided, they are resolved randonmly (using `randomHaps()`).
	
	By default this method can have two possible behaviours. If the contingent state was created 
	with `moves`, the previous `state`'s `next` method is called with these `moves` and the `haps`.
	Else, it is assumed that the game state constructor will deal with the haps. So it is called
	with the original arguments of the state and the `haps`.
	*/
	next: function next(haps) {
		var state = this.__state__;
		if (this.__moves__) {
			return state.next(this.__moves__, haps || this.randomHaps());
		} else {
			var sermatRecord = Sermat.record(state.constructor),
				args = sermatRecord.serializer(state)[0];
			return sermatRecord.materializer(null, [copy(haps, args)]);
		}
	},
	
	/** Method `randomHaps` calculates a random set of haps.
	*/
	randomHaps: function randomHaps(random) {
		return iterable(this.haps()).mapApply(function (n, h) {
			return [n, h.value(random)];
		}).toObject();
	},
	
	/** A `randomNext` picks one of the next states at random.
	*/
	randomNext: function randomNext(random) {
		return this.next(this.randomHaps(random));
	},
	
	/** The method `possibleHaps` is analogous to `Game.possibleMoves`. It calculates all possible 
	combinations of haps.
	*/
	possibleHaps: function possibleHaps() {
		return Iterable.product.apply(Iterable,
			iterable(this.haps()).mapApply(function (n, hap) {
				return hap.distribution().mapApply(function (v, p) {
					return [n, v, p];
				});
			}).toArray()
		).map(function (haps) {
			var prob = 1;
			return [iterable(haps).mapApply(function (n, v, p) {
				prob *= p;
				return [n, v];
			}).toObject(), prob];
		}).toArray();
	},
	
	/** The `expectedEvaluation` method explores al possible resulting game states from this 
	contingent state and applies an evaluation function. This state evaluation function must have 
	the signature `stateEvaluation(game, player)`. Asynchronous evaluations are supported, in which
	case a `Future` will be returned.
	
	By default the aggregated result is the sum of the evaluations weighted by the probability of
	each possible resulting game state. The `aggregation` function may be specified to override this 
	behaviour and process the results in another way. If given, it will be called with an array of
	triples `[haps, probability, evaluation]`.
	*/
	expectedEvaluation: function expectedEvaluation(player, stateEvaluation, aggregation) {
		var game = this,
			isAsync = false,
			possible = this.possibleHaps().map(function (args) {
				var game2 = game.next(args[0]),
					ev = !game2.isContingent ? stateEvaluation(game2, player) : 
						game2.expectedEvaluation(player, stateEvaluation, aggregation);
				isAsync = isAsync || Future.__isFuture__(ev);
				return Future.then(ev, function (ev) {
					args.push(ev);
					return args;
				});
			});
		return Future.then(isAsync ? Future.all(possible) : possible, aggregation || function (possible) {
			var r = 0;
			possible.forEach(function (triple) {
				r += triple[1] * triple[2];
			});
			return r;
		});
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Contingent',
		serializer: function serialize_Contingent(obj) {
			return [obj.__haps__, obj.__state__, obj.__moves__];
		}
	}
});