/** Package wrapper and layout.
*/
"use strict";
(function (init) { // Universal Module Definition.
	if (typeof define === 'function' && define.amd) {
		define(['basis'], init); // AMD module.
	} else if (typeof module === 'object' && module.exports) {
		module.exports = init(require('basis')); // CommonJS module.
	} else { // Browser or web worker (probably).
		var global = (0, eval)('this');
		global.ludorum = init(global.basis); // Assumes basis is loaded.
	}
})(function __init__(basis){
// Import synonyms. ////////////////////////////////////////////////////////////
	var declare = basis.declare,
		unimplemented = basis.objects.unimplemented,
		obj = basis.obj,
		copy = basis.copy,
		raiseIf = basis.raiseIf,
		Iterable = basis.Iterable,
		iterable = basis.iterable,
		Future = basis.Future,
		Randomness = basis.Randomness,
		initialize = basis.initialize,
		Statistics = basis.Statistics,
		Events = basis.Events;

// Library layout. /////////////////////////////////////////////////////////////
	var exports = {
		__init__: __init__
	};
	exports.__init__.dependencies = [basis];

	/** The namespace `ludorum.utils` contains miscellaneous classes, functions 
	and definitions.
	*/
	var utils = exports.utils = {};
