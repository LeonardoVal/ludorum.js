/** Package wrapper and layout.
*/
(function (init) { // Universal Module Definition.
	if (typeof define === 'function' && define.amd) {
		define(['basis'], init); // AMD module.
	} else if (typeof module === 'object' && module.exports) {
		module.exports = init(require('basis')); // CommonJS module.
	} else {
		var global = (0, eval)('this');
		global.ludorum = init(global.basis); // Global namespace.
	}
})(function (basis){ "use strict";
// Import synonyms. ////////////////////////////////////////////////////////////
	var declare = basis.declare,
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
	var exports = {};

	/** games:
		Bundle of game implementations (as Game subclasses) and utility definitions.
	*/
	var games = exports.games = {};

	/** players:
		Bundle of different kinds of players: artificial intelligences, user 
		interface proxies and others.
	*/
	var players = exports.players = {};

	/** tournaments:
		Several contest types implementated as Tournament subtypes.
	*/
	var tournaments = exports.tournaments = {};

	/** aleatories:
		Bundle of random game states (i.e. Aleatory subclasses) and related 
		definitions.
	*/
	var aleatories = exports.aleatories = {};

	/** boards:
		Helpers for handling game boards.
	*/
	var boards = exports.boards = {};

	/** utils:
		Miscellaneous classes, functions and definitions. 
	*/
	var utils = exports.utils = {};
