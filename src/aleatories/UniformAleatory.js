/** # UniformAleatory

An uniform aleatory is one that ranges over a set of values, all of which have the same probability
of occurrence.
*/
var UniformAleatory = exports.aleatories.UniformAleatory = declare(Aleatory, {
	/** An uniform aleatory is defined by a sequence of `values`. The sequence cannot be empty, but
	one value is supported as weird as it may be.
	*/
	constructor: function UniformAleatory(values) {
		this.__values__ = iterable(values).toArray();
		raiseIf(this.__values__.length < 1, "No values for aleatory!");
	},

	/** The `value` is one of the `values` used to build this aleatory, picked at random.
	*/
	value: function value(random) {
		return (random || Randomness.DEFAULT).choice(this.__values__);
	},
	
	/** The `distribution` of an uniform aleatory is a sequence of pairs `[value, probability]`.
	*/
	distribution: function distribution() {
		var prob = 1 / this.__values__.length;
		return this.__values__.map(function (v) {
			return [v, prob];
		});
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'UniformAleatory',
		serializer: function serialize_UniformAleatory(obj) {
			return [this.__values__];
		}
	}
});