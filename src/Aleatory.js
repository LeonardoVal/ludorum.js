/** # Aleatory

Aleatories are representations of intermediate game states that depend on some 
form of randomness. `Aleatory` is an abstract class from which different means
of non determinism can be build, like: dice, card decks, roulettes, etcetera.
*/
var Aleatory = exports.Aleatory = declare({
	/** The constructor may take a next function and a random generator (an
	instance of `creatartis-base.Randomness`).
	*/
	constructor: function Aleatory(next, random) {
		this.random = random || Randomness.DEFAULT;
		if (typeof next === 'function') {
			this.next = next;
		}
	},
	
	/** The aleatory is always related to a random variable of some sort. The
	`Aleatory.value()` can be used to obtain a valid random value for that 
	random variable.
	*/
	value: function value() {
		var n = this.random.random(), value;
		iterable(this.distribution()).forEach(function (pair) {
			n -= pair[1];
			if (n <= 0) {
				value = pair[0];
				throw Iterable.STOP_ITERATION;
			}
		});
		if (typeof value === 'undefined') {
			throw new Error("Random value could not be obtained.");
		}
		return value;
	},
	
	/** The function `Aleatory.next(value)` returns the next game state given a specific value for 
	the random variable. This next game state may also be another `Aleatory`, or the corresponding 
	[`Game`](Game.html) instance. If no value is given, then a random valid value is chosen, using 
	the `Aleatory.random` randomness generator.
	*/
	next: unimplemented("Aleatory", "next"),
	
	/** In order to properly search a game tree with aleatory nodes, the random variables' 
	distribution have to be known. `Aleatory.distribution()` computes the histogram for the random 
	variables on which this aleatory depends, as a sequence of pairs `[value, probability]`.
	*/
	distribution: unimplemented("Aleatory", "distribution"),
	
	/** ## Generic constructors ####################################################################
	
	The following methods are meant to simplify defining common aleatory variables:
	*/
	
	/**	+ `fromDistribution` builds an `Aleatory` instance that uses the given distribution.
	*/
	'static fromDistribution': function fromDistribution(dist, next, random) {
		var alea = new Aleatory(next, random);
		alea.distribution = function distribution() {
			return dist;
		};
		return alea;
	},
	
	/**	+ `withDistribution` returns a constructor for aleatories that use the given ditribution.
	*/
	'static withDistribution': function withDistribution(dist) {
		return declare(Aleatory, {
			distribution: function distribution() {
				return dist;
			},
		});
	},
	
	/** + `fromValues` builds an `Aleatory` instance that uses the given values, assuming all have 
	equal probabilities.
	*/
	'static fromValues': function fromValues(values, next, random) {
		values = iterable(values).toArray();
		var prob = 1 / values.length,
			alea = new Aleatory(next, random);
		alea.value = function value() {
			return this.random.choice(values);
		};
		alea.distribution = function distribution() {
			return values.map(function (value) {
				return [value, prob];
			});
		};
		return alea;
	},
	
	/** + `withValues` returns an `Aleatory` constructor for aleatories that use the given a list of 
	values, assuming all these values have equal probabilities.
	*/
	'static withValues': function withValues(values) {
		values = iterable(values).toArray();
		var prob = 1 / values.length;
		return declare(Aleatory, {
			value: function value() {
				return this.random.choice(values);
			},
		
			distribution: function distribution() {
				return values.map(function (value) {
					return [value, prob];
				});
			}
		});
	},
	
	/**	+ `fromRange` returns an aleatory that ranges over all integers between `min` and `max`
	(inclusively).
	*/
	'static fromRange': function fromRange(min, max, next, random) {
		var alea = new Aleatory(next, random);
		alea.value = function value() {
			return this.random.randomInt(min, max + 1);
		};
		alea.distribution = function distribution() {
			return Iterable.range(min, max + 1).map(function (value) {
				return [value, 1 / (max + 1 - min)];
			});
		};
		return alea;
	},
	
	/**	+ `withRange` returns a uniform aleatory constructor ranging over all integers between `min`
	and `max` (inclusively).
	*/
	'static withRange': function withRange(min, max) {
		return declare(Aleatory, {
			value: function value() {
				return this.random.randomInt(min, max + 1);
			},
			
			distribution: function distribution() {
				return Iterable.range(min, max + 1).map(function (value) {
					return [value, 1 / (max + 1 - min)];
				});
			}
		});
	}
}); // declare Aleatory.

/** ## Aleatories namespace

The namespace `ludorum.aleatories` is a bundle of random game states (i.e. 
Aleatory subclasses) and related definitions.
*/
var aleatories = exports.aleatories = { };
