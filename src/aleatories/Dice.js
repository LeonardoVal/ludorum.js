/** # Dice aleatories

Implementations of common dice and related functions.
*/
var dice = aleatories.dice = {
	/** Common dice variants.
	*/
	D4: Aleatory.withRange(1, 4),
	D6: Aleatory.withRange(1, 6),
	D8: Aleatory.withRange(1, 8),
	D10: Aleatory.withRange(1, 10),
	D12: Aleatory.withRange(1, 12),
	D20: Aleatory.withRange(1, 20),
	D100: Aleatory.withRange(1, 100),
}; //// declare Dice.