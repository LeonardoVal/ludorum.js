/** ## Class `Aleatory`

Aleatories are representations of intermediate game states that depend on some 
form of randomness. `Aleatory` is an abstract class from which different means
of non determinism can be build, like: dice, card decks, roulettes, etcetera.
*/
var Aleatory = exports.Aleatory = declare({
	/** The constructor may take a next function and a random generator (an
	instance of `basis.Randomness`).
	*/
	constructor: function Aleatory(next, random) {
		this.random = random || Randomness.DEFAULT;
		if (typeof next === 'function') {
			this.next = next;
		}
	},
	
	/** The aleatory is always related to a random variable of some sort. The
	`Aleatory.value()` can be used to obtain a valid random value for that 
	random variable.
	*/
	value: function value() {
		var n = random.random(), value;
		iterable(this.distribution()).forEach(function (pair) {
			n -= pair[1];
			if (n <= 0) {
				value = pair[0];
				throw Iterable.STOP_ITERATION;
			}
		});
		if (typeof value === 'undefined') {
			throw new Error("Random value could not be obtained.");
		}
		return value;
	},
	
	/** The function `Aleatory.next(value)` returns the next game state given a 
	specific value for the random variable. This next game state may also be
	another `Aleatory`, or the corresponding [`Game`](Game.html) instance.
	If no value is given, then a random valid value is chosen, using the 
	`Aleatory.random` randomness generator.
	*/
	next: unimplemented("Aleatory", "next"),
	
	/** In order to properly search a game tree with aleatory nodes, the random
	variables' distribution have to be known. `Aleatory.distribution()` computes
	the histogram for the random variables on which this aleatory depends, as a
	sequence of pairs `[value, probability]`.
	*/
	distribution: unimplemented("Aleatory", "distribution")
}); // declare Aleatory.

/** The namespace `ludorum.aleatories` is a bundle of random game states (i.e. 
Aleatory subclasses) and related definitions.
*/
var aleatories = exports.aleatories = {};