/** Package wrapper and layout.
*/
(function (global, init) { "use strict"; // Universal Module Definition.
	if (typeof define === 'function' && define.amd) {
		define(['creatartis-base'], init); // AMD module.
	} else if (typeof module === 'object' && module.exports) {
		module.exports = init(require('creatartis-base')); // CommonJS module.
	} else { // Browser or web worker (probably).
		global.ludorum = init(global.base); // Assumes base is loaded.
	}
})(this, function __init__(base) { "use strict";
// Import synonyms. ////////////////////////////////////////////////////////////////////////////////
	var declare = base.declare,
		unimplemented = base.objects.unimplemented,
		obj = base.obj,
		copy = base.copy,
		raise = base.raise,
		raiseIf = base.raiseIf,
		Iterable = base.Iterable,
		iterable = base.iterable,
		Future = base.Future,
		Randomness = base.Randomness,
		initialize = base.initialize,
		Statistics = base.Statistics,
		Events = base.Events;

// Library layout. /////////////////////////////////////////////////////////////////////////////////
	var exports = {
		__name__: 'ludorum',
		__init__: __init__,
		__dependencies__: [base]
	};
	
	/** The namespace `ludorum.utils` contains miscellaneous classes, functions 
	and definitions.
	*/
	var utils = exports.utils = {};
