/** # DieAleatory

An aleatory with a uniform distribution ranging over integer values.
*/
var DieAleatory = exports.aleatories.DieAleatory = declare(Aleatory, {
	/** A die aleatory is defined by the number of values.
	*/
	constructor: function DieAleatory(min, max) {
		if (arguments.length === 1) {
			max = min;
			min = 1;
		}
		this.min = min |0;
		this.max = max |0;
	},

	/** The methods of `Aleatory` have been optimized for this particular case.
	*/
	count: function count() {
		return this.max - this.min + 1;
	},

	value: function value(i) {
		return i > (this.max - this.min) ? undefined : i + this.min;
	},

	probability: function probability(i) {
		return i > (this.max - this.min) ? NaN : 1 / (this.max - this.min + 1);
	},

	randomValue: function randomValue(random) {
		return (random || Randomness.DEFAULT).randomInt(this.min, this.max + 1);
	},

	// ## Utilities ###############################################################################

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'DiceAleatory',
		serializer: function serialize_DiceAleatory(obj) {
			return [obj.min, obj.max];
		}
	}
});

// ## Common dice variants #########################################################################

aleatories.dice = {
	D4: new DieAleatory(4),
	D6: new DieAleatory(6),
	D8: new DieAleatory(8),
	D10: new DieAleatory(10),
	D12: new DieAleatory(12),
	D20: new DieAleatory(20)
};
