/** ludorum/src/randoms.js:
	Representation of many sorts of random variables in games: dice, card decks,
	roulette, etc.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Abstract base class for random variables ////////////////////////////////////

var RandomVariable = exports.RandomVariable = basis.declare({
	/** new RandomVariable(random=randomness.DEFAULT):
		Base constructor for a random variable.
	*/
	constructor: function RandomVariable(random) {
		this.random = random || randomness.DEFAULT;
	},
	
	/** RandomVariable.value():
		Return a value for this random variable. Not implemented by default.
	*/
	value: function value() {
		throw new Error((this.constructor.name || 'RandomVariable') +".value() is not implemented! Please override.");
	},
	
	/** RandomVariable.instantiate(game, name):
		Assigns a random value of this random variable to the property name
		of the given game. Raises an error if the game already has such a
		property.
	*/
	instantiate: function instantiate(game, name) {
		if (game.hasOwnProperty(name)) {
			throw new Error("Random variable '"+ name +"' has already been instantiated (with "+ game[name] +").");
		}
		game[name] = this.value();
	},
	
	/** RandomVariable.distribution():
		Computes the histogram for this random variable, as an iterable of 
		pairs [value, probability]. Not implemented by default.
	*/
	distribution: function distribution() {
		throw new Error((this.constructor.name || 'RandomVariable') +".distribution() is not implemented! Please override.");
	}
}); // declare RandomVariable.

/** randoms:
	Bundle of RandomVariable subclasses and related definitions.
*/
var randoms = exports.randoms = {};

// Dice ////////////////////////////////////////////////////////////////////////
	
randoms.Dice = basis.declare(RandomVariable, {
	/** new Dice(base=6, random=randomness.DEFAULT):
		Simple uniform random variable with values in [1, base]. 
	*/
	constructor: function Dice(base, random) {
		RandomVariable.call(this, random);
		this.base = isNaN(base) ? 6 : Math.min(2, +base >> 0);
	},
	
	value: function value() {
		return random.nextInt(1, this.base + 1);
	},
	
	distribution: function distribution() {
		return basis.iterables.range(1, this.base + 1).map(function (n, i) {
			return [n, 1 / this.base];
		});
	}		
}); // declare Dice.
