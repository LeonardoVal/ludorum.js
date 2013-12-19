/** ludorum/src/aleatories/Dice.js:
	Dice random variables.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
aleatories.Dice = basis.declare(Aleatory, {
	/** new Dice(name, base=6, random=basis.Randomness.DEFAULT):
		Simple uniform random variable with values in [1, base]. 
	*/
	constructor: function Dice(base, next, random) {
		Aleatory.call(this, next, random);
		this.base = isNaN(base) ? 6 : Math.max(2, +base);
	},
	
	value: function value() {
		return this.random.randomInt(1, this.base + 1);
	},
	
	distribution: function distribution() {
		var prob = 1 / this.base;
		return basis.Iterable.range(1, this.base + 1).map(function (n, i) {
			return [n, prob];
		});
	}		
}); // declare Dice.
