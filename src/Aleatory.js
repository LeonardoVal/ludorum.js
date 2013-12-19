/** ludorum/src/Aleatory.js:
	Representation of intermediate game states that depend on some form of 
	randomness, like: dice, card decks, roulettes, etc.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
var Aleatory = exports.Aleatory = basis.declare({
	/** new Aleatory(next, random=basis.Randomness.DEFAULT):
		Base constructor for a aleatory game state.
	*/
	constructor: function Aleatory(next, random) {
		this.next = next;
		this.random = random || basis.Randomness.DEFAULT;
	},
	
	/** Aleatory.instantiate():
		Calls this.next() callback with a random value and returns its result.
	*/
	instantiate: function instantiate() {
		return this.next(this.value());
	},
	
	/** Aleatory.value():
		Calculates a random value for this aleatory.
	*/
	value: function value() {
		var n = random.random(), value;
		basis.iterable(this.distribution()).forEach(function (pair) {
			n -= pair[1];
			if (n <= 0) {
				value = pair[0];
				throw basis.Iterable.STOP_ITERATION;
			}
		});
		if (typeof value === 'undefined') {
			throw new Error("Random value could not be obtained.");
		}
		return value;
	},
	
	/** Aleatory.distribution():
		Computes the histogram for the random variables on which this aleatory
		depends, as an iterable of pairs [value, probability]. Not implemented 
		by default.
	*/
	distribution: function distribution() {
		throw new Error((this.constructor.name || 'Aleatory') +".distribution() is not implemented! Please override.");
	}
}); // declare Aleatory.

/** aleatories:
	Bundle of random game states (i.e. Aleatory subclasses) and related 
	definitions.
*/
var aleatories = exports.aleatories = {};
