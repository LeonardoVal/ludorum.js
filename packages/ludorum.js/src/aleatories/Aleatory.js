/** # Aleatory

Aleatories are different means of non determinism that games can use, like: dice, card decks,
roulettes, etc. They are used by `Contingent` game states.
*/

var Aleatory = exports.aleatories.Aleatory = declare({
	/** The base class implements a generic random variable given by a histogram or `distribution`,
	i.e. a list of `[value,probability]` pairs.
	*/
	constructor: function Aleatory(distribution) {
		this.__distribution__ = iterable(distribution).toArray();
		raiseIf(this.__distribution__.length < 1, "Aleatories must have at least one value!");
	},

	/** The `count` of an aleatory is the amount of different values it can have.
	*/
	count: function count() {
		return this.__distribution__.length;
	},

	/** The `value` and `probability` methods define the aleatory variable's distribution. Both
	take an index from 0 to `this.length()-1`.
	*/
	value: function value(i) {
		return this.__distribution__[i][0];
	},

	probability: function probability(i) {
		return +this.__distribution__[i][1];
	},

	/** The `Aleatory.randomValue()` can be used to obtain a valid random value for the random
	variable.
	*/
	randomValue: function randomValue(random) {
		random = random || Randomness.DEFAULT;
		return random.weightedChoice(this.__distribution__);
	},

	/** In order to properly search a game tree with aleatory nodes, the random variables'
	distribution has to be known. `Aleatory.distribution()` computes the histogram for the random
	variables on which this aleatory depends, as a sequence of pairs `[value, probability]`.
	*/
	distribution: function () {
		var alea = this;
		return Iterable.range(this.count()).map(function (i) {
			return [alea.value(i), alea.probability(i)];
		});
	},

	// ## Utility methods #########################################################################

	/** The `tries` function calculates the distribution of the number of successes, trying `n`
	times with a chance of `p`.
	*/
	'static tries': function tries(p, n) {
		var combinations = base.math.combinations;
		return n <= 0 ? [[0, 1]] : Iterable.range(n + 1).map(function (i) {
			return [i, Math.pow(p, i) * Math.pow(1 - p, n - i) * combinations(n, i)];
		}).toArray();
	},

	/** Two `aggregate`d distributions make a new distribution with a combination of the domains. By
	default the value combination function `comb` is the sum. An equality test `eq` can be provided
	if the combinations cannot be compared with `===`.
	*/
	'static aggregate': function aggregate(dist1, dist2, comb, eq) {
		var distR = [];
		comb = comb || function (v1, v2) {
				return v1 + v2;
			};
		eq = eq || function (v1, v2) {
				return v1 === v2;
			};
		Iterable.product(dist1, dist2).forEachApply(function (p1, p2) {
			var v = comb(p1[0], p2[0]);
			for (var i = 0; i < distR.length; i++) {
				if (eq(distR[i][0], v)) {
					distR[i][1] += p1[1] * p2[1];
					return;
				}
			}
			distR.push([v, p1[1] * p2[1]]);
		});
		return distR;
	},

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Aleatory',
		serializer: function serialize_Aleatory(obj) {
			return [obj.distribution().toArray()];
		}
	}
}); // declare Aleatory.
