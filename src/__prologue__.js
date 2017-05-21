/** Library wrapper and layout.
*/
function __init__(base, Sermat) { "use strict";
// Import synonyms. ////////////////////////////////////////////////////////////////////////////////
	var unimplemented = base.objects.unimplemented,
		obj = base.obj,
		copy = base.copy,
		raise = base.raise,
		raiseIf = base.raiseIf,
		declare = base.declare,
		Iterable = base.Iterable,
		iterable = base.iterable,
		Future = base.Future,
		Randomness = base.Randomness,
		initialize = base.initialize,
		Statistics = base.Statistics,
		Events = base.Events;

// Library layout. /////////////////////////////////////////////////////////////////////////////////
	var exports = {
			__package__: 'ludorum',
			__name__: 'ludorum',
			__init__: __init__,
			__dependencies__: [base, Sermat],
			__SERMAT__: { include: [base] }
		},
		/** The library is organized in the following _namespaces_.
		*/
		aleatories = exports.aleatories = {},
		games = exports.games = {},
		players = exports.players =  {},
		tournaments = exports.tournaments = {},
		utils = exports.utils = {}
	;