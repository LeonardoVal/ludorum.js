/** Dice random variables.
*/
aleatories.Dice = declare(Aleatory, {
	/** new aleatories.Dice(name, base=6, random=basis.Randomness.DEFAULT):
		Simple uniform random variable with values in [1, base]. 
	*/
	constructor: function Dice(next, base, random) {
		Aleatory.call(this, next, random);
		/** aleatories.Dice.base=6:
			Amount of different values this dice can take.
		*/
		this.base = isNaN(base) ? 6 : Math.max(2, +base);
	},
	
	/** aleatories.Dice.value():
		Returns a random value between 1 and base.
	*/
	value: function value() {
		return this.random.randomInt(1, this.base + 1);
	},
	
	/** aleatories.Dice.distribution():
		Values from 1 to this.base, with uniform probabilities.
	*/
	distribution: function distribution() {
		return this.__distribution__ || (this.__distribution__ = (function (base) {
			return Iterable.range(1, base + 1).map(function (n, i) {
				return [n, 1 / base];
			}).toArray();
		})(this.base));
	}		
}); // declare Dice.
