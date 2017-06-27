/** # Dice aleatories

Implementations of common dice and related functions.
*/

/** An uniform aleatory is a usual case, where each value in the range of the random variable has
the same probability.
*/
aleatories.uniformAleatory = function uniformAleatory(values) {
	values = iterable(values).toArray();
	var probability = 1 / values.length;
	return new Aleatory(values.map(function (value) {
		return [value, probability];
	}));
};

/** The `normalization` of a distribution forces all probabilities to add up to one.
*/
aleatories.normalization = function normalization(distribution) {
	var probSum = 0,
		result = [];
	iterable(distribution).forEachApply(function (v, p) {
		raiseIf(p < 0, "aleatories.normalization: probabilities cannot be negative ("+ p +")!");
		probSum += p;
		for (var i = 0; i < result.length; i++) {
			if (result[i][0] === v) {
				result[i][1] += p;
				return;
			}
		}
		result.push([v, p]);
	});
	if (probSum > 0) {
		result.forEach(function (t) {
			t[1] /= probSum;
		});
	}
	return result;
};

/** The `sumProbability` that rolling `n` dice of `s` sides yields a sum equal to `p`. Check the
article at [Mathworld](http://mathworld.wolfram.com/Dice.html).
*/
aleatories.sumProbability = function sumProbability(p, n, s) {
	n = n|0;
	s = s|0;
	p = p|0;
	if (isNaN(n) || isNaN(s) || isNaN(p) || n < 1 || s < 2) {
		return NaN;
	} else if (p < n || p > n * s) {
		return 0;
	} else {
		var factorial = base.math.factorial,
			fact_n = factorial(n),
			fact_n_1 = fact_n / n; // factorial(n - 1)
		return Math.pow(s, -n) *
			Iterable.range(0, Math.floor((p - n) / s) + 1).map(function (k) {
				var comb1 = fact_n / factorial(k) / factorial(n - k),
					x = p - s * k - 1,
					comb2 = factorial(x) / fact_n_1 / factorial(x - n + 1);
				return (k % 2 ? -1 : 1) * comb1 * comb2;
			}).sum();
	}
};
