/** # CustomAleatory

An custom aleatory is defined by its own distribution.
*/
var CustomAleatory = exports.aleatories.CustomAleatory = declare(Aleatory, {
	/** An uniform aleatory is defined by a sequence of `values`. The sequence cannot be empty, but
	one value is supported as weird as it may be.
	*/
	constructor: function CustomAleatory(distribution) {
		this.__distribution__ = iterable(distribution).toArray();
	},

	/** The `value` is picked at random respecting the distribution's probabilities.
	*/
	value: function value(random) {
		return (random || Randomness.DEFAULT).weightedChoice(this.__distribution__);
	},
	
	distribution: function distribution() {
		return this.__distribution__;
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'CustomAleatory',
		serializer: function serialize_CustomAleatory(obj) {
			return [obj.__distribution__];
		}
	}
});