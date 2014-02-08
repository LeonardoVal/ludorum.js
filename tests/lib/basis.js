"use strict"; (function (init) {
	if (typeof define === 'function' && define.amd) {
		define([], init); // AMD module.
	} else if (typeof module === 'object' && module.exports) { 
		module.exports = init(); // CommonJS module.
	} else {
		(0, eval)('this').basis = init(); // Global namespace.
	}
})(function (){ var exports = {};
/* Core generic algorithms and utility definitions.
*/
// Objects and object orientation. /////////////////////////////////////////////

/** declare(supers..., members={}):
	Object oriented implementations, influenced by Dojo's. The first super 
	is considered the parent. The following supers add to the returned 
	constructor's prototype, but do not override. The given members always
	override.
	See [Dojo's declare](http://dojotoolkit.org/reference-guide/1.9/dojo/_base/declare.html).
*/
var declare = exports.declare = function declare() {
	var args = Array.prototype.slice.call(arguments),
		parent = args.length > 1 ? args.shift() : Object,
		members = args.length > 0 ? args.pop() : {},
		constructor = members.hasOwnProperty('constructor') ? members.constructor : undefined, //WARN ({}).constructor == Object.
		placeholder, proto;
	if (typeof constructor !== 'function') { // If no constructor is given ...
		constructor = (function () { // ... provide a default constructor.
			parent.apply(this, arguments);
		});
	}
	/* This is the way goog.inherits does it in Google's Closure Library. It
		is preferred since it does not require the parent constructor to 
		support being called without arguments.			
	*/
	placeholder = function () {};
	placeholder.prototype = parent.prototype;
	proto = constructor.prototype = new placeholder();
	for (var id in members) { // Copy members to the new prototype.
		if (members.hasOwnProperty(id)) {
			proto[id] = members[id];
		}
	} 
	proto.constructor = constructor;
	args.forEach(function (superMembers) { // Copy other members in the other supers, if they do not override.
		superMembers = typeof superMembers === 'function' ? superMembers.prototype : superMembers;
		for (id in superMembers) {
			if (typeof proto[id] === 'undefined') {
				proto[id] = superMembers[id];
			}
		}
	});
	return constructor;
};

/** obj(key, value...):
	Object constructor based on key-value pairs. Useful to build objects 
	when keys come from expressions instead of identifiers or numerals, 
	which makes it impossible to use the object literal notation.
*/
var obj = exports.obj = function obj() {
	var result = ({});
	for (var i = 0; i < arguments.length; i += 2) {
		result[arguments[i] +''] = arguments[i+1];
	}
	return result;
};

/** copy(objTo, objFrom...):
	Copies all own properties of the given objects into objTo, and returns
	it. If only one object is given, a copy of the objTo object is returned.
*/
var copy = exports.copy = function copy(objTo) {
	var i = 1, k, objFrom;
	if (arguments.length < 2) {
		objTo = {};
		i = 0;
	}
	for (; i < arguments.length; i++) {
		objFrom = arguments[i];
		for (k in objFrom) {
			if (objFrom.hasOwnProperty(k) && !objTo.hasOwnProperty(k)) {
				objTo[k] = objFrom[k];
			}
		}
	}
	return objTo;
};

/** Global:
	Global scope of the current execution environment. Usually (window) in 
	browsers and (global) under NodeJS.
*/
var Global = exports.Global = (0, eval)('this');

// Errors //////////////////////////////////////////////////////////////////////

/** raise(message...):
	Builds a new instance of Error with the concatenation of the arguments 
	as its message and throws it.
*/
var raise = exports.raise = function raise() {
	throw new Error(Array.prototype.slice.call(arguments, 0).join(''));
};

/** raiseIf(condition, message...):
	If the condition is true a new Error is built and risen like in 
	basis.raise().
*/
var raiseIf = exports.raiseIf = function raiseIf(condition) {
	if (condition) {
		raise(Array.prototype.slice.call(arguments, 1).join(''));
	}
};

/** callStack(error=none):
	Returns an array with the callstack of error or (if missing) a new one 
	is used, hence returning the current callStack.
*/
var callStack = exports.callStack = function callStack(exception) {
	if (exception) {
		return (exception.stack || exception.stacktrace || '').split('\n');
	} else try {
		throw new Error();
	} catch (e) {
		exception = e;
	}
	return (exception.stack || exception.stacktrace || '').split('\n').slice(1);
};

/* Text manipulation definitions.
*/
// String prototype leveling. //////////////////////////////////////////////////

// See <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat>.
String.prototype.repeat || (String.prototype.repeat = function repeat(n) {
	n = n | 0;
	return n <= 0 ? "" : n & 1 ? this + this.repeat(n - 1) : (this + this).repeat(n >> 1);
});

// Text ////////////////////////////////////////////////////////////////////////

var Text = exports.Text = declare({
	/** new Text():
		Similar to Java's StringBuilder, but with extended formatting features.
	*/
	constructor: function Text() {
		this.clear();
	},
	
	/** Text.clear():
		Clears the text buffer. Returns the previous content.
	*/
	clear: function clear() {
		var text = this.text;
		this.text = '';
		return text;
	},
	
	/** Text.add(...strings):
		Adds all arguments' conversion to string to the buffer.
	*/
	add: function add() {
		for (var i = 0; i < arguments.length; i++) {
			this.text += arguments[i];
		}
	},
	
	// Formatting, encoding and decoding. //////////////////////////////////////
	
	/** Text.XML_ENTITIES:
		An object mapping XML special characters to their corresponding 
		character entity.
	*/
	XML_ENTITIES: { 
		'<': '&lt;', 
		'>': '&gt;', 
		'&': '&amp;', 
		'"': '&quot;', 
		"'": '&apos;' 
	},
		
	/** Text.escapeXML(str):
		Returns the string with XML reserved characters replaced by the 
		corresponding character entities.
	*/
	escapeXML: function escapeXML(str) {
		var XML_ENTITIES = Text.prototype.XML_ENTITIES;
		return (str +'').replace(/[&<>"']/g, function (c) {
			return XML_ENTITIES[c];
		});
	},

	/** Text.addXML(...str):
		Appends all arguments after applying Text.escapeXML().
	*/
	addXML: function addXML() {
		for (var i = 0; i < arguments.length; i++) {
			this.text += this.escapeXML(arguments[i]);
		}
	},
	
	/** Text.escapeRegExp(str):
		Returns the str string with the reserved characters of regular 
		expressions escaped with '\'.
	*/
	escapeRegExp: function escapeRegExp(str) {
		return (str +'').replace(/[\-\[\]{}()*+?.^$\\]/g, '\\$&');
	},
	
	/** Text.formatDate(date=now, format=Date.toString, useUTC=false):
		Date and time formatter: 'y' for year, 'm' for month, 'd' for day (in 
		month), 'h' for hour (24), 'H' for hour (am/pm), 'n' for minutes,
		's' for seconds, 'S' for milliseconds, 'a' for am/pm, 'A' for AM/PM.
	*/
	formatDate: function formatDate(date, format, useUTC) {
		date = date || new Date();
		var lpad = Text.lpad;
		return !format ? date.toString() : format.replace(/(y+|m+|d+|h+|H+|n+|s+|S+|a+|A+|"[^"]*")/g, 
			function (match) {
				switch (match.charAt(0)) {
				case 'y': return lpad((useUTC ? date.getUTCFullYear() : date.getFullYear()) +'', match.length, '0');
				case 'm': return lpad(((useUTC ? date.getUTCMonth() : date.getMonth()) + 1) +'', match.length, '0');
				case 'd': return lpad((useUTC ? date.getUTCDate() : date.getDate()) +'', match.length, '0');
				case 'h': return lpad((useUTC ? date.getUTCHours() : date.getHours()) +'', match.length, '0');
				case 'H': return lpad((useUTC ? date.getUTCHours() : date.getHours()) % 12 +'', match.length, '0');
				case 'n': return lpad((useUTC ? date.getUTCMinutes() : date.getMinutes()) +'', match.length, '0');
				case 's': return lpad((useUTC ? date.getUTCSeconds() : date.getSeconds()) +'', match.length, '0');
				case 'S': return lpad((useUTC ? date.getUTCMilliseconds() : date.getMilliseconds()) +'', match.length, '0');
				case 'a': return ['am','pm'][~~((useUTC ? date.getUTCHours() : date.getHours()) / 12)].substr(0, match.length);
				case 'A': return ['AM','PM'][~~((useUTC ? date.getUTCHours() : date.getHours()) / 12)].substr(0, match.length);
				case '"': return match.substr(1, match.length-1);
				default: return match;
				}
			});
	},
	
	/** Text.addDate(date=now, format=Date.toString, useUTC=false):
		Appends the date formatted using Text.formatDate().
	*/
	addDate: function addDate(date, format, useUTC) {
		this.text += this.formatDate(date, format, useUTC);
	},
	
	// Generic methods /////////////////////////////////////////////////////////
	
	toString: function toString() {
		return this.text;
	}
}); // declare Text.

// Static members of Text //////////////////////////////////////////////////////

Text.escapeXML = Text.prototype.escapeXML;
Text.escapeRegExp = Text.prototype.escapeRegExp;
Text.formatDate = Text.prototype.formatDate;

/** static Text.lpad(str, len, pad=' '):
	Returns a copy of the str string padded with pad (or space by default) to 
	the left upto len length.
*/
Text.lpad = function lpad(str, len, pad) {
	if (isNaN(len) || str.length >= len) {
		return str;
	} else {
		pad = (pad || ' ') +'';
		return (pad.repeat((len - str.length) / pad.length + 1) + str).substr(-len);
	}
};

/** Text.rpad(str, len, pad=' '):
	Returns a copy of the str string padded with pad (or space by default) to 
	the right upto len length.
*/
Text.rpad = function rpad(str, len, pad) {
	if (isNaN(len) || str.length >= len) {
		return str;
	} else {
		pad = (pad || ' ') +'';
		return (str + pad.repeat((len - str.length) / pad.length + 1)).substr(0, len);
	}
};

/* Functions and definitions regarding type checking, constraints,	validation 
	and coercion.
*/
// Type representations. ///////////////////////////////////////////////////////
var types = exports.types = {};

var Type = exports.Type = function Type(defs) {
	defs = defs || {};
	if (defs.hasOwnProperty('isType') && typeof defs.isType === 'function') {
		this.isType = defs.isType;
	}
	if (defs.hasOwnProperty('isCompatible') && typeof defs.isCompatible === 'function') {
		this.isCompatible = defs.isCompatible;
	}
	if (defs.hasOwnProperty('coerce') && typeof defs.coerce === 'function') {
		this.coerce = defs.coerce;
	}
	if (defs.hasOwnProperty('toString') && typeof defs.toString === 'string') {
		var typeString = defs.toString;
		this.toString = function toString() {
			return typeString;
		};
	}
};

/** Type.isCompatible(value):
	Returns if the value is assignment compatible with this type. By default
	the only compatible values are the ones in the type itself. But it can
	be overriden to allow subtypes and coercions.
*/
Type.prototype.isCompatible = function isCompatible(value) {
	return this.isType(value);
};

/** Type.incompatibleError(value):
	Returns an Error with a message for values incompatible with this type.
*/
Type.prototype.incompatibleError = function incompatibleError(value) {
	return new TypeError("Value "+ value +" is not compatible with type "+ this +".");
};

/** Type.coerce(value):
	Converts the value to this type, if possible and necessary. If it is not
	possible, it raises a TypeError. This is the default behaviour.
*/
Type.prototype.coerce = function coerce(value) {
	throw this.incompatibleError(value);
};

// Javascript primitive types. /////////////////////////////////////////////

types.BOOLEAN = new Type({
	isType: function isType(value) {
		return typeof value === 'boolean' || 
			value !== undefined && value !== null && value.constructor === Boolean;
	},
	isCompatible: function isCompatible(value) {
		return true; // Can always coerce to boolean.
	},
	coerce: function coerce(value) {
		return !!value;
	},
	toString: "boolean"
});

types.NUMBER = new Type({
	isType: function isType(value) {
		return typeof value === 'number' || 
			value !== undefined && value !== null && value.constructor === Number;
	},
	isCompatible: function isCompatible(value) {
		return true; // Can always coerce to number.
	},
	coerce: function coerce(value) {
		return +value;
	},
	toString: "number"
});

types.STRING = new Type({
	isType: function isType(value) {
		return typeof value === 'string' || 
			value !== undefined && value !== null && value.constructor === String;
	},
	isCompatible: function isCompatible(value) {
		return true; // Can always coerce to string.
	},
	coerce: function coerce(value) {
		return ''+ value;
	},
	toString: "string"
});

types.FUNCTION = new Type({
	isType: function isType(value) {
		return typeof value === 'function' || 
			value !== undefined && value !== null && value.constructor === Function;
	},
	toString: "function"
});

// Simple types. ///////////////////////////////////////////////////////////

types.INTEGER = new Type({
	isType: function isType(value) {
		return (value << 0) === value;
	},
	isCompatible: function isCompatible(value) {
		return !isNaN(value);
	},
	coerce: function coerce(value) {
		return +value >> 0;
	},
	toString: "integer"
});

types.CHARACTER = new Type({
	isType: function isType(value) {
		return types.STRING.isType(value) && value.length === 1;
	},
	isCompatible: function isCompatible(value) {
		return (''+ value).length > 0;
	},
	coerce: function coerce(value) {
		return (''+ value).charAt(0);
	},
	toString: "character"
});

// Object types. ///////////////////////////////////////////////////////////

/** types.OBJECT:
	Basic Object type (no constructor or member constraints).
*/
types.OBJECT = new Type({
	isType: function isType(value) {
		return typeof value === 'object';
	},
	isCompatible: function isCompatible(value) {
		return typeof value !== 'function';
	},
	coerce: function coerce(value) {
		switch (typeof value) {
			case 'function': throw this.incompatibleError(value);
			case 'object': return value;
			default: return Object(value);
		}
	},
	toString: "object"
});

/** new types.ObjectType(defs):
	An object type is defined by a constructor function and/or a set of
	members, each defined by an id and a type.
*/
var ObjectType = types.ObjectType = function ObjectType(defs) {
	Type.call(this, {});
	if (defs.hasOwnProperty("constructor") && typeof def.constructor === 'function') {
		this.instanceOf = defs.constructor;
		delete defs.constructor;
	} else {
		this.instanceOf = null;
	}
	this.members = defs.members || {};
};
ObjectType.prototype = new Type();
ObjectType.prototype.constructor = ObjectType;

/** ObjectType.isType(value):
	Checks if the value is an object, and an instance of the specified
	constructor of this type (if applies).
*/
ObjectType.prototype.isType = function isType(value) {
	if (typeof value !== 'object') {
		return false;
	}
	if (this.instanceOf && !(value instanceof this.instanceOf)) {
		return false;
	}
	for (var member in this.members) {
		if (!this.members[member].isType(value[member])) {
			return false;
		}
	}
	return true;
};

/** ObjectType.isCompatible(value):
	Returns if the value is assignment compatible with this type. By default
	the only compatible values are the ones in the type itself. But it can
	be overriden to allow subtypes and coercions.
*/
ObjectType.prototype.isCompatible = function isCompatible(value) {
	if (typeof value !== 'object') {
		return false;
	}
	if (this.instanceOf && !(value instanceof this.instanceOf)) {
		return false;
	}
	for (var member in this.members) {
		if (!this.members[member].isCompatible(value[member])) {
			return false;
		}
	}
	return true;
};

/** ObjectType.coerce(value):
	Converts the value to this type, if possible and necessary. If it is not
	possible, it raises a TypeError. This is the default behaviour.
*/
ObjectType.prototype.coerce = function coerce(value) { 
	var result = this.instanceOf ? new this.instanceOf(value) : {}; //TODO Check this please.
	for (var member in this.members) {
		result[member] = this.members[member].coerce(value[member]);
	}
	return result;
};

// Array types. ////////////////////////////////////////////////////////////

/** types.ARRAY:
	Basic array type (no length or element type constraints).
*/
types.ARRAY = new Type({
	isType: function isType(value) {
		return Array.isArray(value);
	},
	isCompatible: function isCompatible(value) {
		return this.isType(value) || typeof value === 'string';
	},
	coerce: function coerce(value) {
		if (this.isType(value)) {
			return value;
		} else if (typeof value === 'string') {
			return value.split('');
		} else {
			throw this.incompatibleError(value);
		}
	},
	toString: "array"
});

/** new types.ArrayType(elementTypes, length):
	Type for arrays of a given length and all elements of the given type.
*/
var ArrayType = types.ArrayType = function ArrayType(elementTypes, length) {
	Type.call(this, {});
	if (!elementTypes) {
		this.elementTypes = [];
		this.length = +length;
	} else if (!Array.isArray(elementTypes)) {
		this.elementTypes = [elementTypes];
		this.length = +length;
	} else {
		this.elementTypes = elementTypes;
		this.length = isNaN(length) ? this.elementTypes.length : Math.max(+length, this.elementTypes.length);
	}
};
ArrayType.prototype = new Type();
ArrayType.prototype.constructor = ArrayType;

ArrayType.prototype.isType = function isType(value) {
	if (!Array.isArray(value) || !isNaN(this.length) && value.length !== this.length) {
		return false;
	}
	if (this.elementTypes) {
		var elementType; 
		for (var i = 0, len = value.length; i < len; i++) {
			elementType = this.elementTypes[Math.min(this.elementTypes.length - 1, i)]; 
			if (!elementType.isType(value[i])) {
				return false;
			}
		}
	}
	return true;
};

ArrayType.prototype.isCompatible = function isCompatible(value) {
	if (!Array.isArray(value)) {
		if (typeof value === 'string') {
			value = value.split('');
		} else {
			return false;
		}
	}
	if (!isNaN(this.length) || value.length < +this.length) {
		return false;
	}
	if (this.elementTypes) {
		var elementType;
		for (var i = 0, len = value.length; i < len; i++) {
			elementType = this.elementTypes[Math.min(this.elementTypes.length - 1, i)]; 
			if (!elementType.isCompatible(value[i])) {
				return false;
			}
		}
	}
	return true;
};

ArrayType.prototype.coerce = function coerce(value) {
	if (!Array.isArray(value)) {
		if (typeof value === 'string') {
			value = value.split('');
		} else {
			throw this.incompatibleError(value);
		}
	} else {
		value = value.slice(); // Make a shallow copy.
	}
	if (!isNaN(this.length)) { 
		if (value.length > this.length) { // Longer arrays are truncated.
			value = value.slice(0, this.length);
		} else if (value.length < this.length) { // Shorter arrays cannot be coerced.
			throw this.incompatibleError(value);
		}
	}
	if (this.elementTypes) {
		var elementType; 
		for (var i = 0, len = value.length; i < len; i++) {
			elementType = this.elementTypes[Math.min(this.elementTypes.length - 1, i)]; 
			value[i] = elementType.coerce(value[i]);
		}
	}
	return value;
};

// Initializers. ///////////////////////////////////////////////////////////////

/** new Initializer(subject={}, args={}):
	Initializers are object builders, allowing the declaration of default 
	values, type checks and coercions, and other checks.
*/		
var Initializer = exports.Initializer = function Initializer(subject, args) {
	this.subject = subject || {};
	this.args = args || {};
};

/** Initializer.get(id, options):
	Gets the value for the given id. If it is missing, options.defaultValue
	is used as the default value if defined. Else an error is raised.
	If options.type is defined, the value is checked to be a member of said
	type. If options.coerce is true, the value may be coerced.
	The function option.check can check the value further. If defined it
	is called with the value, and is expected to raise errors on failed
	conditions.
	Other options include:
	- options.regexp: the value is matched agains a regular expression.
	- options.minimum: the value has to be greater than or equal to this value.
	- options.maximum: the value has to be less than or equal to this value.
*/
Initializer.prototype.get = function get(id, options) {
	var value, type;
	options = options || {};
	if (!this.args.hasOwnProperty(id)) {
		if (!options.hasOwnProperty("defaultValue")) {
			throw new Error(options.missingValueError || "Missing argument <"+ id +">!");
		}
		value = options.defaultValue;
	} else {
		value = this.args[id];
	}
	// Check type if defined.
	type = options.type;
	if (type && !type.isType(value)) {
		if (!options.coerce) {
			throw new Error(options.typeMismatchError || "Value for <"+ id +"> must be a "+ type +"!");
		}
		value = type.coerce(value);
	}
	// Check further constraints.
	if (options.regexp && !options.regexp.exec(value)) {
		throw new Error(options.invalidValueError || "Value <"+ value +"> for <"+ id +"> does not match "+ options.regexp +"!");
	}
	if (options.hasOwnProperty("minimum") && options.minimum > value) {
		throw new Error(options.invalidValueError || "Value <"+ value +"> for <"+ id +"> must be greater than or equal to "+ options.minimum +"!");
	}
	if (options.hasOwnProperty("maximum") && options.maximum < value) {
		throw new Error(options.invalidValueError || "Value <"+ value +"> for <"+ id +"> must be less than or equal to "+ options.maximum +"!");
	}
	if (typeof options.check === 'function') {
		options.check.call(this.subject, value, id, options);
	}
	return value;
};

/** Initializer.attr(id, options={}):
	Assigns the id property, performing all necessary verifications. If 
	options.overwrite is false, an error is raised if the subject already 
	has the attribute defined. If options.ignore is true, no error is raised
	and the assignment is skipped instead. 
*/
Initializer.prototype.attr = function attr(id, options) {
	options = options || {};
	try {
		if (options.hasOwnProperty("overwrite") && !options.overwrite && this.subject.hasOwnProperty(id)) {
			throw new Error(options.attrOverwriteError || "Attribute <"+ id +"> is already defined!");
		}
		this.subject[id] = this.get(id, options);
	} catch (exception) { 
		if (!options.ignore) {
			throw exception; // Do not ignore the error and throw it.
		}
	}
	return this; // For chaining.
};

// Shortcuts. //////////////////////////////////////////////////////////////

/** Initializer.bool(id, options):
	Assigns the id property with a truth value.
*/
Initializer.prototype.bool = function bool(id, options) {
	options = options || {};
	options.type = types.BOOLEAN;
	return this.attr(id, options);
};

/** Initializer.string(id, options):
	Assigns the id property with a string value.
*/
Initializer.prototype.string = function string(id, options) {
	options = options || {};
	options.type = types.STRING;
	return this.attr(id, options);
};

/** Initializer.number(id, options):
	Assigns the id property with a numerical value.
*/
Initializer.prototype.number = function number(id, options) {
	options = options || {};
	options.type = types.NUMBER;
	return this.attr(id, options);
};

/** Initializer.integer(id, options):
	Assigns the id property with an integer value.
*/
Initializer.prototype.integer = function integer(id, options) {
	options = options || {};
	options.type = types.INTEGER;
	return this.attr(id, options);
};

/** Initializer.func(id, options):
	Assigns the id property with a function.
*/
Initializer.prototype.func = function func(id, options) {
	options = options || {};
	options.type = types.FUNCTION;
	return this.attr(id, options);
};

/** Initializer.array(id, options):
	Assigns the id property with an array. Options may include:
	- options.elementTypes: Required type of the array's elements.
	- options.length: Required length of the array.
*/
Initializer.prototype.array = function array(id, options) {
	options = options || {};
	if (options.hasOwnProperty('length') || options.hasOwnProperty('elementType')) {
		options.type = new types.ArrayType(options.elementType, options.length);
	} else {
		options.type = types.ARRAY;
	}
	return this.attr(id, options);
};

/** Initializer.object(id, options):
	Assigns the id property with an object.
*/
Initializer.prototype.object = function object(id, options) {
	options = options || {};
	options.type = types.OBJECT;
	return this.attr(id, options);
};

/** initialize(subject, args):
	Returns a new Initializer for the subject.
*/
var initialize = exports.initialize = function initialize(subject, args) {
	return new Initializer(subject, args);
}


/* Standard implementation of iterables and iterators (a.k.a. enumerations), 
	and many functions that can be built with it.
*/
// Iterable constructor. ///////////////////////////////////////////////////////
	
/** new Iterable(it):
	Constructor of iterable objects. Those have a __iter__() method that 
	returns an iterator function. This iterator returns the current value 
	and advances each time it is called. When sequence ends, the iterator
	raises the iterables.STOP_ITERATION singleton exception.
	This constructor supports strings (iterating over each caracter), arrays,
	objects (key-value pairs) and functions (assuming it is the iterator
	constructor). A value of null or undefined is not allowed. Everything 
	else is assumed to be the only value of a singleton sequence.
*/
var Iterable = exports.Iterable = function Iterable(obj) {
	if (obj === null || obj === undefined) {
		throw new Error('Iterable source is null or undefined.');
	} else if (typeof obj === 'function') {
		this.__iter__ = obj;
	} else if (typeof obj === 'string') {
		this.__iter__ = Iterable.__iteratorFromString__(obj);
	} else if (Array.isArray(obj)) {
		this.__iter__ = Iterable.__iteratorFromArray__(obj);
	} else if (typeof obj === 'object') {
		if (typeof obj.__iter__ == 'function') {
			this.__iter__ = obj.__iter__.bind(obj);
		} else {
			this.__iter__ = Iterable.__iteratorFromObject__(obj);
		}
	} else {
		this.__iter__ = Iterable.__iteratorSingleton__(obj);
	}
};

/** Iterable.STOP_ITERATION:
	Error raised when an iterator has finished. It is catched by all 
	Iterable's functions.
*/
var STOP_ITERATION = Iterable.STOP_ITERATION = new Error('Sequence has ended.');

/** Iterable.stop():
	Raises the STOP_ITERATION exception. If used inside an iterator it
	breaks the iteration.
*/
Iterable.prototype.stop = function stop() {
	throw STOP_ITERATION;
};

/** Iterable.catchStop(exception):
	If the exception is STOP_ITERATION it does nothing. If it is not, the
	exception is thrown.
*/
Iterable.prototype.catchStop = function catchStop(exception) {
	if (exception !== STOP_ITERATION) {
		throw exception;
	}
};

/** iterable(x):
	Returns an iterable, either if x is already one or builds one from it.
*/
var iterable = exports.iterable = function iterable(x) {
	return x instanceof Iterable ? x : new Iterable(x);
}

/** Iterable.EMPTY:
	An empty Iterable.
*/
Iterable.EMPTY = new Iterable(function () {
	return Iterable.prototype.stop;
});

// Iterables from common datatypes. ////////////////////////////////////////////

/** Iterable.__iteratorFromString__(str):
	Returns a constructor of iterators of the str string.
*/
Iterable.__iteratorFromString__ = function __iteratorFromString__(str) {
	return function __iter__() {
		var i = 0;
		return function __stringIterator__() {
			if (i < str.length) {
				return str.charAt(i++);
			} else {
				throw STOP_ITERATION;
			}
		};
	};
};

/** Iterable.__iteratorFromArray__(array):
	Returns a constructor of iterators of the given array.
*/
Iterable.__iteratorFromArray__ = function __iteratorFromArray__(array) {
	return function __iter__() {
		var i = 0;
		return function __arrayIterator__() {
			if (i < array.length) {
				return array[i++];
			} else {
				throw STOP_ITERATION;
			}
		};
	};
};

/** Iterable.__iteratorFromObject__(obj):
	Returns an iterator constructor going through obj's properties as 
	returned by Object.keys(). Each element in the sequence is an array with
	the property key and the property value.			
*/
Iterable.__iteratorFromObject__ = function __iteratorFromObject__(obj) {
	return function __iter__() {
		var keys = Object.keys(obj);
		return function __objectIterator__() {
			if (keys.length > 0) {
				var k = keys.shift();
				return [k, obj[k]];
			} else {
				throw STOP_ITERATION;
			}
		};
	};
};

/** Iterable.__iteratorSingleton__(x):
	Returns an iterator constructor with a singleton sequence with the given 
	value.
*/
Iterable.__iteratorSingleton__ = function __iteratorSingleton__(x) {
	return function __iter__() {
		var finished = false;
		return function __singletonIterator__() {
			if (!finished) {
				finished = true;
				return x;
			} else {
				throw STOP_ITERATION;
			}
		};
	};
};

// Iterables methods. //////////////////////////////////////////////////////////

/** Iterable.forEach(doFunction, ifFunction):
	Applies the doFunction to all elements complying with ifFunction, and 
	returns the last result.
	This is similar to basis.Iterable.map, but it does not return another
	iterable.
*/
Iterable.prototype.forEach = function forEach(doFunction, ifFunction) {
	var iter = this.__iter__(), x, i = 0, result;
	try { 
		for (x = iter(); true; x = iter(), i++) {
			if (!ifFunction || ifFunction(x, i)) {
				result = doFunction(x, i);
			}
		}
	} catch (err) {
		this.catchStop(err);
	}
	return result;
};

/** Iterable.toArray(array):
	Appends to the array the elements of the sequence and returns it. If no 
	array is given, a new one is used.
*/
Iterable.prototype.toArray = function toArray(array) {
	array = array || [];
	this.forEach(function (x) {
		array.push(x);
	});
	return array;
};

/** Iterable.toObject(obj={}):
	Takes an iterable of 2 element arrays and assigns to the given object 
	(or a new one by default) each key-value pairs as a property.
*/
Iterable.prototype.toObject = function toObject(obj) {
	obj = obj || {};
	this.forEach(function (x) {
		obj[x[0]] = x[1];
	});
	return obj;
};

/** Iterable.isEmpty():
	Returns if the sequence has no elements.
*/
Iterable.prototype.isEmpty = function isEmpty() {
	try {
		this.__iter__()();
		return false;
	} catch (err) {
		this.catchStop(err);
		return true;
	}
};

/** Iterable.count():
	Counts the number of elements in the sequence.
*/
Iterable.prototype.count = function count() {
	var result = 0;
	this.forEach(function (x) {
		result++;
	});
	return result;
};

/** Iterable.join(sep):
	Concatenates all strings in the sequence using sep as separator. If sep
	is not given, '' is assumed.
*/
Iterable.prototype.join = function join(sep) {
	var result = '';
	sep = ''+ (sep || '');
	this.forEach(function (x, i) { 
		result += (i === 0) ? x : sep + x; 
	});
	return result;
};

/** Iterable.sum(n=0):
	Returns the sum of all elements in the sequence, or 0 if the sequence is
	empty.
*/
Iterable.prototype.sum = function sum(n) {
	var result = isNaN(n) ? 0 : +n;
	this.forEach(function (x) { 
		result += (+x);
	});
	return result;
};

/** Iterable.min(n=Infinity):
	Returns the minimum element of all elements in the sequence, or Infinity
	if the sequence is empty.
*/
Iterable.prototype.min = function min(n) {
	var result = isNaN(n) ? Infinity : +n;
	this.forEach(function (x) { 
		x = (+x);
		if (x < result) {
			result = x; 
		}
	});
	return result;
};

/** Iterable.max(n=-Infinity):
	Returns the maximum element of all elements in the sequence, or -Infinity
	if the sequence is empty.
*/
Iterable.prototype.max = function max(n) {
	var result = isNaN(n) ? -Infinity : +n;
	this.forEach(function (x) { 
		x = (+x);
		if (x > result) {
			result = x; 
		}
	});
	return result;
};

/** Iterable.all(predicate, strict=false):
	Returns true if for all elements in the sequence the predicate returns
	true, or if the sequence is empty.
*/
Iterable.prototype.all = function all(predicate, strict) {
	predicate = typeof predicate === 'function' ? predicate : function (x) { return !!x; };
	var result = true;
	this.forEach(function (x) { 
		if (!predicate(x)) {
			result = false;
			if (!strict) {
				throw STOP_ITERATION; // Shortcircuit.
			}
		}
	});
	return result;
};

/** Iterable.any(predicate, strict=false):
	Returns false if for all elements in the sequence the predicate returns
	false, or if the sequence is empty.
*/
Iterable.prototype.any = function any(predicate, strict) {
	predicate = typeof predicate === 'function' ? predicate : function (x) { return !!x; };
	var result = false;
	this.forEach(function (x) { 
		if (predicate(x)) {
			result = true;
			if (!strict) {
				throw STOP_ITERATION; // Shortcut.
			}
		}
	});
	return result;
};

/** Iterable.map(mapFunction, filterFunction):
	Returns an iterable iterating on the results of applying mapFunction to 
	each of this iterable elements. If filterFunction is given, only elements
	for which filterFunction returns true are considered.
*/
Iterable.prototype.map = function map(mapFunction, filterFunction) {
	var from = this; // for closures.
	return new Iterable(function __iter__() {
		var iter = from.__iter__(), x, i = -1;
		return function __mapIterator__() {
			for (x = iter(); true; x = iter()) {
				i++;
				x = mapFunction ? mapFunction(x, i) : x;
				if (!filterFunction || filterFunction(x, i)) {
					return x;
				}
			}
			throw STOP_ITERATION;
		};			
	});
};

/** Iterable.filter(filterFunction, mapFunction):
	Returns an iterable of this iterable elements for which filterFunction
	returns true. If mapFunction is given it is applyed before yielding the
	elements.
*/
Iterable.prototype.filter = function filter(filterFunction, mapFunction) {
	var from = this; // for closures.
	return new Iterable(function __iter__() {
		var iter = from.__iter__(), x, i = -1;
		return function __mapIterator__() {
			while (true) {
				x = iter();
				i++;
				if (filterFunction ? filterFunction(x, i) : x) {
					return mapFunction ? mapFunction(x, i) : x;
				}
			}
			throw STOP_ITERATION;
		};
	});
};

/** Iterable.foldl(foldFunction, initial):
	Folds the elements of this iterable with foldFunction as a left associative
	operator. The initial value is used as a starting point, but if it is not
	defined, then the first element in the sequence is used.
*/
Iterable.prototype.foldl = function foldl(foldFunction, initial) {
	var iter = this.__iter__(), x;
	try {
		initial = initial === undefined ? iter() : initial;
		for (x = iter(); true; x = iter()) {
			initial = foldFunction(initial, x);
		}
	} catch (err) {
		this.catchStop(err);
	}
	return initial;
};

/** Iterable.scanl(foldFunction, initial):
	Folds the elements of this iterable with foldFunction as a left associative
	operator. Instead of returning the last result, it iterates over the 
	intermediate values in the folding sequence.
*/
Iterable.prototype.scanl = function scanl(foldFunction, initial) {
	var from = this; // for closures.
	return new Iterable(function __iter__() {
		var iter = from.__iter__(), value, count = -1;
		return function __scanlIterator__() {
			count++;
			if (count == 0) {
				value = initial === undefined ? iter() : initial;
			} else {
				value = foldFunction(value, iter());
			}
			return value;
		};
	});
};

/** Iterable.head(defaultValue):
	Returns the first element. If the sequence is empty it returns the 
	defaultValue, or raise an exception if one is not given.
*/
Iterable.prototype.head = function head(defaultValue) {
	try {
		return this.__iter__()();
	} catch (err) {
		this.catchStop(err);
		if (arguments.length < 1) {
			throw new Error("Tried to get the head value of an empty Iterable.");
		} else {
			return defaultValue;
		}
	}
};

/** Iterable.last(defaultValue):
	Returns the last element. If the sequence is empty it returns the 
	defaultValue, or raise an exception if one is not given.
*/
Iterable.prototype.last = function last(defaultValue) {
	var result, isEmpty = true, it = this.__iter__();
	try {
		for (isEmpty = true; true; isEmpty = false) {
			result = it();
		}
	} catch (err) {
		this.catchStop(err);
		if (!isEmpty) {
			return result;
		} else if (arguments.length < 1) {
			throw new Error("Tried to get the last value of an empty Iterable.");
		} else {
			return defaultValue;
		}
	}
};

/** Iterable.reverse():
	Returns an iterable with this iterable elements in reverse order.
	Warning! It stores all this iterable's elements in an array.
*/
Iterable.prototype.reverse = function reverse() {
	return new Iterable(this.toArray().reverse());
};

/** Iterable.foldr(foldFunction, initial):
	Folds the elements of this iterable with foldFunction as a right 
	associative	operator. The initial value is used as a starting point, but 
	if it is not defined, then the first element in the sequence is used.
	Warning! This is the same as doing a foldl in a reversed iterable.
*/
Iterable.prototype.foldr = function foldr(foldFunction, initial) {
	function flippedFoldFunction(x,y) {
		return foldFunction(y,x);
	}
	return this.reverse().foldl(flippedFoldFunction, initial);
};

/** Iterable.scanr(foldFunction, initial):
	Folds the elements of this iterable with foldFunction as a right 
	associative operator. Instead of returning the last result, it iterates
	over the intermediate values in the folding sequence.
	Warning! This is the same as doing a scanl in a reversed iterable.
*/
Iterable.prototype.scanr = function scanr(foldFunction, initial) {
	function flippedFoldFunction(x,y) {
		return foldFunction(y,x);
	}
	return this.reverse().scanl(flippedFoldFunction, initial);
};

/** Iterable.zip(iterables...):
	Returns an iterable that iterates over this and all the given iterables 
	at the same time; yielding an array of the values of each and stopping 
	at the first one finishing.
*/
Iterable.prototype.zip = function zip() {
	var its = Array.prototype.slice.call(arguments).map(iterable);
	its.unshift(this);
	return new Iterable(function __iter__() {
		var iterators = its.map(function (it) { 
			return it.__iter__(); 
		});
		return function __zipIterator__() {
			return iterators.map(function (iterator) { 
				return iterator();
			});
		};
	});
};

/** Iterable.sorted(sortFunction):
	Returns an iterable that goes through this iterable's elements in order.
	Warning! This iterable's elements are stored in an array for sorting.
*/
Iterable.prototype.sorted = function sorted(sortFunction) {
	return new Iterable(this.toArray().sort(sortFunction));
};

/** Iterable.cycle(n=Infinity):
	Returns an iterable that loops n times over the elements of this 
	Iterable (or forever by default).
*/
Iterable.prototype.cycle = function cycle(n) {
	n = n === undefined ? Infinity : (+n);
	var iterable = this; 
	return new Iterable(function __iter__() {
		var i = n, iter = iterable.__iter__();
		return function __cycleIterator__() {
			while (i > 0) try {
				return iter();
			} catch (err) {
				if (err === STOP_ITERATION && i > 1) {
					i--;
					iter = iterable.__iter__();
				} else {
					throw err;
				}
			}
			throw STOP_ITERATION; // In case n < 1.
		};
	});
};

/** Iterable.product(iterables...):
	Returns an iterable that iterates over the Cartesian product of this
	and all the given iterables; yielding an array of the values of each.
*/
Iterable.prototype.product = function product() {
	var its = Array.prototype.slice.call(arguments).map(iterable);
	its.unshift(this);
	return new Iterable(function __iter__() {
		var tuple, iterators = its.map(function (it) {
				return it.__iter__();
			});
		return function __productIterator__() {
			if (!tuple) { // First tuple.
				tuple = iterators.map(function (iter) {
					return iter(); // If STOP_ITERATION is raised, it should not be catched.
				});
			} else { // Subsequent tuples.
				for (var i = iterators.length-1; true; i--) {
					try {
						tuple[i] = iterators[i]();
						break;
					} catch (err) {
						if (i > 0 && err === STOP_ITERATION) {
							iterators[i] = its[i].__iter__();
							tuple[i] = iterators[i]();
						} else {
							throw err;
						}
					}
				}
			}
			return tuple.slice(0); // Shallow array clone.
		};
	});
};

/** Iterable.chain(iterables...):
	Returns an iterable that iterates over the concatenation of this and all 
	the given iterables.
*/
Iterable.prototype.chain = function chain() {
	var its = Array.prototype.slice.call(arguments).map(iterable);
	its.unshift(this);
	return new Iterable(function __iter__() {
		var i = 0, iterator = its[0].__iter__();
		return function __chainIterator__() {
			while (true) try {
				return iterator();
			} catch (err) { 
				if (err === STOP_ITERATION && i + 1 < its.length) {
					i++;
					iterator = its[i].__iter__();
				} else {
					throw err; // Rethrow if not STOP_ITERATION or there aren't more iterables.
				}
			}
			throw STOP_ITERATION;
		};
	});
};

/** Iterable.flatten():
	Chains all the iterables in the elements of this iterable.
*/
Iterable.prototype.flatten = function flatten() {
	var it = this.__iter__();
	return new Iterable(function __iter__() {
		var iterator = this.stop;
		return function __flattenIterator__() {
			while (true) try {
				return iterator();
			} catch (err) { 
				if (err === STOP_ITERATION) {
					iterator = iterable(it()).__iter__();
				}
			}
			throw STOP_ITERATION;
		};
	});
};	

/** Iterable.pluck(member):
	Shortcut for a map that extracts a member from the objects in the 
	sequence.
	Inspired by <http://underscorejs.org/#pluck>.
*/
Iterable.prototype.pluck = function pluck(member) {
	return this.map(function (obj) {
		return obj[member];
	});
};

/** Iterable.greater(evaluation=<cast to number>):
	Returns an array with the elements of the iterable with greater
	evaluation.
*/
Iterable.prototype.greater = function greater(evaluation) {
	evaluation = typeof evaluation === 'function' ? evaluation : function (x) {
			return +x;
		};
	var maxEval = -Infinity, result = [], e;
	this.forEach(function (x) {
		e = evaluation(x);
		if (maxEval < e) {
			maxEval = e;
			result = [x];
		} else if (maxEval == e) {
			result.push(x);
		}
	});
	return result;
};

/** Iterable.lesser(evaluation=<cast to number>):
	Returns an array with the elements of the iterable with lesser
	evaluation.
*/
Iterable.prototype.lesser = function lesser(evaluation) {
	evaluation = typeof evaluation === 'function' ? evaluation : function (x) {
			return +x;
		};
	var minEval = Infinity, result = [], e;
	this.forEach(function (x) {
		e = evaluation(x);
		if (minEval > e) {
			minEval = e;
			result = [x];
		} else if (minEval == e) {
			result.push(x);
		}
	});
	return result;
};

/** Iterable.sample(n, random=Randomness.DEFAULT):
	Returns an iterable with n elements of this iterable randomly selected. The
	order of the elements is maintained.
*/
Iterable.prototype.sample = function sample(n, random) {
	random = random || Randomness.DEFAULT;
	var buffer = [];
	this.forEach(function (x, i) {
		var r = random.random();
		if (buffer.length < n) {
			buffer.push([r, x, i]);
		} else if (r < buffer[buffer.length - 1][0]) {
			buffer.push([r, x, i]);
			buffer.sort(function (t1, t2) {
				return t1[0] - t2[0]; // Order by random value.
			});
			buffer.pop();
		}		
	});
	buffer.sort(function (t1, t2) {
		return t1[2] - t2[2]; // Order by index.
	});
	return new Iterable(buffer.map(function (t) {
		return t[1]; // Keep only the elements.
	}));
};

// Utility functions. //////////////////////////////////////////////////////////

/** Iterable.range(from=0, to, step=1):
	Builds an Iterable object with number from argument from upto argument to,
	with the given step. For example, basis.range(2,12,3) represents the 
	sequence {2, 5, 8, 11}.
*/
Iterable.range = function range(from, to, step) {
	switch (arguments.length) {
		case 0: from = 0; to = 0; step = 1; break;
		case 1: to = from; from = 0; step = 1; break;
		case 2: step = 1; break;
	}
	return new Iterable(function __iter__() {
		var i = from, r;
		return function __rangeIterator__() {
			if (isNaN(i) || isNaN(to) || i >= to) {
				throw STOP_ITERATION;
			} else {
				r = i;
				i = i + step;
				return r;
			}
		};
	});
};

/** Iterable.repeat(x, n=Infinity):
	Returns an iterable that repeats the element x n times (or forever by
	default).
*/
Iterable.repeat = function repeat(x, n) {
	n = isNaN(n) ? Infinity : +n;
	return new Iterable(function __iter__() {
		var i = n;
		return function __repeatIterator__() {
			i--;
			if (i < 0) {
				throw STOP_ITERATION;
			} else {
				return x;
			}
		};
	});
};

/** Iterable.iterate(f, x, n=Infinity):
	Returns an iterable that repeatedly applies the function f to the value
	x, n times (or indefinitely by default).
*/
Iterable.iterate = function iterate(f, x, n) {
	n = isNaN(n) ? Infinity : +n;
	return new Iterable(function __iter__() {
		var i = n, value = x;
		return function __iterateIterator__() {
			i--;
			if (i < 0) {
				throw STOP_ITERATION;
			} else {
				var result = value;
				value = f(value);
				return result;
			}
		};
	});
};

Iterable.product = function product(it) {
	if (arguments.length < 1) {
		return Iterable.EMPTY;
	} else {
		it = iterable(it);
		return it.product.apply(it, Array.prototype.slice.call(arguments, 1));
	}
};

/* Future (aka Promise, Deferred, Eventual, etc) implementation to deal with 
	asynchronism and parallelism.
*/
var Future = exports.Future = declare({
	/** new Future():
		An implementation of [futures](http://docs.oracle.com/javase/7/docs/api/java/util/concurrent/Future.html)
		(aka [deferreds](http://api.jquery.com/category/deferred-object/) or
		[promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)), 
		a construction oriented to simplify the interaction between parallel 
		threads. A [future](http://en.wikipedia.org/wiki/Futures_and_promises) 
		represents a value that is being calculated asynchronously. Callbacks 
		are registered for when the value becomes available or an error raised.
	*/
	constructor: function Future(value) {
		/** Future.state=0:
			Current state of the Future. Pending is 0, resolved is 1, rejected
			is 2, cancelled is 3.
		*/
		this.state = 0;
		this.callbacks = [[],[],[]];
		if (arguments.length > 0) {
			this.resolve(value);
		}
	},

	/** Future.STATES=['pending', 'resolved', 'rejected', 'cancelled']:
		An array with labels for the Future's possible states.
	*/
	STATES: ['pending', 'resolved', 'rejected', 'cancelled'],
	
	/** Future.__complete__(context, value, state):
		Internal use method that changes this future's state from pending to 
		state, calling all the corresponding callbacks with the given context 
		and value.
	*/
	__complete__: function __complete__(context, value, state) {
		var future = this;
		if (this.state === 0) {
			this.state = state;
			this.__completion__ = [context, value];
			this.callbacks[state - 1].forEach(function (callback) {
				if (typeof callback === 'function') {
					setTimeout(callback.bind(context, value), 1);
				}
			});
		}
		return this; // for chaining.
	},

	/** Future.resolve(value, context=this):
		Marks the future as resolved. This method should be	called by the 
		producer thread when its process is finished successfully.
	*/
	resolve: function resolve(value, context) {
		return this.state === 0 ? this.__complete__(context || this, value, 1) : this;
	},

	/** Future.reject(reason, context=this):
		Marks the future as 'rejected' and calls onRejected callbacks. This 
		method should be called by the producer thread when its process is 
		aborted with an error.
		If there aren't any onRejected callbacks registered, an Error is raised.
		This can be reason (if it is already an Error) or a new Error with
		reason as message.
	*/
	reject: function reject(reason, context) {
		if (this.state === 0) {
			this.__complete__(context || this, reason, 2);
			if (this.callbacks[1].length < 1) {
				if (reason instanceof Error) {
					throw reason;
				} else {
					throw new Error(reason);
				}
			}
		}
		return this;
	},

	/** Future.cancel(reason):
		Marks the future as 'cancelled' and disregards all callbacks. This 
		method may be called by either the producer or the consumer threads.
	*/	
	cancel: function cancel(reason) {
		return this.state === 0 ? this.__complete__(this, reason, 3) : this;
	},

	/** Future.bind(future):
		Binds this future resolution, rejection and cancellation to the given 
		future's corresponding resolution, rejection and cancellation. 
	*/
	bind: function bind(future) {
		future.done(this.resolve.bind(this));
		future.fail(this.reject.bind(this));
		future.__onCancel__(this.cancel.bind(this));
		return this;
	},

	/** Future.__register__(callback, state):
		Registers a callbacks to be called when this Future is in the given 
		state. If this Future is already in that state the callback is called 
		right away. If this Future is neither pending nor in that state, the
		callback is ignored.
	*/
	__register__: function __register__(callback, state) {
		if (typeof callback === 'function') {
			if (this.state === 0) { // If future is pending...
				this.callbacks[state - 1].push(callback);
			} else if (this.state === state) {
				setTimeout(callback.bind(this.__completion__[0], this.__completion__[1]), 1);
			}
			return this;
		} else {
			throw new Error("Callback must be a function, and not "+ callback);
		}
	},

	/** Future.done(callback...):
		Registers one or more callbacks to be called when this Future is 
		resolved. If this Future is already resolved the callbacks are called
		right away. If this Future is neither pending nor resolved, callbacks
		are ignored.
	*/
	done: function done() {
		for (var i = 0; i < arguments.length; i++) {
			this.__register__(arguments[i], 1);
		}
		return this;
	},

	/** Future.fail(callback...):
		Registers one or more callbacks to be called when this Future is 
		rejected. If this Future is already rejected the callbacks are called
		right away. If this Future is neither pending nor rejected, callbacks
		are ignored.
	*/
	fail: function fail() {
		for (var i = 0; i < arguments.length; i++) {
			this.__register__(arguments[i], 2);
		}
		return this;
	},

	/** Future.__onCancel__(callback...):
		Registers one or more callbacks to be called when this Future is 
		cancelled.
	*/
	__onCancel__: function __onCancel__() {
		for (var i = 0; i < arguments.length; i++) {
			this.__register__(arguments[i], 3);
		}
		return this;
	},

	/** Future.always(callback...):
		Registers one or more callbacks to be called when this Future is either
		resolved or rejected. It is the same as using done() and fail() 
		functions.
	*/
	always: function always() {
		return this.done.apply(this, arguments).fail.apply(this, arguments);
	},

	/** Future.isPending():
		Checks if this future's state is 'pending'.
	*/
	isPending: function isPending() {
		return this.state === 0;
	},

	/** Future.isResolved:
		Checks if this future's state is 'resolved'.
	*/
	isResolved: function isResolved() {
		return this.state === 1;
	},

	/** Future.isRejected:
		Checks if this future's state is 'rejected'.
	*/
	isRejected: function isRejected() {
		return this.state === 2;
	},

	/** Future.isCancelled:
		Checks if this future's state is 'cancelled'.
	*/
	isCancelled: function isCancelled() {
		return this.state === 3;
	},

	/** Future.then(onResolved, onRejected):
		Returns a new Future which is resolved when this future is resolved, and
		rejected in the same way. The given callbacks are used to calculate a
		new value to either resolution or rejection of the new Future object.
	*/
	then: function then(onResolved, onRejected) {
		var result = new Future();
		this.done(function (value) {
			try {
				value = onResolved ? onResolved(value) : value;
				if (value instanceof Future) {
					result.bind(value);
				} else {
					result.resolve(value);
				}
			} catch (err) {
				result.reject(err);
			}			
		});
		this.fail(function (reason) {
			if (!onRejected) {
				result.reject(reason);
			} else {
				try {
					reason = onRejected(reason);
					if (reason instanceof Future) {
						result.bind(reason);
					} else {
						result.resolve(reason);
					}
				} catch (err) {
					result.reject(err);
				}
			}
		});
		this.__onCancel__(result.cancel.bind(result));
		return result;
	},
	
	toString: function toString() {
		return 'Future:'+ this.STATES[this.state];
	}
}); // declare Future.

// Functions dealing with Futures. /////////////////////////////////////////////

/** static Future.when(value):
	Unifies asynchronous and synchronous behaviours. If value is a Future
	it is returned as it is. Else a resolved Future is returned with the 
	given value.
*/
var when = Future.when = function when(value) {
	return value instanceof Future ? value : new Future(value);
};

/** static Future.invoke(fn, _this, args...):
	Calls the function synchronously, returning a future resolved with the 
	call's result. If an exceptions is raised, the future is rejected with it.
*/
Future.invoke = function invoke(fn, _this) {
	try {
		return when(fn.apply(_this, Array.prototype.slice.call(arguments, 2)));
	} catch (error) {
		var result = new Future();
		result.reject(error);
		return result;
	}
};

/** static Future.all(futures):
	Returns a Future that is resolved when all the given futures are 
	resolved, or rejected when one is rejected. If no futures are given,
	the result is resolved with [].
*/
Future.all = function all(futures) {
	futures = Array.isArray(futures) ? futures : iterable(futures).toArray();
	var result = new Future(),
		count = futures.length,
		values = new Array(count), future,
		doneCallback = function (index, value) {
			values[index] = value;
			if (--count < 1) {
				//console.log("all() resolved with "+ values.length +" values.");//FIXME
				result.resolve(values);
			}
		};
	if (count < 1) {
		result.resolve([]);
	} else for (var i = 0; i < futures.length; i++) {
		future = when(futures[i]);
		future.done(doneCallback.bind(this, i));
		future.fail(result.reject.bind(result));
		future.__onCancel__(result.cancel.bind(result));
	}
	return result;
};

/** static Future.any(futures):
	Returns a Future that is resolved when any of the given futures are 
	resolved, or rejected when all are rejected. If no futures are given,
	the result is rejected with undefined.
*/
Future.any = function any(futures) {
	futures = iterables.iterable(futures).toArray();
	var result = new Future(), 
		count = futures.length,
		values = new Array(count), future;
	if (count < 1) {
		result.reject();
	} else for (var i = 0; i < futures.length; i++) {
		future = when(futures[i]);
		future.fail((function (index) {
			return function (value) {
				values[index] = value;
				count--;
				if (count < 1) {
					result.reject(value);
				}
			};
		})(i));
		future.done(result.resolve.bind(result));
		future.__onCancel__(result.cancel.bind(result));
	}
	return result;
};

/** static Future.sequence(xs, f=None):
	Evaluates all values and futures in the iterable xs in sequence. If it
	is given, the function f is called for each value.
*/
Future.sequence = function sequence(xs, f) {
	var result = new Future(), x,
		rejection = result.reject.bind(result),
		it = iterable(xs).__iter__(),
		action = function action(lastValue) {
			try {
				x = it();
				if (f) {
					return when(x).then(f, rejection).then(action, rejection);
				} else {
					return when(x).then(action, rejection);
				}
			} catch (err) {
				if (err === STOP_ITERATION) {
					result.resolve(lastValue);
				} else {
					result.reject(err);
				}
			}
		};
	action();
	return result;
};

/** static Future.doWhile(action, condition):
	Perform the action until the condition fails. The action is first called
	without arguments, and afterwards is called with the previous value. The
	conditions is always called with the last value returned by action. 
	Both action and condition may return futures. The condition by default
	is the boolean conversion of the action's returned value.
*/
Future.doWhile = function doWhile(action, condition) {
	condition = condition || function (value) {
		return !!value;
	};
	var loopEnd = new Future(),
		reject = loopEnd.reject.bind(loopEnd);
	function loop(value) {
		Future.invoke(condition, this, value).then(function (checks) {
			if (checks) {
				Future.invoke(action, this, value).then(loop, reject);
			} else {
				loopEnd.resolve(value);
			}
		}, reject);
	}
	Future.invoke(action).then(loop, reject);
	return loopEnd;
};

/** static Future.whileDo(condition, action):
	Similar to futures.doWhile, but evaluates the condition first.
*/
Future.whileDo = function whileDo(condition, action) {
	return Future.invoke(condition).then(function (checks) {
		return Future.doWhile(action, condition);
	});
};

/** static Future.delay(ms, value):
	Return a future that will be resolved with the given value after the 
	given time in milliseconds. Time is forced to be at least 10ms. If value
	is undefined, the timestamp when the function is called is used.
*/
Future.delay = function delay(ms, value) {
	ms = isNaN(ms) ? 10 : Math.max(+ms, 10);
	value = typeof value === 'undefined' ? Date.now() : value;
	var result = new Future();
	setTimeout(result.resolve.bind(result, value), ms);
	return result;
};

/** static Future.retrying(f, t=10, delay=100ms, delayFactor=2, maxDelay=5min):
	Calls the function f upto t times until it returns a value or a future that
	is resolved. Each time is separated by a delay that gets increased by
	delayFactor upto maxDelay.
*/
Future.retrying = function retrying(f, times, delay, delayFactor, maxDelay) {
	times = isNaN(times) ? 10 : +times;
	return times < 1 ? Future.invoke(f) : Future.invoke(f).then(undefined, function () {
		delay = isNaN(delay) ? 100 : +delay;
		delayFactor = isNaN(delayFactor) ? 2.0 : +delayFactor;
		maxDelay = isNaN(maxDelay) ? 300000 : +maxDelay;
		return Future.delay(delay).then(function () {
			return Future.retrying(f, times - 1, Math.min(maxDelay, delay * delayFactor), delayFactor, maxDelay);
		});
	});
};

/** static Future.imports(...modules):
	Builds a future that loads the given modules using RequireJS' require 
	function, and resolves to an array of the loaded modules.
*/
Future.imports = function imports() {
	var result = new Future();
	require(Array.prototype.slice.call(arguments), function () {
		result.resolve(Array.prototype.slice.call(arguments));
	}, function (err) {
		result.reject(err);
	});
	return result;
};

/* A wrapper of XMLHttpRequest, adding some functionality and dealing with
	asynchronism with Futures.
*/
var HttpRequest = exports.HttpRequest = declare({ 
	/** new HttpRequest():
		A wrapper for XMLHttpRequest.
	*/
	constructor: function HttpRequest() {
		this.__request__ = new XMLHttpRequest();
	},
	
	/** HttpRequest.request(method, url, content, headers, user, password):
		Opens the request with the given method at the given url, sends the
		contents and returns a future that gets resolved when the request is
		responded.
	*/
	request: function request(method, url, content, headers, user, password) {
		var xhr = this.__request__,
			future = new Future();
		xhr.open(method, url, true, user, password); // Always asynchronously.
		if (headers) {
			Object.getOwnPropertyNames(headers).forEach(function (id) {
				xhr.setRequestHeader(id, headers[id]);
			});
		}
		// See <http://www.w3schools.com/ajax/ajax_xmlhttprequest_onreadystatechange.asp>.
		xhr.onreadystatechange = function () { 
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					future.resolve(xhr);
				} else {
					future.reject(xhr);
				}
			}
		};
		xhr.send(content);
		return future;
	},
	
	/** HttpRequest.get(url, content, headers, user, password):
		Shortcut for a request with the GET method.
	*/
	get: function get(url, content, headers, user, password) {
		return this.request('GET', url, content, headers, user, password);
	},
	
	/** HttpRequest.getText(url, content, headers, user, password):
		Makes a GET request and returns the response's text.
	*/
	getText: function getText(url, content, headers, user, password) {
		return this.get(url, content, headers, user, password).then(function (xhr) {
			return xhr.responseText;
		});
	},
	
	/** HttpRequest.getJSON(url, content, headers, user, password):
		Makes a GET request and parses the response text as JSON.
	*/
	getJSON: function getJSON(url, content, headers, user, password) {
		return this.get(url, content, headers, user, password).then(function (xhr) {
			return JSON.parse(xhr.responseText);
		});
	},
	
	/** HttpRequest.post(url, content, headers, user, password):
		Shortcut for a request with the POST method.
	*/
	post: function post(url, content, headers, user, password) {
		return this.request('POST', url, content, headers, user, password);
	},
	
	/** HttpRequest.postJSON(url, content, headers, user, password):
		Makes a POST request with the content encoded with JSON.stringify().
	*/
	postJSON: function postJSON(url, content, headers, user, password) {
		headers = headers || {};
		headers['Content-Type'] = "application/json";
		return this.post(url, JSON.stringify(content) || 'null', headers, user, password);
	}	
}); // declare HttpRequest.

// Generate static versions of HttpRequest methods.
['request', 'get', 'getJSON', 'getText', 'post', 'postJSON'
].forEach(function (id) {
	HttpRequest[id] = function () {
		return HttpRequest.prototype[id].apply(new HttpRequest(), arguments);
	};
});

/* Simple event manager.
*/
var Events = exports.Events = declare({
/** new Events(config):
	Event handler that manages callbacks registered as listeners.
*/
	constructor: function Events(config) {
		initialize(this, config)
		/** Events.maxListeners=Infinity:
			Maximum amount of listeners these events can have.
		*/
			.number('maxListeners', { defaultValue: Infinity, coerce: true, minimum: 1 })
		/** Events.isOpen=true:
			An open Events accepts listeners to any event. Otherwise event names
			have to be specified previously via the 'events' property in the 
			configuration.
		*/
			.bool('isOpen', { defaultValue: true });
		var __listeners__ = this.__listeners__ = {};
		config && Array.isArray(config.events) && config.events.forEach(function (eventName) {
			__listeners__[eventName] = [];
		});
	},

	/** Events.listeners(eventName):
		Returns an array with the listeners for the given event.
	*/
	listeners: function listeners(eventName) {
		if (this.__listeners__.hasOwnProperty(eventName)) {
			return this.__listeners__[eventName].slice(); // Return a copy of the array.
		} else {
			return [];
		}
	},
	
	/** Events.emit(eventName, ...args):
		Emits an event with the given arguments. Listeners' callbacks are
		called asynchronously.
	*/
	emit: function emit(eventName) {
		var args;
		if (Array.isArray(eventName)) {
			var events = this;
			args = Array.prototype.slice.call(arguments);
			eventName.forEach(function (name) {
				args[0] = name;
				events.emit.apply(this, args);
			});
		}
		if (!this.__listeners__.hasOwnProperty(eventName)) {
			return false;
		}
		args = Array.prototype.slice.call(arguments, 1);
		var listeners = this.__listeners__[eventName];
		this.__listeners__[eventName] = this.__listeners__[eventName]
			.filter(function (listener) {
				if (listener[1] > 0) {
					setTimeout(function () {
						return listener[0].apply(Global, args)
					}, 1);
					listener[1]--;
					return listener[1] > 0;
				} else {
					return false;
				}
			});
		return true;
	},
	
	/** Events.on(eventName, callback, times=Infinity):
		Registers a callback to listen to the event the given number of times,
		or always by default.
	*/
	on: function on(eventName, callback, times) {
		if (Array.isArray(eventName)) {
			var events = this;
			eventName.forEach(function (name) {
				events.on(name, callback, times);
			});
		} else {
			if (!this.__listeners__.hasOwnProperty(eventName)) {
				raiseIf(!this.isOpen, "Event ", eventName, " is not defined.");
				this.__listeners__[eventName] = [];
			}
			var listeners = this.__listeners__[eventName];
			raiseIf(this.listeners.length >= this.maxListeners,
				"Cannot have more than ", this.maxListeners, " listeners for event ", eventName, ".");
			times = (+times) || Infinity;
			listeners.push([callback, times]);
		}
	},

	/** Events.once(eventName, callback):
		Registers a callback to listen to the event only once.
	*/
	once: function once(eventName, callback) {
		return this.on(eventName, callback, 1);
	},

	/** Events.off(eventName, callback):
		Deregisters the callback from the event.
	*/
	off: function off(eventName, callback) {
		if (Array.isArray(eventName)) {
			var events = this;
			eventName.forEach(function (name) {
				events.off(name, callback, times);
			});
		} else if (this.__listeners__.hasOwnProperty(eventName)) {
			this.__listeners__[eventName] = this.__listeners__[eventName]
				.filter(function (listener) {
					return listener[0] !== callback;
				});
		}
	}
}); // declare Events.


/* Pseudorandom number generation algorithms and related functions.
*/
var Randomness = exports.Randomness = declare({
	/** new Randomness(generator):
		Pseudorandom number generator constructor, based on a generator 
		function. This is a function that is called without any parameters and 
		returns a random number between 0 (inclusive) and 1 (exclusive). If none 
		is given the standard Math.random() is used.
	*/
	constructor: function Randomness(generator) {
		this.__random__ = generator || Math.random;
	},

	/** Randomness.random(x, y):
		Called without arguments returns a random number in [0,1). Called with 
		only the first argument x, returns a random number in [0, x). Called 
		with both arguments return a random number in [x,y).
	*/
	random: function random() {
		var n = this.__random__();
		switch (arguments.length) {
			case 0: return n;
			case 1: return n * arguments[0];
			default: return (1 - n) * arguments[0] + n * arguments[1];
		}
	},

	/** Randomness.randomInt(x, y):
		Same as with Randomness.random(x,y) but returns integers instead.
	*/
	randomInt: function randomInt() {
		return Math.floor(this.random.apply(this, arguments));
	},

	/** Randomness.randomBool(p=0.5):
		Returns true with a probability of p, else false. By default p = 0.5 is assumed.
	*/
	randomBool: function randomBool(prob) {
		return this.random() < (isNaN(prob) ? 0.5 : +prob);
	},

	// Sequence handling ///////////////////////////////////////////////////////

	/** Randomness.randoms(n, x, y):
		Builds an array of n random numbers calling Randomness.random(x, y).
	*/
	randoms: function randoms(n) {
		var args = Array.prototype.slice.call(arguments, 1),
			result = [], i;
		n = +n;
		for (i = 0; i < n; i++) {
			result.push(this.random.apply(this, args));
		}
		return result;
	},

	/** Randomness.choice(xs):
		Randomnly selects an element from the iterable xs. If more than one is 
		given, the element is chosen from the argument list.
	*/
	choice: function choice(from) {
		from = arguments.length > 1 ? Array.prototype.slice.call(arguments) : 
			Array.isArray(from) ? from : 
			iterable(from).toArray();
		return from.length < 1 ? undefined : from[this.randomInt(from.length)];
	},

	/** Randomness.split(n, xs):
		Take n elements from xs randomnly. Returns an array [A,B] with A being
		the taken elements and B the remaining. If more than two arguments are 
		given, elements are taken from the second argument on.
	*/
	split: function split(n, from) {
		from = arguments.length > 2 ? Array.prototype.slice.call(arguments) : iterable(from).toArray();
		var r = [];
		for (n = Math.min(from.length, Math.max(+n, 0)); n > 0; n--) {
			r = r.concat(from.splice(this.randomInt(from.length), 1));
		}
		return [r, from];
	},

	/** Randomness.choices(n ,xs):
		Randomnly selects n elements from xs. If more than two arguments are 
		given, the arguments from 1 and on are considered as xs.
	*/
	choices: function choices(n, from) {
		return this.split.apply(this, arguments)[0];
	},

	/** Randomness.shuffle(xs):
		Randomnly rearranges elements in xs. Returns a copy.
	*/
	shuffle: function shuffle(elems) {
		//TODO This can be optimized by making random swaps.
		return this.choices(elems.length, elems);
	},

	/** Randomness.weightedChoices(n, weightedValues):
		Chooses n values from weighted values randomly, such that each value's 
		probability of being selected is proportional to its weight. The 
		weightedValues must be an iterable of pairs [weight, value]. 
		Weights are normalized, but if there are negative weights, the minimum 
		value has probability zero.
	*/
	weightedChoices: function weightedChoices(n, weightedValues) {
		var sum = 0.0, min = Infinity, length = 0, 
			result = [], r;
		iterable(weightedValues).forEach(function (weightedValue) {
			var weight = weightedValue[0];
			sum += weight;
			if (weight < min) {
				min = weight;
			}
			length++;
		});
		// Normalize weights.
		sum -= min * length;
		weightedValues = iterable(weightedValues).map(function (weightedValue) {
			return [(weightedValue[0] - min) / sum, weightedValue[1]]
		}).toArray();
		// Make selection.
		for (var i = 0; i < n && weightedValues.length > 0; i++) {
			r = this.random();
			for (var j = 0; j < weightedValues.length; j++) {
				r -= weightedValues[j][0];
				if (r <= 0) {
					result.push(weightedValues[j][1]);
					weightedValues.splice(j, 1); // Remove selected element.
					break;
				}
			}
			// Fallback when no element has been selected. Unprobable, but may happen due to rounding errors.
			if (result.length <= i) {
				result.push(weightedValues[0][1]);
				weightedValues.splice(0, 1);
			}
		}
		return result;
	},

	// Distributions ///////////////////////////////////////////////////////////

	/** Randomness.averagedDistribution(times):
		Returns another Randomness instance based on this one, but generating
		numbers by averaging its random values a given number of times. The 
		result is an aproximation to the normal distribution as times increases.
		By default times = 2 is assumed.
	*/
	averagedDistribution: function averagedDistribution(n) {
		n = Math.max(+n, 2);
		var randomFunc = this.__random__;
		return new Randomness(function () { 
			var s = 0.0;
			for (var i = 0; i < n; i++) {
				s += randomFunc();
			}
			return s / n;
		});
	}
}); // declare Randomness.

// DEFAULT generator ///////////////////////////////////////////////////////////

/** static Randomness.DEFAULT:
	Default static instance, provided for convenience. Uses Math.random().
*/
Randomness.DEFAULT = new Randomness();

['random', 'randomInt', 'randomBool', 'choice', 'split', 'choices', 'shuffle',
 'averagedDistribution'
].forEach(function (id) {
	Randomness[id] = Randomness.DEFAULT[id].bind(Randomness.DEFAULT);
});

// Algorithms //////////////////////////////////////////////////////////////////

	// Linear congruential /////////////////////////////////////////////////////

/** static Randomness.linearCongruential(m, a, c):
	Returns a pseudorandom number generator constructor implemented with the 
	linear congruential algorithm. 
	See <http://en.wikipedia.org/wiki/Linear_congruential_generator>.
*/
Randomness.linearCongruential = function linearCongruential(m, a, c) {
	return function (seed) {
		var i = seed || 0;
		return new Randomness(function () {
			return (i = (a * i + c) % m) / m;
		});
	};
};

/** static Randomness.linearCongruential.numericalRecipies(seed):
	Builds a linear congruential pseudorandom number generator as it is specified
	in Numerical Recipies. See <http://www.nr.com/>.
*/
Randomness.linearCongruential.numericalRecipies = 
	Randomness.linearCongruential(0xFFFFFFFF, 1664525, 1013904223);

/** static Randomness.linearCongruential.numericalRecipies(seed):
	Builds a linear congruential pseudorandom number generator as it used by
	Borland C/C++.
*/
Randomness.linearCongruential.borlandC = 
	Randomness.linearCongruential(0xFFFFFFFF, 22695477, 1);

/** static Randomness.linearCongruential.numericalRecipies(seed):
	Builds a linear congruential pseudorandom number generator as it used by
	glibc. See <http://www.mscs.dal.ca/~selinger/random/>.
*/
Randomness.linearCongruential.glibc = 
	Randomness.linearCongruential(0xFFFFFFFF, 1103515245, 12345);


/* Component to measure time and related functionality.
*/
var Chronometer = exports.Chronometer = declare({
	/** new Chronometer(time):
		Utility object for measuring time lapses.
	*/
	constructor: function Chronometer(t) {
		this.reset(t);
	},
	
	/** Chronometer.reset(time=now):
		Resets the chronometer's to the given time or now by default.
	*/
	reset: function reset(t) {
		return this.__timestamp__ = t || (new Date()).getTime();
	},

	/** Chronometer.time():
		Get the elapsed time since the creation or resetting of the chronometer.
	*/
	time: function time() {
		return (new Date()).getTime() - this.__timestamp__;
	},

	/** Chronometer.tick():
		Get the elapsed time since the creation or resetting of the chronometer,
		and resets it.
	*/
	tick: function tick() {
		var result = this.time()
		this.reset();
		return result;
	},

	/** Chronometer.chronometer(f, times=1):
		Executes the parameterless function f the given number of times and logs 
		the time each run takes. Returns the average time.
	*/
	chronometer: function chronometer(f, times) {
		times = times || 1;
		var total = 0.0;
		for (var i = 0; i < times; i++) {
			this.reset();
			f.call(this);
			total += this.time();
		}
		return total / times;
	}
}); // declare Chronometer.


/* Statistical accounting, measurements and related functions.
*/
// Statistic. //////////////////////////////////////////////////////////////////

function __getKeySet__(keys) {
	var result = {};
	if (typeof keys !== 'undefined' || keys !== null) {
		if (!Array.isArray(keys)) {
			if (typeof keys === 'object') {
				keys = Object.keys(keys);
			} else {
				keys = (keys +'').split(/\s+/);
			}
		}
		keys.forEach(function (key) {
			result[key +''] = true;
		});		
	}
	return result;
}

var Statistic = exports.Statistic = declare({
	/** new Statistic(keys):
		Statistical logger object, representing one numerical value.
	*/
	constructor: function Statistic(keys) {
		this.keys = __getKeySet__(keys);
		this.reset(); // At first all stats must be reset.
	},
	
	/** Statistic.reset():
		Resets the statistics, and returns this object for chaining.
	*/
	reset: function reset() {
		this.__count__ = 0; 
		this.__sum__ = 0.0; 
		this.__sqrSum__ = 0.0; 
		this.__min__ = Infinity;
		this.__max__ = -Infinity;
		this.__minData__ = undefined;
		this.__maxData__ = undefined;
		return this; // For chaining.
	},

	/** Statistic.add(value, data=none):
		Updates the statistics with the given value. Optionally data about 
		the instances can be attached.
	*/
	add: function add(value, data) {
		if (value === undefined) {
			value = 1;
		} else if (isNaN(value)) {
			raise("Statistics.add(): Value ", value, " cannot be added."); 
		}
		this.__count__ += 1;
		this.__sum__ += value;
		this.__sqrSum__ += value * value;
		if (this.__min__ > value) {
			this.__min__ = value;
			this.__minData__ = data;
		}
		if (this.__max__ < value) {
			this.__max__ = value;
			this.__maxData__ = data;
		}
		return this; // For chaining.
	},

	/** Statistic.DEFAULT_GAIN_FACTOR=0.99:
		Default factor used in the gain() method.
	*/
	DEFAULT_GAIN_FACTOR: 0.99,
	
	/** Statistic.gain(value, factor=DEFAULT_GAIN_FACTOR, data=none):
		Like add, but fades previous values by multiplying them by the given 
		factor. This is useful to implement schemes similar to exponential 
		moving averages.
	*/
	gain: function gain(value, factor, data) {
		factor = isNaN(factor) ? this.DEFAULT_GAIN_FACTOR : +factor;
		this.__count__ *= factor;
		this.__sum__ *= factor;
		this.__sqrSum__ *= factor;
		return this.add(value, data);
	},
	
	/** Statistic.addAll(values, data=none):
		Adds all the given values (using this.add()).
	*/
	addAll: function addAll(values, data) {	
		for (var i = 0; i < values.length; i++) {
			this.add(values[i], data);
		}
		return this; // For chaining.
	},
	
	/** Statistic.gainAll(values, factor=DEFAULT_GAIN_FACTOR, data=none):
		Gains all the given values (using this.gain()).
	*/
	gainAll: function gainAll(values, factor, data) {	
		for (var i = 0; i < values.length; i++) {
			this.gain(values[i], factor, data);
		}
		return this; // For chaining.
	},
	
	/** Statistic.applies(keys):
		Checks if all the given keys are this statistic's keys.
	*/
	applies: function applies(keys) {
		keys = __getKeySet__(keys);
		for (var key in keys) {
			if (!this.keys.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	},
	
	/** Statistic.count():
		Get the current count, or 0 if values have not been added.
	*/
	count: function count() {
		return this.__count__;
	},
	
	/** Statistic.sum():
		Get the current sum, or zero if values have not been added.
	*/
	sum: function sum() {
		return this.__sum__;
	},
	
	/** Statistic.squareSum():
		Get the current sum of squares, or zero if values have not been added.
	*/
	squareSum: function squareSum() {
		return this.__sqrSum__;
	},
	
	/** Statistic.minimum():
		Get the current minimum, or Infinity if values have not been added.
	*/
	minimum: function minimum() {
		return this.__min__;
	},
	
	/** Statistic.maximum():
		Get the current maximum, or -Infinity if values have not been added.
	*/
	maximum: function maximum() {
		return this.__max__;
	},
	
	/** Statistic.minData():
		Get the data associated with the current minimum, or undefined if there
		is not one.
	*/
	minData: function minData() {
		return this.__minData__;
	},
	
	/** Statistic.maxData():
		Get the data associated with the current maximum, or undefined if there
		is not one.
	*/
	maxData: function maxData() {
		return this.__maxData__;
	},

	/** Statistic.average():
		Calculates the current average, or zero if values have not been added.
	*/
	average: function average() {	
		var count = this.count();
		return count > 0 ? this.sum() / count : 0.0;
	},
	
	/** Statistic.variance(center=average):
		Calculates current variance, as the average squared difference of each
		element with the center, which is equal to the average by default.
		Returns zero if values have not been added.
	*/
	variance: function variance(center) {
		if (isNaN(center)) {
			center = this.average();
		}
		var count = this.count();
		return count > 0 ? center * center + (this.squareSum() - 2 * center * this.sum()) / count : 0.0;
	},

	/** Statistic.standardDeviation(center=average):
		Calculates current standard deviation, as the square root of the current
		variance.
	*/
	standardDeviation: function standardDeviation(center) {
		return Math.sqrt(this.variance(center));
	},
	
	/** Statistic.startTime(timestamp=now):
		Starts a chronometer for this statistic.
	*/
	startTime: function startTime(timestamp) {
		var chronometer = this.__chronometer__ || (this.__chronometer__ = new Chronometer());
		return chronometer.reset(timestamp);
	},
	
	/** Statistic.addTime(data=undefined):
		Adds to this statistic the time since startTime was called.
	*/
	addTime: function addTime(data) {
		raiseIf(!this.__chronometer__, "Statistic's chronometer has not been started.");
		return this.add(this.__chronometer__.time(), data);
	},

	/** Statistic.addTick(data=undefined):
		Adds to this statistic the time since startTime was called, and resets 
		the chronometer.
	*/
	addTick: function addTick(data) {
		raiseIf(!this.__chronometer__, "Statistic's chronometer has not been started.");
		return this.add(this.__chronometer__.tick(), data);
	},
	
	/** Statistic.addStatistic(stat):
		Adds the values in the given Statistic object to this one.
	*/
	addStatistic: function addStatistic(stat) {
		this.__count__ += stat.__count__; 
		this.__sum__ += stat.__sum__; 
		this.__sqrSum__ += stat.__sqrSum__;
		if (stat.__min__ < this.__min__) {
			this.__min__ = stat.__min__;
			this.__maxData__ = stat.__maxData__;
		}
		if (stat.__max__ > this.__max__) {
			this.__max__ = stat.__max__;
			this.__maxData__ = stat.__maxData__;
		}		
		return this;
	},
	
	/** Statistic.toString(sep='\t'):
		Prints statistic's id, count, minimum, average, maximum and standard 
		deviation, separated by tabs.
	*/
	toString: function toString(sep) {
		sep = ''+ (sep || '\t');
		return [Object.keys(this.keys).join(' '), this.count(), this.minimum(), this.average(), 
			this.maximum(), this.standardDeviation()].join(sep);
	}
}); // declare Statistic.
	
// Statistics. /////////////////////////////////////////////////////////////////
	
var Statistics = exports.Statistics = declare({
	/** new Statistics():
		Bundle of Statistic objects by name.
	*/
	constructor: function Statistics() {
		this.__stats__ = {};
	},
	
	/** Statistics.stats(keys):
		Get the Statistic objects that have at least one of the given keys.
	*/
	stats: function stats(keys) {
		return iterable(this.__stats__).map(function (keyVal) {
			return keyVal[1];
		}, function (stat) {
			return stat.applies(keys);
		}).toArray();
	},
	
	/** Statistics.stat(keys):
		Get the Statistic that applies to all the given keys, or create it if it 
		does not exist.
	*/
	stat: function stat(keys) {
		var id = JSON.stringify(__getKeySet__(keys));
		return this.__stats__[id] || (this.__stats__[id] = new Statistic(keys));
	},
	
	/** Statistics.reset(keys):
		Reset all the stats with one of the given keys.
	*/
	reset: function reset(keys) {
		this.stats(keys).forEach(function (stat) {
			stat.reset();
		});
		return this; // For chaining.
	},

	/** Statistics.add(keys, value, data):
		Shortcut method to add a value to the Statistic with the given keys.
	*/
	add: function add(keys, value, data) {
		return this.stat(keys).add(value, data);
	},
	
	/** Statistics.gain(keys, value, factor, data):
		Shortcut method to gain a value to the Statistic with the given keys.
	*/
	gain: function gain(keys, value, factor, data) {
		return this.stat(keys).gain(value, factor, data);
	},
	
	/** Statistics.addAll(keys, values, data):
		Shortcut method to add all values to the Statistic with the given keys.
	*/
	addAll: function addAll(keys, values, data) {
		return this.stat(keys).addAll(values, data);
	},
	
	/** Statistics.gainAll(keys, values, factor, data):
		Shortcut method to add all values to the Statistic with the given keys.
	*/
	gainAll: function gainAll(keys, values, factor, data) {
		return this.stat(keys).addAll(values, data);
	},

	/** Statistics.addObject(obj, data):
		Adds the values in the given object, one stat per member. If a member is
		an array, all numbers in the array are added.
	*/
	addObject: function addObject(obj, data) {
		raiseIf(!obj, "Cannot add object "+ JSON.stringify(obj) +".");
		for (var name in obj) {
			if (Array.isArray(obj[name])) {
				this.addAll(name, obj[name], data);
			} else {
				this.add(name, obj[name], data);
			}
		}
		return this; // For chaining.
	},
	
	/** Statistics.addStatistic(stat, keys=stat.keys):
		Adds the values in the given Statistic object to the one with the same
		keys in this object. If there is none one is created. This does not put
		the argument as an statistic of this object.
	*/
	addStatistic: function addStatistic(stat, keys) {
		return this.stat(typeof keys !== 'undefined' ? keys : stat.keys).addStatistic(stat);
	},
	
	/** Statistics.addStatistics(stats, keys=all):
		Combines the stats of the given Statistic object with this one's.
	*/
	addStatistics: function addStatistics(stats, keys) {
		var self = this;
		stats.stats(keys).forEach(function (stat) {
			self.stat(stat.keys).addStatistic(stat);
		})
		return this;
	},
	
	/** Statistic.accumulation(keys):
		Creates a new Statistic that accumulates all that apply to the given 
		keys.
	*/
	accumulation: function accumulation(keys) {
		var acc = new Statistic(keys);
		this.stats(keys).forEach(function (stat) {
			acc.addStatistic(stat);
		});
		return acc;
	},
	
	// Shortcut methods. ///////////////////////////////////////////////////////
	
	/** Statistics.count(keys):
		Shortcut method to get the count of the accumulation of the given keys.
	*/
	count: function count(keys) {
		return this.accumulation(keys).count();
	},
	
	/** Statistics.sum(keys):
		Shortcut method to get the sum of the accumulation of the given keys.
	*/
	sum: function sum(keys) {
		return this.accumulation(keys).sum();
	},
	
	/** Statistics.squareSum(keys):
		Shortcut method to get the sum of squares of the accumulation of the 
		given keys.
	*/
	squareSum: function squareSum(keys) {
		return this.accumulation(keys).squareSum();
	},
	
	/** Statistics.minimum(keys):
		Shortcut method to get the minimum value of the accumulation of the 
		given keys.
	*/
	minimum: function minimum(keys) {
		return this.accumulation(keys).minimum();
	},
	
	/** Statistics.maximum(keys):
		Shortcut method to get the maximum value of the accumulation of the 
		given keys.
	*/
	maximum: function maximum(keys) {
		return this.accumulation(keys).maximum();
	},
	
	/** Statistics.average(keys):
		Shortcut method to get the average value of the accumulation of the 
		given keys.
	*/
	average: function average(keys) {
		return this.accumulation(keys).average();
	},
	
	/** Statistics.variance(keys, center=average):
		Shortcut method to get the variance of the accumulation of the 
		given keys.
	*/
	variance: function variance(keys, center) {
		return this.accumulation(keys).variance(center);
	},
	
	/** Statistics.standardDeviation(keys, center=average):
		Shortcut method to get the standard deviation of the accumulation of the 
		given keys.
	*/
	standardDeviation: function standardDeviation(keys, center) {
		return this.accumulation(keys).standardDeviation(center);
	},
	
	/** Statistics.startTime(keys, timestamp=now):
		Shortcut method to start the timer of the Statistic with the given keys.
	*/
	startTime: function startTime(keys, timestamp) {
		return this.stat(keys).startTime(timestamp);
	},
	
	/** Statistics.addTime(keys, data=undefined):
		Shortcut method to add the time elapsed since the timer of the Statistic
		with the given keys was started.
	*/
	addTime: function addTime(keys, data) {
		return this.stat(keys).addTime(data);
	},
	
	/** Statistics.addTick(keys, data=undefined):
		Shortcut method to add the time elapsed since the timer of the Statistic
		with the given keys was started, and reset it.
	*/
	addTick: function addTick(keys, data) {
		return this.stat(keys).addTick(data);
	},
	
	/** Statistics.toString(fsep='\t', rsep='\n'):
		Formats all the statistics in a string.
	*/
	toString: function toString(fsep, rsep) {
		fsep = ''+ (fsep || '\t');
		rsep = ''+ (rsep || '\n');
		var stats = this.__stats__;
		return Object.keys(stats).map(function (name) {
			return stats[name].toString(fsep);
		}).join(rsep);
	}
}); // declare Statistics.


/* Simple logging.
*/
// Logger //////////////////////////////////////////////////////////////////////

var Logger = exports.Logger	= declare({
	/** new Logger(name, parent=Logger.ROOT, level="INFO"):
		Constructor of logger objects, which handle logging capabilities in a
		similar (but greatly simplified) fashion that Log4J.
	*/
	constructor: function Logger(name, parent, level) { 
		this.name = ''+ name;
		this.parent = parent || Logger.ROOT;
		this.level = level || "INFO";
		this.appenders = [];
	},
	
	/** Logger.LEVELS:
		Logging levels to use with Loggers: TRACE, DEBUG, INFO, WARN, ERROR and
		FATAL. The default one is INFO. Each one has a shortcut method (name in 
		lower case) to log directly in that level.
	*/
	LEVELS: {
		TRACE: -Infinity, DEBUG: -1, INFO: 0, WARN: 1, ERROR: 2, FATAL: Infinity,
		OK: 0, FAIL: 1, TODO: 1, FIXME: 1 // Utility levels.
	},
	
	/** Logger.log(level, message...):
		If the given level is greater than the current logger's level, a new
		entry is appended. The message results of a timestamp and the arguments.
	*/
	log: function log(level) {
		var passes = this.LEVELS[this.level] <= this.LEVELS[level];
		if (passes) {
			var logger = this,
				message = Array.prototype.slice.call(arguments, 1).join('');
			this.appenders.forEach(function (appender) {
				var format = appender.format || logger.defaultFormat;
				appender(format(logger.name, new Date(), level, message));
			});
			if (this.parent) {
				this.parent.log.apply(this.parent, arguments); // Forward to parent.
			}
		}
		return passes;
	},
	
	/** Logger.trace(message...):
		Make a new log entry with the given message and the TRACE level.
	*/
	trace: function trace() {
		return this.log("TRACE", Array.prototype.slice.call(arguments, 0).join(""));
	},
	
	/** Logger.debug(message...):
		Make a new log entry with the given message and the DEBUG level.
	*/
	debug: function debug() {
		return this.log("DEBUG", Array.prototype.slice.call(arguments, 0).join(""));
	},

	/** Logger.info(message...):
		Make a new log entry with the given message and the INFO level.
	*/
	info: function info() {
		return this.log("INFO", Array.prototype.slice.call(arguments, 0).join(""));
	},

	/** Logger.warn(message...):
		Make a new log entry with the given message and the WARN level.
	*/
	warn: function warn() {
		return this.log("WARN", Array.prototype.slice.call(arguments, 0).join(""));
	},
	
	/** Logger.error(message...):
		Make a new log entry with the given message and the ERROR level.
	*/
	error: function error() {
		return this.log("ERROR", Array.prototype.slice.call(arguments, 0).join(""));
	},

	/** Logger.fatal(message...):
		Make a new log entry with the given message and the FATAL level.
	*/
	fatal: function fatal() {
		return this.log("FATAL", Array.prototype.slice.call(arguments, 0).join(""));
	},
	
	/** Logger.defaultFormat(name, time, level, message):
		Formats are used by appenders. This default format concatenates the log
		entry data in a string.
	*/
	defaultFormat: function defaultFormat(name, time, level, message) {
		return [level, name, Text.formatDate(time, 'hhnnss.SSS'), message].join(' ');
	},
	
	/** Logger.htmlFormat(tag='pre', cssClassPrefix='log_'):
		Returns a format function similar to the default format, but in an HTML 
		element with CSS styling support.
	*/
	htmlFormat: function htmlFormat(tag, cssClassPrefix) {
		tag = tag || 'p';
		cssClassPrefix = cssClassPrefix || 'log_';
		return function (name, time, level, message) {
			return ['<', tag, ' class="', cssClassPrefix, level, '">', 
				'<span class="', cssClassPrefix, 'level">', level, '</span> ',
				'<span class="', cssClassPrefix, 'name">', name, '</span> ',
				'<span class="', cssClassPrefix, 'time">', Text.formatDate(time, 'hhnnss.SSS'), '</span> ',
				'<span class="', cssClassPrefix, 'message">', 
					Text.escapeXML(message).replace(/\n/g, '<br/>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;'), 
				'</span>',
				'</', tag, '>'].join('');
		};
	},
	
	/** Logger.appendToConsole():
		Appender that writes messages to console (using console.log).
	*/
	appendToConsole: (function () {
		function __consoleAppender__(entry) {
			console.log(entry);
		}
		return function appendToConsole() {
			this.appenders.push(__consoleAppender__);
			return __consoleAppender__;
		};
	})(),
	
	/** Logger.appendToFile(filePath, flags='a', encoding='utf-8'):
		Appender that writes the log entries to a file using NodeJS's file 
		system module.
	*/
	appendToFile: function appendToFile(filepath, flags, encoding) { // Node.js specific.
		filepath = filepath || './log'+ (new Date()).format('yyyymmdd-hhnnss') +'.log';
		flags = flags !== undefined ? flags : 'a';
		encoding = encoding !== undefined ? encoding : 'utf-8';
		var stream = require('fs').createWriteStream(filepath, {flags: flags, encoding: encoding});
		function fileAppender(entry) {
			stream.write(entry +'\n');
		}
		this.appenders.push(fileAppender);
		return fileAppender;
	},
	
	/** Logger.appendToHtml(htmlElement=document.body, maxEntries=all):
		Appender that writes the log entries as paragraphs inside the given 
		htmlElement. The number of entries can be limited with maxEntries.
		Warning! Formatted entry text is assumed to be valid HTML and hence is
		not escaped.
	*/
	appendToHtml: function appendToHtml(htmlElement, maxEntries, reversed) { // Browser specific.
		maxEntries = (+maxEntries) || Infinity;
		reversed = !!reversed;
		if (typeof htmlElement === 'string') {
			htmlElement =  document.getElementById(htmlElement);
		} else {
			htmlElement = htmlElement || document.getElementsByTagName('body')[0];
		}
		var entries = [];
		function htmlAppender(entry) {
			if (reversed) {
				entries.unshift(entry);
				while (entries.length > maxEntries) {
					entries.pop();
				}
			} else {
				entries.push(entry);
				while (entries.length > maxEntries) {
					entries.shift();
				}
			}
			htmlElement.innerHTML = entries.join('\n');
		}
		this.appenders.push(htmlAppender);
		return htmlAppender;
	},
	
	/** Logger.appendAsWorkerMessages(messageTag='log'):
		Appender that posts the log entries with the web workers postMessage()
		function.
	*/
	appendAsWorkerMessages: function appendAsWorkerMessages(messageTag) {
		messageTag = ''+ (messageTag || 'log');
		function postMessageAppender(entry) {
			var message = ({});
			message[messageTag] = entry;
			self.postMessage(JSON.stringify(message));
		}
		postMessageAppender.format = function format(name, time, level, message) {
			return {name: name, time: time, level: level, message: message};
		};
		this.appenders.push(postMessageAppender);
		return postMessageAppender;
	},
	
	/** Logger.stats():
		Gets the logger's Statistics objects, creating it if necessary.
	*/
	stats: function stats() {
		return this.__stats__ || (this.__stats__ = new Statistics());
	}
}); // declare Logger.	

/** static Logger.ROOT:
	The root logger must be the final ancestor of all loggers. It is the default 
	parent of the Logger constructor.
*/
Logger.ROOT = new Logger("");


/* Simple unit testing.
*/	
var Verifier = exports.Verifier = declare({
	/** new Verifier(logger=Logger.ROOT):
		Unit testing helper constructor.
	*/
	constructor: function Verifier(logger) {
		this.logger = logger || Logger.ROOT;
		this.tests = [];
	},
	
	/** Verifier.test(testName, testFunction):
		Adds the testFunction to this verifier. If testName is not defined, the  
		testFunction's name is used.
	*/
	test: function test(testName, testFunction) {
		raiseIf(typeof testFunction != 'function', 'Verifier.append() expects a function.');
		this.tests.push([testName || testFunction.name, testFunction]);
	},
	
	/** Verifier.failure(level, message):
		Builds the error instance raised by fail().
	*/
	failure: function failure(level, message) {
		var error = new Error(message);
		error.isFailure = true;
		error.level = level;
		return error;
	},
	
	/** Verifier.fail(message...):
		Raises an Error with a isFailure property in true.
	*/
	fail: function fail() {
		throw this.failure('FAIL', Array.prototype.slice.call(arguments).join(''));
	},
	
	__logFailure__: function __logFailure__(id, err, message) {
		var suffix = "\n\t"+ callStack(err).slice(0, 10).join('\n\t');
		if (err && err.isFailure) {
			this.logger.log(err.level, "Test ", id, " failed after ", chronometer.time(), "ms. Failure: ", err.message, suffix);
		} else {
			this.logger.error("Test ", id, " aborted after ", chronometer.time(), "ms. Error: ", err, suffix);
		}
	},
	
	/** Verifier.run():
		Runs the tests and logs the result.
	*/
	run: function run() {
		var verifier = this,
			chronometer = new Chronometer(), 
			successful = 0;
		function __logFail__(id, err) {
			var suffix = "\n\t"+ callStack(err).slice(0, 10).join('\n\t');
			if (err && err.isFailure) {
				verifier.logger.log(err.level, "Test ", id, " failed after ", chronometer.time(), "ms. Failure: ", err.message, suffix);
			} else {
				verifier.logger.error("Test ", id, " aborted after ", chronometer.time(), "ms. Error: ", err, suffix);
			}
		}
		return Future.sequence(this.tests, function (entry) { // Run the tests.
			var id = entry[0], test = entry[1];
			chronometer.reset();
			try {
				return Future.invoke(test, verifier).then(function (output) {
					verifier.logger.log("OK", id, " passed after ", chronometer.time(), "ms. ", output);
					successful++;
				}, __logFail__.bind(verifier, id));
			} catch (err) {
				__logFail__.call(verifier, id, err);
			}
		}).then(function () {
			verifier.logger.info("Finished: ", successful, "/", verifier.tests.length, " tests were successful.");
		});
	},
	
	/** Verifier.todo(message...):
		Specific kind of failure indicating there is something pending or 
		missing in the implementation of the test. 
	*/
	todo: function todo() {
		this.logger.log('TODO', Array.prototype.slice.call(arguments).join(''));
	},
	
	__assert__: function __assert__(condition, args, i) {
		if (!condition) {
			var msg = (args.length > i ? Array.prototype.slice.call(args, i) : Array.prototype.slice.call(arguments, 3)).join('');
			this.fail(msg);
		}
	},
	
	/** Verifier.assert(condition, message...):
		Checks the condition and if it is false raises a failure. 
	*/
	assert: function assert(condition) {
		this.__assert__(condition, arguments, 1, "Assertion failed!");
	},
	
	/** Verifier.assertFalse(condition, message...):
		Analogue of assert but negating the condition. 
	*/
	assertFalse: function assert(condition) {
		this.__assert__(!condition, arguments, 1, "Assertion failed!");
	},
	
	/** Verifier.assertSucceeds(f):
		Runs the f (as a parameterless function) and fails if it the execution
		throws any exception. If the execution succeeds, returns the result.
	*/
	assertSucceeds: function assertSucceeds(f) {
		try {
			return f.call(this);
		} catch (err) {
			return this.fail('Execution of ', f.name || '\n'+ f +'\n', ' should not have failed but it did! The error was: ', err);
		}
	},
	
	/** Verifier.assertFails(f, errorType=Error):
		Runs the f (as a parameterless function) and fails if it executes without 
		throwing any exceptions. If the execution fails, catches the error and 
		returns it.
	*/
	assertFails: function assertFails(f, errorType) {
		try {
			return f.call(this);
		} catch (err) {
			if (errorType && !(err instanceof errorType)) {
				this.fail('Execution of \n', f.name || '\n'+ f +'\n', '\n should have failed with an error of type ', errorType, ' but raised ', err, '.');
			}
			return err;
		}
		return this.fail('Execution of \n', f.name || '\n'+ f +'\n', '\n should have failed but it did not!');
	},

	/** Verifier.assertNull(obj, msg...):
		Asserts that the object is null.
	*/	
	assertNull: function assertNull(obj) {
		this.__assert__(obj === null, arguments, 1,
			"Object ", obj, " should be null.");
	},
	
	/** Verifier.assertNotNull(obj, msg...):
		Asserts that the object is not null.
	*/
	assertNotNull: function assertNotNull(obj) {
		this.__assert__(obj !== null, arguments, 1,
			"Object ", obj, " should not be null.");
	},
		
	/** Verifier.assertUndefined(obj, msg...):
		Asserts that the object is undefined.
	*/
	assertUndefined: function (obj) {
		this.__assert__(obj === undefined, arguments, 1,
			"Object ", obj, " should be undefined.");
	},
	
	/** Verifier.assertDefined(obj, msg...):
		Asserts that the object is not undefined.
	*/
	assertDefined: function assertDefined(obj) {
		this.__assert__(obj !== undefined, arguments, 1,
			"Object ", obj, " should be defined.");
	},
	
	/** Verifier.assertEqual(expected, obtained, msg...):
		Asserts that both values are equal (==).
	*/
	assertEqual: function assertEqual(expected, obtained) {
		this.__assert__(expected == obtained, arguments, 2,
			"Value ", obtained, " should be equal (==) to ", expected, ".");
	},

	/** Verifier.assertNotEqual(expected, obtained, msg...):
		Asserts that both objects are not equal (!=).
	*/
	assertNotEqual: function assertNotEqual(expected, obtained) {
		this.__assert__(expected != obtained, arguments, 2,
			"Value ", obtained, " should not be equal (!=) to ", expected, ".");
	},
	
	/** Verifier.assertSame(expected, obtained, msg...):
		Asserts that both values are the same value (===).
	*/
	assertSame: function assertSame(expected, obtained) {
		this.__assert__(expected === obtained, arguments, 2,
			"Value ", obtained, " should be the same (===) as ", expected, ".");
	},

	/** Verifier.assertNotSame(expected, obtained, msg...):
		Asserts that both objects are not the same value (!==).
	*/
	assertNotSame: function assertNotSame(expected, obtained) {
		this.__assert__(expected !== obtained, arguments, 2,
			"Value ", obtained, " should not be the same (!==) as ", expected, ".");
	},
	
	/** Verifier.EPSILON=2^(-32):
		Default threshold used in for numerical difference in some assert 
		methods (e.g. assertAlmostEqual).
	*/
	EPSILON: 1 / 0x10000000,
	
	/** Verifier.assertAlmostEqual(expected, obtained, threshold, msg...):
		Asserts that both numbers' difference is not greater than threshold.
	*/
	assertAlmostEqual: function assertAlmostEqual(expected, obtained, threshold) {
		threshold = isNaN(threshold) ? this.EPSILON : +threshold;
		this.__assert__(Math.abs(expected - obtained) <= threshold, arguments, 3, 
			"Value ", obtained, " should not be so different (up to ", threshold, ") of ", expected, ".");
	},
	
	/** Verifier.assertInstanceOf(constructor, object, msg...):
		Asserts that the object is instance of the constructor.
	*/
	assertInstanceOf: function assertInstanceOf(constructor, object) {
		this.__assert__(object instanceof constructor, arguments, 2, 
			"Object ", object, " should be an instance of ", constructor, ".");
	},
	
	/** Verifier.assertIsFunction(value, msg...):
		Asserts that the value is a function.
	*/
	assertIsFunction: function assertIsFunction(value) {
		this.__assert__(typeof value === 'function', arguments, 1,
			"Value ", value," is not a function.");
	},
	
	/** Verifier.assertIsArray(expected, obtained, msg...):
		Asserts the obtained value is an array with equal elements to expected.
	*/
	assertIsArray: function assertIsArray(expected, obtained) {
		this.__assert__(Array.isArray(expected), arguments, 2, "Expected value is not an Array.");
		this.__assert__(Array.isArray(obtained), arguments, 2, JSON.stringify(obtained), " is not an Array.");
		this.__assert__(expected.length === obtained.length, arguments, 2,
			"Expected an array of ", expected.length, " elements, instead of ", obtained.length, " elements.");
		for (var i = 0; i < expected.length; i++) {
			this.__assert__(expected[i] == obtained[i], arguments, 2, 
				"Value ", obtained[i], " at ", i, " should be equal (==) to ", expected[i], ".");
		}		
	}
}); // declare Verifier.
return exports;
});