/** # Dice aleatories

Implementations of common dice and related functions.
*/
var dice = aleatories.dice = {
	/** Common dice variants.
	*/
	D4: new Aleatory(1, 4),
	D6: new Aleatory(1, 6),
	D8: new Aleatory(1, 8),
	D10: new Aleatory(1, 10),
	D12: new Aleatory(1, 12),
	D20: new Aleatory(1, 20),
	D100: new Aleatory(1, 100),
	
	/** The `sumProbability` that rolling `n` dice of `s` sides yields a sum equal to `p`. Check the 
	article at [Mathworld](http://mathworld.wolfram.com/Dice.html).
	*/
	sumProbability: function sumProbability(p, n, s) {
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
	}
}; //// declare Dice.