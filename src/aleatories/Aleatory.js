/** # Aleatory

Aleatories are different means of non determinism that games can use, like: dice, card decks, 
roulettes, etc. They are used by `Contingent` game states.
*/
var Aleatory = exports.aleatories.Aleatory = declare({
	/** The base class implements an integer uniform random variable between a minimum and maximum
	value (inclusively).
	*/
	constructor: function Aleatory(min, max) {
		switch (arguments.length) {
			case 1: this.range = [1, min]; break;
			case 2: this.range = [min, max]; break;
		}
	},
	
	/** The `Aleatory.value()` can be used to obtain a valid random value for the random variable.
	*/
	value: function value(random) {
		return (random || Randomness.DEFAULT).randomInt(this.range[0], this.range[1] + 1);
	},
		
	/** In order to properly search a game tree with aleatory nodes, the random variables' 
	distribution has to be known. `Aleatory.distribution()` computes the histogram for the random 
	variables on which this aleatory depends, as a sequence of pairs `[value, probability]`.
	
	By default it returns a flat histogram, assuming the random variable is uniform.
	*/
	distribution: function () {
		var min = this.range[0], 
			max = this.range[1],
			probability = 1 / (max - min + 1);
		return Iterable.range(min, max + 1).map(function (value) {
			return [value, probability];
		});
	},
	
	// ## Utility methods ##########################################################################

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
		Iterable.product(dist1, dist2).forEachApply(function (p1, p2) {
			var v = comb ? comb(p1[0], p2[0]) : p1[0] + p2[0];
			for (var i = 0; i < distR.length; i++) {
				if (eq ? eq(distR[i][0], v) : distR[i][0] === v) {
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
			return [obj.range[0], obj.range[1]];
		}
	}
}); // declare Aleatory.
