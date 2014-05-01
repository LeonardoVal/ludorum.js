/** ## Class Dice

[Aleatory](../Aleatory.js.html) representation of dice random variables. These
are uniformly distributed values in the range `[1, base]`.
*/
aleatories.Dice = declare(Aleatory, {
	/** The constructor takes the next function, the dice base, and	a 
	pseudorandom number generator (`creatartis-base.Randomness.DEFAULT` by 
	default).
	*/
	constructor: function Dice(next, base, random) {
		Aleatory.call(this, next, random);
		/** A dice's `base` is the maximum value it can have. By default is 6, 
		since most frequently six sided dice are used.
		*/
		this.base = isNaN(base) ? 6 : Math.max(2, +base);
	},
	
	/** `Dice.value()` returns a random value between 1 and `base`.
	*/
	value: function value() {
		return this.random.randomInt(1, this.base + 1);
	},
	
	/** A Dice distribution has all values from 1 to `base`, with equal
	probabilities for all.
	*/
	distribution: function distribution() {
		return this.__distribution__ || (this.__distribution__ = (function (base) {
			return Iterable.range(1, base + 1).map(function (n, i) {
				return [n, 1 / base];
			}).toArray();
		})(this.base));
	}		
}); //// declare Dice.
