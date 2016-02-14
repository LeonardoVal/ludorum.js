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

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Aleatory',
		serializer: function serialize_Aleatory(obj) {
			return [this.range];
		}
	}
}); // declare Aleatory.
