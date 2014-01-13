/** Dice random variables.
*/
aleatories.Dice = basis.declare(Aleatory, {
	/** new aleatories.Dice(name, base=6, random=basis.Randomness.DEFAULT):
		Simple uniform random variable with values in [1, base]. 
	*/
	constructor: function Dice(base, next, random) {
		Aleatory.call(this, next, random);
		/** aleatories.Dice.base=6:
			Amount of different values this dice can take.
		*/
		this.base = isNaN(base) ? 6 : Math.max(2, +base);
	},
	
	value: function value() {
		return this.random.randomInt(1, this.base + 1);
	},
	
	/** aleatories.Dice.distribution():
		Values from 1 to this.base, with uniform probabilities.
	*/
	distribution: function distribution() {
		var prob = 1 / this.base;
		return basis.Iterable.range(1, this.base + 1).map(function (n, i) {
			return [n, prob];
		});
	}		
}); // declare Dice.
