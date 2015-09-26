/** Package wrapper and layout.
*/
(function (global, init) { "use strict"; // Universal Module Definition. See <https://github.com/umdjs/umd>.
	if (typeof define === 'function' && define.amd) {
		define(['sermat'], init); // AMD module.
	} else if (typeof exports === 'object' && module.exports) {
		module.exports = init(require('sermat')); // CommonJS module.
	} else { // Browser or web worker (probably).
		global.base = init(global.Sermat);
	}
})(this, function __init__(Sermat) { "use strict";
// Library layout. /////////////////////////////////////////////////////////////////////////////////
	var exports = {
		__package__: 'creatartis-base',
		__name__: 'base',
		__init__: __init__,
		__dependencies__: [],
		__SERMAT__: { include: [] }
	};

/** # Core

Generic algorithms and utility definitions.
*/

/** Depending on the execution environment the global scope may be different: `window` in browsers,
`global` under NodeJS, `self` in web workers, etc. `global` holds a reference to this 
object.
*/
var global = exports.global = (function () {
	var f = Function;
	return f('return this;')();
})();

/** `raise(message...)` builds a new instance of Error with the concatenation of the arguments as 
its message and throws it.
*/
var raise = exports.raise = function raise() {
	throw new Error(Array.prototype.slice.call(arguments, 0).join(''));
};

/** `raiseIf(condition, message...)` does the same as `raise` if `condition` is true.
*/
var raiseIf = exports.raiseIf = function raiseIf(condition) {
	if (condition) {
		raise.apply(this, Array.prototype.slice.call(arguments, 1));
	}
};

/** Browsers and different environments have different ways to obtain the current call stack. 
`callStack(error=none)` unifies these. Returns an array with the callstack of error or (if missing)
a new one is used, hence returning the current callStack.
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

/** Javascript object literals (as of ES5) cannot be built with expressions as keys. 
`obj(key, value...)` is an object constructor based on key-value pairs.
*/
var obj = exports.obj = function obj() {
	var result = ({});
	for (var i = 0; i < arguments.length; i += 2) {
		result[arguments[i] +''] = arguments[i+1];
	}
	return result;
};

/** `copy(objTo, objFrom...)` copies all own properties of the given objects missing in `objTo` to 
it, and returns `objTo`. If only one object is given, a copy of the `objTo` object is returned.
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

/** # Polyfill

This part of the library contains all code meant to equalize Javascript 
execution environments, to provide some sort of forward compatibility.
*/ 

/** Some versions of Opera and Internet Explorer do not support 
[Function.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
*/
if (!Function.prototype.bind) {
	Function.prototype.bind = function bind(_this) {
		if (typeof this !== "function") {
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}
		if (arguments.length < 1) {
			return this;
		}
		var args = Array.prototype.slice.call(arguments, 1), 
			fToBind = this,
			F_NOP = function () {},
			fBound = function () {
				return fToBind.apply(_this, args.concat(Array.prototype.slice.call(arguments)));
			};
		F_NOP.prototype = this.prototype;
		fBound.prototype = new F_NOP();
		return fBound;
	};
}

/** [String.repeat](http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat)
concatenates a string a given amount of times.
*/
if (!String.prototype.repeat) {
	String.prototype.repeat = function repeat(n) {
		n = n | 0;
		return n <= 0 ? "" : n & 1 ? this + this.repeat(n - 1) : (this + this).repeat(n >> 1);
	};
}


/** # Objects
	
OOP related functions and definitions.
*/
var objects = exports.objects = (function () {
	/** Extending a constructor implies assigning as the subconstructor 
	prototype an instance of the parent constructor. If no constructor is given,
	a new one is used.
	*/
	var subconstructor = this.subconstructor = function subconstructor(parent, constructor) {
		var proto, Placeholder;
		if (typeof constructor !== 'function') { // If no constructor is given ...
			constructor = (function () { // ... provide a default constructor.
				parent.apply(this, arguments);
			});
		}
		constructor.prototype = Object.create(parent.prototype);
		constructor.prototype.constructor = constructor;
		/** The constructor function's prototype is changed so static properties are inherited
		as well.
		*/
		if (Object.setPrototypeOf) {
			Object.setPrototypeOf(constructor, parent);
		} else {
			constructor.__proto__ = parent;
		}
		return constructor;
	};
	
	/** `objects.addMember(constructor, key, value, force=false)` adds `value`
	as a member of the constructor's prototype. If it already has a member with 
	the `key`, it is overriden only if `force` is true.
	
	The `key` may include modifiers for the member before the actual name and 
	separated by whitespace. The implemented modifiers are:
	
	+ `static`: Adds the member to the constructor.
	+ `property`: Treats the `value` as a property descriptor to use with 
		`Object.defineProperty()`.
	+ `const`: Adds the member as readonly. This also uses 
		`Object.defineProperty()`, with a setter that throws an error.
	*/
	var addMember = this.addMember = function addMember(constructor, key, value, force) {
		var modifiers = key.split(/\s+/), scopes;
		key = modifiers.pop();
		if (modifiers.indexOf('dual') >= 0) {
			scopes = [constructor, constructor.prototype];
		} else if (modifiers.indexOf('static') >= 0) {
			scopes = [constructor];
		} else {
			scopes = [constructor.prototype];
		}
		scopes.forEach(function (scope) {
			if (force || typeof scope[key] === 'undefined') {
				if (modifiers.indexOf('property') >= 0) {
					return Object.defineProperty(scope, key, value);
				} else if (modifiers.indexOf('const') >= 0) {
					return Object.defineProperty(scope, key, { 
						get: function () { return value; },
						set: function () { throw new Error(key +" is readonly!"); },
						enumerable: true, 
						configurable: false 
					});
				} else {
					return scope[key] = value;
				}
			}
		});
	};
	
	/** `objects.addMembers(constructor, members, force=false)` adds all own 
	properties of members to the constructor's prototype, using 
	`objects.addMember`.
	*/
	var addMembers = this.addMembers = function addMembers(constructor, members, force) {
		Object.keys(members).map(function (id) {
			addMember(constructor, id, members[id], force);
		});
	};
	
	/** The function `objects.declare(supers..., members={})` implements 
	creatartis-base's object oriented implementation, influenced by 
	[Dojo's](http://dojotoolkit.org/reference-guide/1.9/dojo/_base/declare.html). 
	The first super is considered the parent. The following supers add to the
	returned constructor's prototype, but do not override. The given members 
	always override.
	*/
	var declare = exports.declare = this.declare = function declare() {
		var args = Array.prototype.slice.call(arguments),
			parent = args.length > 1 ? args.shift() : Object,
			members = args.length > 0 ? args.pop() : {},
			constructor = subconstructor(parent, members.hasOwnProperty('constructor') ? members.constructor : undefined), //WARN ({}).constructor == Object.
			initializer = members[''];
		Object.keys(members).map(function (id) {
			if (id !== '' && id !== 'constructor') {
				addMember(constructor, id, members[id], true);
			}
		});
		args.forEach(function (members) {
			if (typeof members === 'function') {
				members = members.prototype;
			}
			addMembers(constructor, members, false);
		});
		if (typeof initializer === 'function') {
			initializer.apply(constructor);
		}
		return constructor;
	};

	/** Abstract methods can be quickly defined with 
	`objects.unimplemented(cls, id)`. It returns a function that raises an 
	"unimplemented method" exception. This is recommended, for better debugging.
	*/
	var unimplemented = this.unimplemented = function unimplemented(cls, id) {
		return function () {
			throw new Error((cls || this.constructor.name) +"."+ id +" not implemented! Please override.");
		};
	};
	
	return this;
}).call({}); //// objects.

// `objects.declare` is also available through `creatartis_base.declare`.
var declare = objects.declare;

/** # Text

Text manipulation functions and definitions.
*/
var XML_ENTITIES = { 
		'<': '&lt;', 
		'>': '&gt;', 
		'&': '&amp;', 
		'"': '&quot;', 
		"'": '&apos;' 
	},
	Text = exports.Text = declare({
	/** Text is similar to Java's [`StringBuilder`](http://docs.oracle.com/javase/7/docs/api/java/lang/StringBuilder.html), 
	but with extended formatting features.
	*/
	constructor: function Text() {
		this.clear();
	},
	
	/** `clear()` empties the text buffer, but returns the previous content.
	*/
	clear: function clear() {
		var text = this.text;
		this.text = '';
		return text;
	},
	
	/** `add(...strings)` concatenates all arguments conversions to string to the buffer.
	*/
	add: function add() {
		for (var i = 0; i < arguments.length; i++) {
			this.text += arguments[i];
		}
	},
	
	/** The default conversion to string returns the content of the buffer.
	*/
	toString: function toString() {
		return this.text;
	},
	
	// ## Formatting, encoding and decoding ########################################################
	
	// ### XML (and HTML for most intends and purposes) ############################################
	
	/** `escapeXML(str)` returns the string with XML reserved characters replaced by the 
	corresponding character entities.
	*/
	escapeXML: function escapeXML(str) {
		var XML_ENTITIES = this.XML_ENTITIES;
		return (str +'').replace(/[&<>"']/g, function (c) {
			return XML_ENTITIES[c];
		});
	},
	
	/** The XML character entities are defined in `XML_ENTITIES`:
	*/
	XML_ENTITIES: XML_ENTITIES,
	'static XML_ENTITIES': XML_ENTITIES,

	/** `addXML(...str)` appends all arguments string conversions after applying `escapeXML()`.
	*/
	addXML: function addXML() {
		for (var i = 0; i < arguments.length; i++) {
			this.text += this.escapeXML(arguments[i]);
		}
	},
	
	// ### Regular expressions #####################################################################
	
	/** `escapeRegExp(str)` returns the `str` string with the reserved characters of regular 
	expressions escaped with `'\'`.
	*/
	escapeRegExp: function escapeRegExp(str) {
		return (str +'').replace(/[\-\[\]{}()*+?.^$\\]/g, '\\$&');
	},
	
	// ### Dates ###################################################################################
	
	/** `formatDate(date=now, format=Date.toString, useUTC=false)` formats a Date. The `format` 
	string  may use `y` for year, `m` for month, `d` for day (in month), `h` for hour (24), `H` for
	hour (am/pm), `n` for minutes, `s` for seconds, `S` for milliseconds, and `a` or `A` for am/pm.
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
				case '"': return match.substr(1, match.length-2);
				default: return match;
				}
			});
	},
	
	/** `addDate(date=now, format=Date.toString, useUTC=false)` appends the `date` formatted using
	`formatDate()`.
	*/
	addDate: function addDate(date, format, useUTC) {
		this.text += this.formatDate(date, format, useUTC);
	},
	
	// ## _Static_ members #########################################################################
	
	/** `lpad(str, len, pad=' ')` returns a copy of the `str` string padded with `pad` (or space by 
	default) to the left upto `len` length.
	*/
	'static lpad': function lpad(str, len, pad) {
		if (isNaN(len) || str.length >= len) {
			return str;
		} else {
			pad = (pad || ' ') +'';
			return (pad.repeat((len - str.length) / pad.length + 1) + str).substr(-len);
		}
	},

	/** `rpad(str, len, pad=' ')` returns a copy of the `str` string padded with `pad` (or space by 
	default) to the right upto `len` length.
	*/
	'static rpad': function rpad(str, len, pad) {
		if (isNaN(len) || str.length >= len) {
			return str;
		} else {
			pad = (pad || ' ') +'';
			return (str + pad.repeat((len - str.length) / pad.length + 1)).substr(0, len);
		}
	},
	
	/** `hashCode(str)` calculates a hash number for the given string.
	*/
	'static hashCode': function hashCode(str) {
		var result = 0,
			len = str.length;
		for (var i = 0; i < len; ++i) { 
			result = (result * 31 + str.charCodeAt(i)) & 0x7FFFFFFF;
		}
		return result;
	}
}); // declare Text.

Text.escapeXML = Text.prototype.escapeXML;
Text.escapeRegExp = Text.prototype.escapeRegExp;
Text.formatDate = Text.prototype.formatDate;


/** # Math

Mathematical and numerical functions and utilities.
*/
var math = exports.math = {};

// ## Conditionals #################################################################################

/** Clamps forces a `value` to be between `min` and `max`.
*/
math.clamp = function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
};

/** A simple function to calculate the sign of a number. See [Math.sign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign).
*/
math.sign = function sign(x) {
	x = +x;
	return (x === 0 || isNaN(x)) ? x : x > 0 ? 1 : -1;
};

// ## Combinatorics ################################################################################

/** The `factorial` functions needs little introduction. It receives `n` and returns `n!`. Argument
`b` can be used to stop the recursion before zero, which is useful to calculate `n!/b!` efficiently.
*/
var factorial = math.factorial = function factorial(n, b) {
	n = n|0;
	b = Math.max(0, b|0);
	if (n < 0) {
		return NaN;
	} else {
		for (var f = 1; n > b; --n) {
			f *= n;
		}
		return f;
	}
};

/** The `combinations` of selecting `k` elements from a set of `n`, not mattering in which order. It
is calculated as `n!/k!/(n-k)!`.
*/
math.combinations = function combinations(n, k) {
	return factorial(n, k) / factorial(n - k);
};

// ## Probability ##################################################################################

/** The probability density function (or PDF) of the normal (or gaussian) distribution. The 
parameters `mean` and `variance` default to the standard normal (i.e `mean=0` and `variance=1`).
*/
math.gauss_pdf = function gauss_pdf(value, mean, variance) {
	mean = isNaN(mean) ? 0 : +mean;
	variance = isNaN(variance) ? 1 : +variance;
	var standardDeviation = Math.sqrt(variance);

    return Math.exp(-Math.pow(x - mean, 2) / (2 * variance)) / 
		standardDeviation * Math.sqrt(2 * Math.PI);
};

/** Complementary error function routine based on Chebyshev fitting as explained in 
[Numerical Recipes in C (2nd edition)](http://www.nr.com/), with fractional error everywhere less 
than 1.2e-7.
*/
math.gauss_erfc = function gauss_erfc(value) {
	var z = Math.abs(value),
		t = 1.0 / (1.0 + 0.5 * z),
		ans = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 +
			t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + 
			t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return value >= 0.0 ? ans : 2.0 - ans;
};

/** The cumulative density function (or CDF) of the normal (or gaussian) distribution. The 
parameters `mean` and `variance` default to the standard normal (i.e `mean=0` and `variance=1`).
*/
math.gauss_cdf = function gauss_cdf(value, mean, variance) {
	mean = isNaN(mean) ? 0 : +mean;
	variance = isNaN(variance) ? 1 : +variance;
	var standardDeviation = Math.sqrt(variance);
	
	return math.gauss_erfc(-(value - mean) / (standardDeviation * Math.sqrt(2))) / 2;
};


/** # Typed

Functions and definitions regarding type checking, constraints,	validation and 
coercion.
*/

// ## Type representations #####################################################

/** `Type` is a representation of a datatype. It has three main methods:
*/
var Type = exports.Type = declare({
	constructor: function Type(defs) {
		defs = defs || {};
		if (typeof defs.isType === 'function') {
			this.isType = defs.isType;
		}
		if (typeof defs.isCompatible === 'function') {
			this.isCompatible = defs.isCompatible;
		}
		if (typeof defs.coerce === 'function') {
			this.coerce = defs.coerce;
		}
		if (typeof defs.toString === 'string') {
			var typeString = defs.toString;
			this.toString = function toString() {
				return typeString;
			};
		}
	},

	/** `isType(value)` decides whether `value` is a member of this type or not.
	This must be overriden, since the default implementation always returns 
	false.
	*/
	isType: function isType(value) {
		return false;
	},
	
	/** `isCompatible(value)` decides whether `value` is assignment compatible 
	or not with this type. By default the only compatible values are the ones in
	the type itself. But it can be overriden to allow subtypes and coercions.
	*/
	isCompatible: function isCompatible(value) {
		return this.isType(value);
	},

	/** `coerce(value)` converts `value` to this type, if possible and 
	necessary. If it is not possible, it raises a `TypeError`. This is the 
	default behaviour.
	*/
	coerce: function coerce(value) {
		throw this.incompatibleError(value);
	},
	
	/** `incompatibleError(value)` builds an Error with a message for values 
	incompatible with this type.
	*/
	incompatibleError: function incompatibleError(value) {
		return new TypeError("Value "+ value +" is not compatible with type "+ this +".");
	}
});

var types = exports.types = {};

// ### Javascript primitive types ##############################################

/** `types.BOOLEAN` represents the Javascript boolean type. Everything is 
compatible with it and the standard conversion is used (`!!value`). 
*/
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

/** `types.NUMBER` represents the Javascript number type. Everything is 
compatible with it and the standard conversion is used (`+value`).
*/
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

/** `types.STRING` represents the Javascript string type. Everything is 
compatible with it and the standard conversion is used (`'' + value`).
*/
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

/** `types.FUNCTION` represents the Javascript function type. Only functions are 
compatible with it and there is no conversion.
*/
types.FUNCTION = new Type({
	isType: function isType(value) {
		return typeof value === 'function' || 
			value !== undefined && value !== null && value.constructor === Function;
	},
	toString: "function"
});

// ### Simple types ############################################################

/** `types.INTEGER` represents an integer numerical type. All numbers are
compatible with it, and the conversion truncates the value (`+value | 0`).
*/
types.INTEGER = new Type({
	isType: function isType(value) {
		return (value | 0) === value;
	},
	isCompatible: function isCompatible(value) {
		return !isNaN(value);
	},
	coerce: function coerce(value) {
		return +value | 0;
	},
	toString: "integer"
});

/** `types.CHARACTER` represents a character type. All values that convert to a
non empty string are compatible with it. The conversion takes the first caracter
of the string conversion.
*/
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

// ### Object types ############################################################

/** `types.OBJECT` is a basic object type (no constructor or member 
constraints). Only functions are incompatible with it, and the conversion simply
calls `Object(value)`.
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

/** `types.ObjectType(defs)` defines an object type with a constructor function 
and/or a set of members, each defined by an id and a type.
*/
var ObjectType = types.ObjectType = declare(Type, {
	constructor: function ObjectType(defs) {
		Type.call(this, {});
		if (defs.hasOwnProperty("constructor") && typeof def.constructor === 'function') {
			this.instanceOf = defs.constructor;
			delete defs.constructor;
		} else {
			this.instanceOf = null;
		}
		this.members = defs.members || {};
	},
	
	/** A value is a member of an `ObjectType` if it is an object, an instance 
	of the specified constructor for this type (if applies), and if it has the
	specified members for this type (if any).
	*/
	isType: function isType(value) {
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
	},

	/** A value is compatible of an `ObjectType` if it is an object of the 
	specified constructor (if any), and if it has members compatible with the 
	ones in the type (if specified). This may be overriden to allow subtypes and 
	coercions.
	*/
	isCompatible: function isCompatible(value) {
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
	},

	/** A value is coerced to an `ObjectType` by calling the type's constructor
	with the value and adding conversions of the type's members.
	*/
	coerce: function coerce(value) { 
		var result = this.instanceOf ? new this.instanceOf(value) : {};
		for (var member in this.members) {
			result[member] = this.members[member].coerce(value[member]);
		}
		return result;
	}	
}); // declare ObjectType

// ### Array types #############################################################

/** `types.ARRAY` represents a basic array type (no length or element type 
constraints).
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

/** `types.ArrayType(elementTypes, length)` defines a type for arrays of a given 
length and all elements of the given type.
*/
var ArrayType = types.ArrayType = declare({
	constructor: function ArrayType(elementTypes, length) {
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
	},

	isType: function isType(value) {
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
	},

	isCompatible: function isCompatible(value) {
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
	},

	coerce: function coerce(value) {
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
	}
}); // declare ArrayType


/** ## Initializer

Initializers are object builders, allowing the declaration of default values, 
type checks and coercions, and other checks.
*/

var Initializer = exports.Initializer = declare({
	/** An initializer modifies a `subject` taking values from `args`. All by
	default are new empty objects.
	*/
	constructor: function Initializer(subject, args) {
		this.subject = subject || {};
		this.args = args || {};
	},

	/** `get(id, options)` gets the value for `id`. If it is missing, 
	`options.defaultValue` is used as the default value if defined. Else an 
	error is raised.
	
	If `options.type` is defined, the value is checked to be a member of said
	type. If `options.coerce` is true, the value may be coerced to said type. 
	The `option.check` function can be defined to check the value further. It 
	will be called with the value, and is expected to raise errors on failed 
	conditions.
	
	Other options include:
	
	+ `options.regexp`: the value is matched agains a regular expression.
	
	+ `options.minimum`: the value has to be greater than or equal to this value.
	
	+ `options.maximum`: the value has to be less than or equal to this value.
	*/
	get: function get(id, options) {
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
		type = options.type; // Check type if defined.
		if (type && !type.isType(value)) {
			if (!options.coerce) {
				throw new Error(options.typeMismatchError || "Value for <"+ id +"> must be a "+ type +"!");
			}
			value = type.coerce(value);
		}
		if (options.regexp && !options.regexp.exec(value)) { // Check further constraints.
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
	},

	/** `attr(id, options={})` assigns the `id` property, performing all 
	necessary verifications. If the subject already has the attribute defined
	and `options.overwrite` is false, an error is raised. Any error is ignored
	and the assignment is skipped if `options.ignore` is true.
	*/
	attr: function attr(id, options) {
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
	},

	/** ## Shortcuts ###########################################################
	
	The following methods simplify the definitions of properties using `attr()`:
	*/

	/** + `bool(id, options)` assigns the `id` property with a truth value.
	*/
	bool: function bool(id, options) {
		options = options || {};
		options.type = types.BOOLEAN;
		return this.attr(id, options);
	},

	/** + `string(id, options)` assigns the `id` property with a string.
	*/
	string: function string(id, options) {
		options = options || {};
		options.type = types.STRING;
		return this.attr(id, options);
	},

	/** + `number(id, options)` assigns the `id` property with a numerical value.
	*/
	number: function number(id, options) {
		options = options || {};
		options.type = types.NUMBER;
		return this.attr(id, options);
	},

	/** + `integer(id, options)` assigns the `id` property with an integer.
	*/
	integer: function integer(id, options) {
		options = options || {};
		options.type = types.INTEGER;
		return this.attr(id, options);
	},

	/** + `func(id, options)` assigns the `id` property with a function.
	*/
	func: function func(id, options) {
		options = options || {};
		options.type = types.FUNCTION;
		return this.attr(id, options);
	},

	/** + `array(id, options)` assigns the `id` property with an array. Options 
	may include:
		* `options.elementTypes`: Required type of the array's elements.
		* `options.length`: Required length of the array.
	*/
	array: function array(id, options) {
		options = options || {};
		if (options.hasOwnProperty('length') || options.hasOwnProperty('elementType')) {
			options.type = new types.ArrayType(options.elementType, options.length);
		} else {
			options.type = types.ARRAY;
		}
		return this.attr(id, options);
	},

	/** + `object(id, options)` assigns the `id` property with an object.
	*/
	object: function object(id, options) {
		options = options || {};
		options.type = types.OBJECT;
		return this.attr(id, options);
	}
}); // declare Initializer.

/** `initialize(subject, args)` returns a new Initializer for the subject.
*/
var initialize = exports.initialize = function initialize(subject, args) {
	return new Initializer(subject, args);
};


/** # Iterables
 
Standard implementation of iterables and iterators (a.k.a. enumerations or sequences), and many 
functions that can be built with it. This implementation is inspired in the Python iterables. An 
iterable is an object with a method `__iter__()` which returns an iterator function. An iterator 
function returns the next element in the sequence, or raises `STOP_ITERATION` if the sequence has 
ended. 
*/
var STOP_ITERATION = new Error('Sequence has ended.');

var Iterable = exports.Iterable = declare({
	/** The Iterable constructor builds different types of sequences depending on the given object. 
	It supports strings (iterating over each character), arrays, objects (key-value pairs) and 
	functions (assuming it is the iterator maker). A value of `null` or `undefined` is not allowed. 
	Everything else is assumed to be the only value of a singleton sequence. If the object has an 
	`__iter__` method it is assumed to be an Iterable already. In this case a copy of that Iterable 
	is built.
	*/
	constructor: function Iterable(obj) {
		if (obj === null || obj === undefined) {
			throw new Error('Iterable source is null or undefined.');
		} else if (typeof obj === 'function') {
			this.__iter__ = obj;
		} else if (typeof obj === 'string') {
			this.__iter__ = Iterable.__iteratorFromString__(obj);
		} else if (Array.isArray(obj)) {
			this.__iter__ = Iterable.__iteratorFromArray__(obj);
		} else if (typeof obj === 'object') {
			if (typeof obj.__iter__ === 'function') {
				this.__iter__ = obj.__iter__.bind(obj);
			} else {
				this.__iter__ = Iterable.__iteratorFromObject__(obj);
			}
		} else {
			this.__iter__ = Iterable.__iteratorSingleton__(obj);
		}
	},
	
	/** `STOP_ITERATION` is the singleton error raised when an sequence	has finished. It is catched 
	by all Iterable's functions.
	*/
	"dual STOP_ITERATION": STOP_ITERATION,

	/** `stop()` raises the STOP_ITERATION exception. If used inside an iterator it breaks the 
	iteration.
	*/
	"dual stop": function stop() {
		throw STOP_ITERATION;
	},

	/** `catchStop(exception)` does nothing `exception` is `STOP_ITERATION`, but if it isn't the 
	exception is thrown.
	*/
	"dual catchStop": function catchStop(exception) {
		if (exception !== STOP_ITERATION) {
			throw exception;
		}
	},

	// ## Iterables from common datatypes ##########################################################

	/** `__iteratorFromArray__(array)` returns the `__iter__` function that builds the iterators of 
	iterables based on arrays.
	*/
	"static __iteratorFromArray__": function __iteratorFromArray__(array) {
		return function __iter__() {
			var i = 0, iterable = this;
			return function __arrayIterator__() {
				if (i < array.length) {
					return array[i++];
				} else {
					throw STOP_ITERATION;
				}
			};
		};
	},
	
	/** The iterables based on strings iterate character by character. `__iteratorFromString__(str)` 
	returns the `__iter__` function that builds iterators over the `str` string.
	*/
	"static __iteratorFromString__": function __iteratorFromString__(str) {
		return function __iter__() {
			var i = 0, iterable = this;
			return function __stringIterator__() {
				if (i < str.length) {
					return str.charAt(i++);
				} else {
					throw STOP_ITERATION;
				}
			};
		};
	},

	/** Iterables over objects iterate over pairs `[name, value]` for each property of the object. 
	`__iteratorFromObject__(obj)` return the `__iter__` function for these sequences.
	*/
	"static __iteratorFromObject__": function __iteratorFromObject__(obj) {
		return function __iter__() {
			var keys = Object.keys(obj), iterable = this;
			return function __objectIterator__() {
				if (keys.length > 0) {
					var k = keys.shift();
					return [k, obj[k]];
				} else {
					throw STOP_ITERATION;
				}
			};
		};
	},

	/** Singleton iterables have only one value in their sequence. Their `__iter__` function can be 
	obtained with `__iteratorSingleton__(x)`.
	*/
	"static __iteratorSingleton__": function __iteratorSingleton__(x) {
		return function __iter__() {
			var finished = false, iterable = this;
			return function __singletonIterator__() {
				if (!finished) {
					finished = true;
					return x;
				} else {
					throw STOP_ITERATION;
				}
			};
		};
	},
	
	// ## Sequence predicates ######################################################################
	
	/** `isEmpty()` returns if the sequence has no elements.
	*/
	isEmpty: function isEmpty() {
		try {
			this.__iter__()();
			return false;
		} catch (err) {
			this.catchStop(err);
			return true;
		}
	},

	// ## Sequence information #####################################################################
	
	/** `count()` counts the number of elements in the sequence.
	*/
	count: function count() {
		var result = 0;
		this.forEach(function (x) {
			result++;
		});
		return result;
	},
	
	/** `length()` is just a synonym for `count()`.
	*/
	length: function length() { 
		return this.count();
	},
	
	/** `indexOf(value, from=0)` is analogous to the array's namesake method. Returns the first 
	position of the given `value`, or -1 if it is not found.
	*/
	indexOf: function indexOf(value, from) {
		from = from|0;
		var iter = this.__iter__(), x, i = 0;
		try { 
			for (x = iter(); true; x = iter(), ++i) {
				if (i >= from && x === value) {
					return i;
				}
			}
		} catch (err) {
			this.catchStop(err);
		}
		return -1;
	},
	
	/** `indexesOf(value, from=0)` is a sequence of the positions of the value in this iterable.
	*/
	indicesOf: function indexesOf(value, from) {
		from = from|0;
		return this.filter(function (v, i) {
			return i >= from && v === value;
		}, function (v, i) {
			return i;
		});
	},
	
	/** `indexWhere(condition, from=0)` returns the position of the first value of this iterable 
	that complies with the given `condition`, or -1 if there is none. 
	*/
	indexWhere: function indexWhere(condition, from) {
		from = from|0;
		var iter = this.__iter__(), x, i = 0;
		try { 
			for (x = iter(); true; x = iter(), ++i) {
				if (i >= from && condition(x, i)) {
					return i;
				}
			}
		} catch (err) {
			this.catchStop(err);
		}
		return -1;
	},
	
	/** `indexesWhere(condition, from=0)` is a sequence of the positions in this iterable of values
	that comply with the given `condition`.
	*/
	indicesWhere: function indexesWhere(condition, from) {
		from = from|0;
		return this.filter(function (v, i) {
			return i >= from && condition(v);
		}, function (v, i) {
			return i;
		});
	},
	
	// ## Iteration methods ########################################################################

	/** `forEach(doFunction, ifFunction)` applies `doFunction` to all elements complying with 
	`ifFunction`, and returns the last result. If no `ifFunction` is given, it iterates through all 
	the elements in the sequence. Both functions get the current value and position as arguments.
	*/
	forEach: function forEach(doFunction, ifFunction) {
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
	},
	
	/** `forEachApply(doFunction, ifFunction, _this)` is similar to `forEach` but instead of calling
	`doFunction`, it uses `apply`. It assumes the elements in the sequence are arrays of arguments 
	to pass to the functions.
	*/
	forEachApply: function forEachApply(doFunction, ifFunction, _this) {
		_this = _this || this;
		return this.forEach(function (args, i) {
			return doFunction.apply(_this, args.concat([i]));
		}, ifFunction);
	},
	
	/** `map(mapFunction, filterFunction)` returns an iterable iterating on the results of applying 
	`mapFunction` to each of this iterable elements. If `filterFunction` is given, only elements for
	which `filterFunction` returns true are considered.
	*/
	map: function map(mapFunction, filterFunction) {
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
	},

	/** `mapApply(mapFunction, filterFunction, _this)` is similar to `map` but instead of calling 
	`mapFunction`, it uses `apply`. It assumes the elements in the sequence are arrays of arguments 
	to pass to the functions.
	*/
	mapApply: function mapApply(mapFunction, filterFunction, _this) {
		_this = _this || this;
		return this.map(function (args, i) {
			return mapFunction.apply(_this, args.concat([i]));
		}, filterFunction);
	},
	
	/** `select(members)` is a shortcut for a map that extracts a member or members from the objects 
	in the sequence. If `members` is an object, then for each value in the sequence another object 
	is built with a selection for each key in the object. Arrays can also be built in a similar
	fashion.
	*/
	select: (function () {
		function __selection__(from, member) {
			if (Array.isArray(member)) {
				return member.map(__selection__.bind(null, from));
			} else if (typeof member === 'object') {
				var result = {};
				Object.keys(member).forEach(function (k) {
					result[k] = __selection__.call(null, from, member[k]);
				});
				return result;
			} else if (typeof member === 'function') {
				return member(from);
			} else {
				return from[member];
			}
		}
		return function select(members) {
			return this.map(function (obj) {
				return __selection__(obj, members);
			});
		};
	})(),
	
	// ## Sequence selection and filtering #########################################################
	
	/** `filter(filterFunction, mapFunction)` returns an iterable of this iterable elements for 
	which `filterFunction` returns true. If `mapFunction` is given it is applied before yielding the
	elements.
	*/
	filter: function filter(filterFunction, mapFunction) {
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
	},
	
	/** `filterApply(filterFunction, mapFunction, _this)` is similar to `filter` but instead of 
	calling the given functions, it uses `apply`. It assumes the elements in the sequence are arrays
	of arguments to pass to the functions.
	*/
	filterApply: function filterApply(filterFunction, mapFunction, _this) {
		_this = _this || this;
		return this.filter(function (args, i) {
			return filterFunction.apply(_this, args.concat([i]));
		}, mapFunction && function (args, i) {
			return mapFunction.apply(_this, args.concat([i]));
		});
	},
	
	/** `takeWhile(condition)` return an iterable with the first elements that verify the given 
	condition.
	*/
	takeWhile: function takeWhile(condition) {
		var from = this; // for closures.
		return new Iterable(function __iter__() {
			var iter = from.__iter__(),
				i = 0;
			return function __takeWhileIterator__() {
				if (i >= 0) {
					var x = iter();
					if (condition(x, i)) {
						i++;
						return x;
					} else {
						i = -Infinity;
					}
				}
				from.stop();
			};
		});
	},
	
	/** `take(n=1)` return an iterable with the first `n` elements of this one.
	*/
	take: function take(n) {
		n = isNaN(n) ? 1 : n | 0;
		return this.takeWhile(function (x, i) {
			return i < n;
		});
	},
	
	/** `dropWhile(condition)` returns an iterable with the same elements than this, except the 
	first ones that comply with the condition.
	*/
	dropWhile: function dropWhile(condition) {
		var from = this; // for closures.
		return new Iterable(function __iter__() {
			var iter = from.__iter__(),
				i = 0,
				dropping = true;
			return function __dropWhileIterator__() {
				var x;
				do {
					x = iter();
					dropping = dropping && condition(x, i);
					i++;
				} while (dropping);
				return x;
			};
		});
	},
	
	/** `drop(n=1)` returns an iterable with the same elements than this, except the first `n` ones.
	*/
	drop: function drop(n) {
		n = isNaN(n) ? 1 : n | 0;
		return this.dropWhile(function (x, i) {
			return i < n;
		});
	},
	
	/** `head(defaultValue)` returns the first element. If the sequence is empty it returns 
	`defaultValue`, or raise an exception if one is not given.
	*/
	head: function head(defaultValue) {
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
	},
	
	/** `tail()` returns an iterable with the same elements than this, except the first one.
	*/
	tail: function tail() {
		var from = this; // for closures.
		return new Iterable(function __iter__() {
			var iter = from.__iter__();
			try {
				iter();
			} catch (err) {
				this.catchStop(err);
				throw new Error("Tried to get the tail of an empty Iterable.");
			}
			return iter;
		});
	},
	
	/** `last(defaultValue)` returns the last element. If the sequence is empty it returns 
	`defaultValue`, or raise an exception if one is not given.
	*/
	last: function last(defaultValue) {
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
	},
	
	/** `init()` returns an iterable with the same elements than this, except the last one.
	*/
	init: function init() {
		var from = this; // for closures.
		return new Iterable(function __iter__() {
			var iter = from.__iter__(), last;
			try {
				last = iter();
			} catch (err) {
				this.catchStop(err);
				throw new Error("Tried to get the init of an empty Iterable.");
			}
			return function __mapIterator__() {
				var result = last;
				last = iter();
				return result;
			};
		});
	},
	
	/** `greater(evaluation)` returns an array with the elements of the iterable with greater 
	evaluation (or numerical conversion by default).
	*/
	greater: function greater(evaluation) {
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
	},

	/** `lesser(evaluation)` returns an array with the elements of the iterable with lesser 
	evaluation (or numerical conversion by default).
	*/
	lesser: function lesser(evaluation) {
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
	},

	/** `sample(n, random=Randomness.DEFAULT)` returns an iterable with `n` elements of this 
	iterable randomly selected. The order of the elements is maintained.
	*/
	sample: function sample(n, random) {
		n = n|0;
		if (n < 1) {
			return Iterable.EMPTY;
		}
		random = random || Randomness.DEFAULT;
		var buffer = [];
		this.forEach(function (x, i) {
			var r = random.random();
			for (var p = buffer.length; p > 0 && buffer[p-1][0] < r; --p); // Ordered insertion.
			buffer.splice(p, 0, [r, x, i]);
			while (buffer.length > n) {
				buffer.pop();
			}	
		});
		buffer.sort(function (t1, t2) { // Order by index.
			return t1[2] - t2[2];
		});
		return new Iterable(buffer.map(function (t) { // Keep only the elements.
			return t[1];
		}));
	},
	
	// ## Sequence aggregation #####################################################################
	
	/** `foldl(foldFunction, initial)` folds the elements of this iterable with `foldFunction` as a 
	left associative operator. The `initial` value is used as a starting point, but if it is not 
	defined, then the first element in the sequence is used.
	*/
	foldl: function foldl(foldFunction, initial) {
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
	},

	/** `scanl(foldFunction, initial)` folds the elements of this iterable with `foldFunction` as a 
	left associative operator. Instead of returning the last result, it iterates over the 
	intermediate values in the folding sequence.
	*/
	scanl: function scanl(foldFunction, initial) {
		var from = this; // for closures.
		return new Iterable(function __iter__() {
			var iter = from.__iter__(), value, count = -1;
			return function __scanlIterator__() {
				count++;
				if (count === 0) {
					value = initial === undefined ? iter() : initial;
				} else {
					value = foldFunction(value, iter());
				}
				return value;
			};
		});
	},
	
	/** `foldr(foldFunction, initial)` folds the elements of this iterable with `foldFunction` as a 
	right associative operator. The `initial` value is used as a starting point, but if it is not 
	defined the first element in the sequence is used.
	
	Warning! This is the same as doing a `foldl` in a reversed iterable.
	*/
	foldr: function foldr(foldFunction, initial) {
		function flippedFoldFunction(x,y) {
			return foldFunction(y,x);
		}
		return this.reverse().foldl(flippedFoldFunction, initial);
	},

	/** `scanr(foldFunction, initial)` folds the elements of this iterable with `foldFunction` as a 
	right associative operator. Instead of returning the last result, it iterates over the 
	intermediate values in the folding sequence.
	
	Warning! This is the same as doing a `scanl` in a reversed iterable.
	*/
	scanr: function scanr(foldFunction, initial) {
		function flippedFoldFunction(x,y) {
			return foldFunction(y,x);
		}
		return this.reverse().scanl(flippedFoldFunction, initial);
	},
	
	/** `sum(n=0)` returns the sum of all elements in the sequence, or `n` if the sequence is empty. 
	*/
	sum: function sum(n) {
		var result = isNaN(n) ? 0 : +n;
		this.forEach(function (x) { 
			result += (+x);
		});
		return result;
	},

	/** `min(n=Infinity)` returns the minimum element of all elements in the sequence, or `Infinity`
	if the sequence is empty.
	*/
	min: function min(n) {
		var result = isNaN(n) ? Infinity : +n;
		this.forEach(function (x) { 
			x = (+x);
			if (x < result) {
				result = x; 
			}
		});
		return result;
	},

	/** `max(n=-Infinity)` returns the maximum element of all elements in the sequence, or 
	`-Infinity` if the sequence is empty.
	*/
	max: function max(n) {
		var result = isNaN(n) ? -Infinity : +n;
		this.forEach(function (x) { 
			x = (+x);
			if (x > result) {
				result = x; 
			}
		});
		return result;
	},

	/** `all(predicate, strict=false)` returns true if for all elements in the sequence `predicate`
	returns true, or if the sequence is empty.
	*/
	all: function all(predicate, strict) {
		predicate = typeof predicate === 'function' ? predicate : function (x) { return !!x; };
		var result = true;
		this.forEach(function (x, i) { 
			if (!predicate(x, i)) {
				result = false;
				if (!strict) {
					throw STOP_ITERATION; // Shortcircuit.
				}
			}
		});
		return result;
	},

	/** `any(predicate, strict=false)` returns false if for all elements in the sequence `predicate`
	returns false, or if the sequence is empty.
	*/
	any: function any(predicate, strict) {
		predicate = typeof predicate === 'function' ? predicate : function (x) { return !!x; };
		var result = false;
		this.forEach(function (x, i) { 
			if (predicate(x, i)) {
				result = true;
				if (!strict) {
					throw STOP_ITERATION; // Shortcut.
				}
			}
		});
		return result;
	},

	/** `join(sep='')` concatenates all strings in the sequence using `sep` as separator. If `sep` 
	is not given, '' is assumed.
	*/
	join: function join(sep) {
		var result = '';
		sep = ''+ (sep || '');
		this.forEach(function (x, i) { 
			result += (i === 0) ? x : sep + x; 
		});
		return result;
	},
	
	// ## Sequence conversions #####################################################################
	
	/** `toArray(array=[])`: appends to `array` the elements of the sequence and returns it. If no 
	array is given, a new one is used.
	*/
	toArray: function toArray(array) {
		array = array || [];
		this.forEach(function (x) {
			array.push(x);
		});
		return array;
	},

	/** `toObject(obj={})` takes an iterable of 2 element arrays and assigns to the given object (or
	a new one by default) each key-value pairs as a property.
	*/
	toObject: function toObject(obj) {
		obj = obj || {};
		this.forEach(function (x) {
			obj[x[0]] = x[1];
		});
		return obj;
	},
	
	// ## Whole sequence operations ################################################################

	/** `reverse()` returns an iterable with this iterable elements in reverse order.
	
	Warning! It stores all this iterable's elements in memory.
	*/
	reverse: function reverse() {
		return new Iterable(this.toArray().reverse());
	},

	/** `sorted(sortFunction)` returns an iterable that goes through this iterable's elements in 
	order.
	
	Warning! This iterable's elements are stored in memory for sorting.
	*/
	sorted: function sorted(sortFunction) {
		return new Iterable(this.toArray().sort(sortFunction));
	},
	
	/** `permutations(k)` returns an iterable that runs over the permutations of `k` elements of 
	this iterable. Permutations are not generated in any particular order.
	
	Warning! It stores all this iterable's elements in memory.
	*/
	permutations: function permutations(k) {
		k = k|0;
		var pool = this.toArray(),
			n = pool.length;
		if (k < 1 || k > n) {
			return Iterable.EMPTY;
		} else {
			var count = math.factorial(n) / math.factorial(n - k);
			return new Iterable(function () {
				var current = 0,
					indices = Iterable.range(n).toArray();
				return function __permutationsIterator__() {
					if (current < count) {
						var result = new Array(k),
							is = indices.slice(), // copy indices array.
							i = current;
						for (var p = 0; p < k; ++p) {
							result[p] = pool[is.splice(i % (n - p), 1)[0]];
							i = (i / (n - p)) |0;
						}
						++current;
						return result;
					} else {
						throw STOP_ITERATION;
					}
				};
			});
		}
	},
	
	/** `combinations(k)` returns an iterable that runs over the combinations of `k` elements of 
	this iterable. Combinations are generated in lexicographical order. The implementations is 
	inspired in [Python's itertools](https://docs.python.org/3/library/itertools.html#itertools.combinations).
	
	Warning! It stores all this iterable's elements in memory.
	*/
	combinations: function combinations(k) {
		k = k|0;
		var pool = this.toArray(),
			n = pool.length;
		if (k < 1 || k > n) {
			return Iterable.EMPTY;
		} else {
			return new Iterable(function () {
				var indices = Iterable.range(k).toArray(),
					current = indices.map(function (i) { return pool[i]; });
				return function __combinationsIterator__() {
					if (!current) throw STOP_ITERATION;
					var result = current;
					for (var i = k-1; i >= 0; --i) {
						if (indices[i] !== i + n - k) break;
					}
					if (i < 0) {
						current = null;
					} else {
						indices[i] += 1;
						for (var j = i+1; j < k; ++j) {
							indices[j] = indices[j-1] + 1;
						}
						current = indices.map(function (i) { return pool[i]; });
					}
					return result;
				};
			});
		}
	},
	
	/** `slices(size=1)` builds another iterable that enumerates arrays of the given size of 
	elements of this iterable. 
	*/
	slices: function slices(size) {
		var _this = this;
		size = isNaN(size) || size < 1 ? 1 : size|0;
		return new Iterable(function __iter__(){
			var it = _this.__iter__(), slice;
			return function __sliceIterator__() {
				slice = [];
				try {
					for (var i = 0; i < size; ++i) {
						slice.push(it());
					}
				} catch (err) {
					if (err !== STOP_ITERATION) {
						throw err;
					}
				}
				if (slice.length > 0) {
					return slice;
				} else {
					throw STOP_ITERATION;
				}
			};
		});
	},
	
	/** `groupBy(key)` returns an iterable that runs over the subsequent elements of this iterable
	that when applied the `key` function return the same value. If no `key` function is given, the
	actual values are used. Each element in the grouped iterable is a pair, with the key value first
	and an array second.
	*/
	groupBy: function groupBy(key) {
		var it = this;
		return new Iterable(function __iter__() {
			var iter = it.__iter__(), 
				currentValues = null, currentKey;
			try {
				currentValues = [iter()];
				currentKey = key ? key(currentValues[0]) : currentValues[0];
			} catch (err) {
				it.catchStop(err);
			}
			return function __groupByIterator__() {
				var value, valueKey, pair;
				if (!currentValues) {
					it.stop();
				} else while (true) {
					try {
						value = iter();
						valueKey = key ? key(value) : value;
						if (valueKey === currentKey) {
							currentValues.push(value);
						} else {
							pair = [currentKey, currentValues];
							currentKey = valueKey;
							currentValues = [value];
							return pair;
						}
					} catch (err) {
						it.catchStop(err);
						pair = [currentKey, currentValues];
						currentValues = null;
						return pair;
					}
				}
			};
		});
	},
	
	/** `groupAll(key, accum)` returns an object with one member per group of elements. The 
	elements' keys are calculated by the `key` function, or the default string conversion by 
	default. If a `accum` function is given, it is used to accumulate the groups. By default an 
	array is built.
	*/
	groupAll: (function () {
		function DEFAULT_KEY(x) { 
			return x +''; 
		}
		function DEFAULT_ACCUM(xs, x) { 
			xs = xs || [];
			xs.push(x);
			return xs;
		}
		return function groupAll(key, accum) {
			var result = {};
			key = key || DEFAULT_KEY;
			accum = accum || DEFAULT_ACCUM;
			this.forEach(function (elem, i) {
				var k = key(elem, i);
				result[k] = accum(result[k], elem, i);
			});
			return result;
		};
	})(),
	
	// ## Operations on many sequences #############################################################
	
	/** `zip(iterables...)` builds an iterable that iterates over this and all the given iterables 
	at the same time, yielding an array of the values of each and stopping at the first sequence 
	finishing.
	*/
	zip: function zip() {
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
	},
	
	'static zip': function (it) {
		it = it ? iterable(it) : this.EMPTY;
		return this.prototype.zip.apply(it, Array.prototype.slice.call(arguments, 1));
	},
	
	/** `product(iterables...)` builds an iterable that iterates over the 
	[cartesian product](http://en.wikipedia.org/wiki/Cartesian_product) of this and all the given 
	iterables, yielding an array of the values of each.
	*/
	product: function product() {
		var its = Array.prototype.slice.call(arguments).map(iterable);
		its.unshift(this);
		return new Iterable(function __iter__() {
			var iterators, tuple;
			return function __productIterator__() {
				if (!iterators) { // First tuple.
					iterators = its.map(function (it) {
						return it.__iter__();
					});
					tuple = iterators.map(function (iter) {
						return iter(); // If STOP_ITERATION is raised, it should not be catched.
					});
				} else if (!tuple) { // Sequence has ended.
					throw STOP_ITERATION;
				} else {
					for (var i = iterators.length - 1; i >= 0; --i) { // Subsequent tuples.
						try {
							tuple[i] = iterators[i]();
							break;
						} catch (err) {
							if (i > 0 && err === STOP_ITERATION) {
								iterators[i] = its[i].__iter__();
								tuple[i] = iterators[i]();
							} else {
								tuple = null; // So subsequent calls while still throw STOP_ITERATION.
								throw err;
							}
						}
					}
				}
				return tuple.slice(0); // Shallow array clone.
			};
		});
	},
	
	'static product': function (it) {
		it = it ? iterable(it) : this.EMPTY;
		return this.prototype.product.apply(it, Array.prototype.slice.call(arguments, 1));
	},
	
	/** `chain(iterables...)` returns an iterable that iterates over the concatenation of this and 
	all the given iterables.
	*/
	chain: function chain() {
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
	},

	'static chain': function (it) {
		it = it ? iterable(it) : this.EMPTY;
		return this.prototype.chain.apply(it, Array.prototype.slice.call(arguments, 1));
	},
	
	/** `flatten()` chains all the iterables in the elements of this iterable.
	*/
	flatten: function flatten() {
		var self = this;
		return new Iterable(function __iter__() {
			var it = self.__iter__(),
				iterator = this.stop;
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
	},
	
	// ## Set related ##############################################################################
	
	/** The `nub` of a sequence is another sequence with each element only appearing once. Basically
	repeated elements are removed. The argument `comp` may have a function to compare the sequence's
	values.
	
	Warning! All the elements of the result are stored in memory.
	*/
	nub: function nub(comp) {
		var buffer = [];
		return this.filter(function (x) {
			if (comp) {
				for (var i = buffer.length-1; i >= 0; --i) {
					if (comp(buffer[i], x)) {
						return false;
					}
				}
			} else if (buffer.indexOf(x) >= 0) {
				return false;
			}
			buffer.push(x);
			return true;
		});
	},
	
	/** The `union(iterable...)` and `unionBy(comp, iterable...)` methods treat this and each 
	iterable argument as sets, and calculate the union of all. `unionBy` allows to define a specific
	equality criteria between the elements.
	
	Warning! All the elements of the result are stored in memory.
	*/
	union: function union() {
		var args = [void 0].concat(Array.prototype.slice.call(arguments));
		return this.unionBy.apply(this, args);
	},
	
	unionBy: function unionBy(comp) {
		return this.chain.apply(this, Array.prototype.slice.call(arguments, 1)).nub(comp);
	},
	
	/** The `intersection(iterable...)` and `intersectionBy(comp, iterable...)` methods intersection 
	of the iterable arguments with `this`. This iterable is assumed not to have repeated elements. 
	`intersectionBy` allows to define a specific equality criteria between the elements.
	
	Warning! All the elements of the result are stored in memory.
	*/
	intersection: function intersection() {
		var args = [void 0].concat(Array.prototype.slice.call(arguments));
		return this.intersectionBy.apply(this, args);
	},
	
	intersectionBy: function intersectionBy(comp) {
		var buffer = this.toArray();
		for (var i = 1; i < arguments.length; ++i) {
			buffer = iterable(arguments[i]).filter(function (x) {
				if (comp) {
					for (var i = buffer.length-1; i >= 0; --i) {
						if (comp(buffer[i], x)) {
							return true;
						}
					}
					return false;
				} else {
					return buffer.indexOf(x) >= 0;
				}
			}).toArray();
		}
		return iterable(buffer);
	},
	
	/** The `difference(iterable...)` and `differenceBy(comp, iterable...)` methods difference of
	the iterable arguments with `this`. This iterable is assumed not to have repeated elements. 
	`differenceBy` allows to define a specific equality criteria between the elements.
	
	Warning! All the elements of given sequences are stored in memory.
	*/
	difference: function difference() {
		var args = [void 0].concat(Array.prototype.slice.call(arguments));
		return this.differenceBy.apply(this, args);
	},
	
	differenceBy: function differenceBy(comp) {
		var result = this, 
			buffer;
		for (var i = 1; i < arguments.length; ++i) {
			buffer = iterable(arguments[i]).toArray();
			result = result.filter(function (x) {
				if (comp) {
					for (var i = buffer.length-1; i >= 0; --i) {
						if (comp(buffer[i], x)) {
							return false;
						}
					}
					return true;
				} else {
					return buffer.indexOf(x) < 0;
				}
			});
		}
		return result;
	},
	
	// ## Sequence builders ########################################################################
	
	/** `range(from=0, to, step=1)` builds an Iterable object with number from `from` upto `to` with
	the given `step`. For example, `range(2,12,3)` represents the sequence `[2, 5, 8, 11]`.
	*/
	"static range": function range(from, to, step) {
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
	},

	/** `repeat(x, n=Infinity)` builds an iterable that repeats the element `x`	`n` times (or 
	forever by default).
	*/
	"static repeat": function repeat(x, n) {
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
	},

	/** `iterate(f, x, n=Infinity)` returns an iterable that repeatedly applies the function `f` to 
	the value `x`, `n` times (or indefinitely by default).
	*/
	"static iterate": function iterate(f, x, n) {
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
	},
	
	/** `cycle(n=Infinity)` returns an iterable that loops n times over the elements of this 
	`Iterable` (or forever by default).
	*/
	cycle: function cycle(n) {
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
	},
	
	// ## Utility definitions. #####################################################################
	
	/** The string conversion of an iterable (`toString(n=5)`) returns a string with the first `n`
	elements. It ends with `...` if there are more elements in the sequence.
	*/
	toString: function toString(n) {
		n = (n|0) || 5;
		var elems = this.take(n + 1).toArray();
		if (elems.length > n) {
			elems.pop();
			return "Iterable("+ JSON.stringify(elems).replace(/\]$/, " ...]") +")";
		} else {
			return "Iterable("+ JSON.stringify(elems) +")";
		}
	}	
}); //// declare Iterable.

/** `Iterable.EMPTY` is a singleton holding an empty iterable.
*/
Iterable.EMPTY = new Iterable(function () {
	return Iterable.prototype.stop;
});

/** `iterable(obj)` returns an iterable, either if `obj` is already one or builds one from it.
*/
var iterable = exports.iterable = function iterable(obj) {
	return typeof obj !== 'undefined' && obj !== null && typeof obj.__iter__ === 'function' ? obj : new Iterable(obj);
};


/** # Future 

An implementation of [futures](http://docs.oracle.com/javase/7/docs/api/java/util/concurrent/Future.html),
also known as [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
or [deferreds](http://api.jquery.com/category/deferred-object/). These are constructions oriented to 
simplify the interaction between parallel threads. 

A [future](http://en.wikipedia.org/wiki/Futures_and_promises) represents a value that is being 
calculated asynchronously. Callbacks are registered for when the value becomes available or an error
raised.
*/
var Future = exports.Future = declare({
	/** The constructor builds a resolved future if a value is given, else it builds a pending 
	future.
	*/
	constructor: function Future(value) {
		this.state = 0;
		this.callbacks = [[],[],[]];
		if (arguments.length > 0) {
			this.resolve(value);
		}
	},

	/** The method `__future__` is used to get a future from an object. Many methods of `Future` 
	that deal with object that may or may not be futures use this to solve the ambiguity. In this 
	case it returns this object, but other objects may implement it in other ways.
	*/
	__future__: function __future__() {
		return this;
	},
	
	'static __isFuture__': function __isFuture__(obj) {
		return typeof obj !== 'undefined' && obj !== null && typeof obj.__future__ === 'function';
	},
	
	// ## State ####################################################################################
	
	/** A future may be in any of 4 states:
	
	+ 0 or `pending` means that the asynchronous process this future represents has not finished.
		
	+ 1 or `resolved` means that the asynchronous process this future represents has finished 
	successfully.
		
	+ 2 or `rejected` means that the asynchronous process this future represents has finished 
	unsuccessfully.
		
	+ 3 or `cancelled` means that the asynchronous process this future represents was aborted.
	*/
	STATES: ['pending', 'resolved', 'rejected', 'cancelled'],
	
	isPending: function isPending() {
		return this.state === 0;
	},

	isResolved: function isResolved() {
		return this.state === 1;
	},

	isRejected: function isRejected() {
		return this.state === 2;
	},

	isCancelled: function isCancelled() {
		return this.state === 3;
	},
	
	/** When a future is completed (either resolved or rejected) all the corresponding callbacks are
	called asynchronously with the given context and value.
	
	A future may not be completed more than once. Repeated calls to completion methods are ignored.
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

	/** `resolve(value, context=this)` completes the future as `resolved`. This method should be 
	called by the producer when its process is finished successfully.
	*/
	resolve: function resolve(value, context) {
		return this.state === 0 ? this.__complete__(context || this, value, 1) : this;
	},

	/** `reject(reason, context=this)` completes the future as `rejected`. This method should be 
	called by the producer thread when its process is aborted with an error.
	
	If there aren't any `onRejected` callbacks registered, an `Error` is raised. This can be 
	`reason` (if it is already an `Error` instance) or a new `Error` with `reason` as its message.
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

	/** `cancel(reason)` completes the future as `cancelled`, disregarding all callbacks. This 
	method may be called by either the producer or the consumer.
	*/	
	cancel: function cancel(reason) {
		return this.state === 0 ? this.__complete__(this, reason, 3) : this;
	},

	toString: function toString() {
		return 'Future:'+ this.STATES[this.state];
	},
	
	// ## Callbacks ################################################################################
	
	/** For a future to have some use, callback functions are registered to be called when it is 
	completed. Callbacks registered after the future's completion are called right away if the state 
	matches, or ignored otherwise.
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
			throw new Error("Callback must be a function, and not ("+ callback +")!");
		}
	},

	/** `done(callback...)` registers one or more callbacks to be called if this future gets 
	resolved.
	*/
	done: function done() {
		for (var i = 0; i < arguments.length; i++) {
			this.__register__(arguments[i], 1);
		}
		return this;
	},

	/** `fail(callback...)` registers one or more callbacks to be called if this future gets 
	rejected.
	*/
	fail: function fail() {
		for (var i = 0; i < arguments.length; i++) {
			this.__register__(arguments[i], 2);
		}
		return this;
	},

	/** `__onCancel__(callback...)` registers one or more callbacks to be called if this future gets
	cancelled. This is unusual, yet provided for testing purposes.
	*/
	__onCancel__: function __onCancel__() {
		for (var i = 0; i < arguments.length; i++) {
			this.__register__(arguments[i], 3);
		}
		return this;
	},

	/** `always(callback...)` registers one or more callbacks to be called if this future gets 
	either resolved or rejected.
	*/
	always: function always() {
		return this.done.apply(this, arguments).fail.apply(this, arguments);
	},

	/** Binding one future to another ties the completion of the second one to the completion of the
	first one.
	*/
	bind: function bind(future) {
		future.done(this.resolve.bind(this));
		future.fail(this.reject.bind(this));
		future.__onCancel__(this.cancel.bind(this));
		return this;
	},

	/** `then(onResolved, onRejected)` is probably the most used function of promises. It represents
	a kind of asynchronous sequence operation, returning a new future which is resolved when this 
	future is resolved, and rejected in the same way. 
	
	The given callbacks are used to calculate a new value to either resolution or rejection of the 
	new future object, and they themselves may be asynchronous returning futures.
	*/
	then: function then(onResolved, onRejected) {
		var result = new Future();
		this.done(function (value) {
			var futureValue;
			try {
				value = onResolved ? onResolved(value) : value;
				if (__isFuture__(value)) {
					result.bind(value.__future__());
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
					if (__isFuture__(reason)) {
						result.bind(reason.__future__());
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
	
	// ## Functions dealing with futures ###########################################################

	/** `when(value)` unifies asynchronous and synchronous behaviours. If `value` is a future it is
	returned as it is. Else a new future is returned resolved with the given value.
	*/
	'static when': function when(value) {
		return __isFuture__(value) ? value.__future__() : new Future(value);
	},

	/** The static version of `then(value, onResolved, onRejected)` is another way of unifying 
	asynchronous and synchronous behaviours. If `value` is a future, it behaves like the instance 
	`then()`. Else it calls `onResolved` with the given value. 
	
	The main difference with using `Future.when()` is that if value is not a future, the result may 
	not be a future neither. This may be useful for avoiding asynchronism overhead when synchronism 
	is more probable.
	*/
	'static then': function then(value, onResolved, onRejected) {
		return __isFuture__(value) ? value.__future__().then(onResolved, onRejected) : onResolved(value);
	},
	
	/** `invoke(fn, _this, args...)` calls the function synchronously, returning a future resolved 
	with the call's result. If an exceptions is raised, the future is rejected with it.
	*/
	'static invoke': function invoke(fn, _this) {
		try {
			return when(fn.apply(_this, Array.prototype.slice.call(arguments, 2)));
		} catch (error) {
			var result = new Future();
			result.reject(error);
			return result;
		}
	},

	/** `all(futures)` builds a future that is resolved if all the given futures get resolved, or 
	rejected if one gets rejected. If no futures are given, the result is resolved with [].
	*/
	'static all': function all(futures) {
		futures = Array.isArray(futures) ? futures : iterable(futures).toArray();
		var result = new Future(),
			count = futures.length,
			values = new Array(count), future,
			doneCallback = function (index, value) {
				values[index] = value;
				if (--count < 1) {
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
	},

	/** `any(futures)` builds a future that is resolved if any of the given futures are resolved, or
	rejected if all are rejected. If no futures are given, the result is rejected with undefined.
	*/
	'static any': function any(futures) {
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
	},

	/** `sequence(xs, f=None)` evaluates all values and futures in the iterable `xs` in sequence. If
	defined, the function f is called for each value.
	*/
	'static sequence': function sequence(xs, f) {
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
	},

	/** `doWhile(action, condition)` performs the action until the condition fails. The action is 
	first called without arguments, and afterwards it is called with the previous value. The 
	condition is always called with the last value returned by action.
		
	Both action and condition may return futures. The condition by default is the boolean conversion
	of the action's returned value.
	*/
	'static doWhile': function doWhile(action, condition) {
		condition = condition || function (value) {
			return !!value;
		};
		var loopEnd = new Future(),
			reject = loopEnd.reject.bind(loopEnd);
		function loop(value) {
			Future.invoke(condition, null, value).then(function (checks) {
				if (checks) {
					Future.invoke(action, null, value).then(loop, reject);
				} else {
					loopEnd.resolve(value);
				}
			}, reject);
		}
		Future.invoke(action).then(loop, reject);
		return loopEnd;
	},

	/** `whileDo(condition, action)` is similar to `doWhile`, but evaluates the condition first with
	no arguments.
	*/
	'static whileDo': function whileDo(condition, action) {
		return Future.invoke(condition).then(function (checks) {
			return Future.doWhile(action, condition);
		});
	},

	/** `delay(ms, value)` return a future that will be resolved with the given value after the 
	given time in milliseconds. Time is forced to be at least 10ms. If value is undefined, the 
	timestamp when the function is called is used.
	*/
	'static delay': function delay(ms, value) {
		ms = isNaN(ms) ? 10 : Math.max(+ms, 10);
		value = typeof value === 'undefined' ? Date.now() : value;
		var result = new Future();
		setTimeout(result.resolve.bind(result, value), ms);
		return result;
	},

	/** `retrying(f, t=10, delay=100ms, delayFactor=2, maxDelay=5min)` calls the function `f` upto 
	`t` times until it returns a value or a future that is resolved. Each time is separated by a 
	`delay` that gets increased by `delayFactor` upto `maxDelay`.
	
	This function is meant to simplify the implementation of retry schemes, e.g. AJAX calls.
	*/
	'static retrying': function retrying(f, times, delay, delayFactor, maxDelay) {
		times = isNaN(times) ? 10 : +times;
		return times < 1 ? Future.invoke(f) : Future.invoke(f).then(undefined, function () {
			delay = isNaN(delay) ? 100 : +delay;
			delayFactor = isNaN(delayFactor) ? 2.0 : +delayFactor;
			maxDelay = isNaN(maxDelay) ? 300000 : +maxDelay;
			return Future.delay(delay).then(function () {
				return Future.retrying(f, times - 1, Math.min(maxDelay, delay * delayFactor), delayFactor, maxDelay);
			});
		});
	},

	/** `imports(...modules)` returns a future that loads the given modules using 
	[RequireJS'](http://requirejs.org/) `require` function, and resolves to an array of the loaded 
	modules.
	*/
	'static imports': function imports() {
		var result = new Future();
		require(Array.prototype.slice.call(arguments), function () {
			result.resolve(Array.prototype.slice.call(arguments));
		}, function (err) {
			result.reject(err);
		});
		return result;
	}
}); // declare Future.

var when = Future.when,
	__isFuture__ = Future.__isFuture__;

/** # HttpRequest

A wrapper of XMLHttpRequest, adding some functionality and dealing with	asynchronism 
with futures.
*/
var HttpRequest = exports.HttpRequest = declare({ 
	constructor: function HttpRequest() {
		this.__request__ = new XMLHttpRequest();
	},
	
	/** `request(method, url, content, headers, user, password)` opens the 
	request with the given method at the given url, sends the contents and 
	returns a future that gets resolved when the request is responded.
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
		xhr.onreadystatechange = function () { // See <http://www.w3schools.com/ajax/ajax_xmlhttprequest_onreadystatechange.asp>.
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
	
	/** `get(url, content, headers, user, password)` is a shortcut for a request 
	with the GET method.
	*/
	get: function get(url, content, headers, user, password) {
		return this.request('GET', url, content, headers, user, password);
	},
	
	/** `getText(url, content, headers, user, password)` makes a GET request and
	returns the response's text.
	*/
	getText: function getText(url, content, headers, user, password) {
		return this.get(url, content, headers, user, password).then(function (xhr) {
			return xhr.responseText;
		});
	},
	
	/** `getJSON(url, content, headers, user, password)` makes a GET request and
	parses the response text as JSON.
	*/
	getJSON: function getJSON(url, content, headers, user, password) {
		return this.get(url, content, headers, user, password).then(function (xhr) {
			return JSON.parse(xhr.responseText);
		});
	},
	
	/** `post(url, content, headers, user, password)` is a shortcut for a 
	request with the POST method.
	*/
	post: function post(url, content, headers, user, password) {
		return this.request('POST', url, content, headers, user, password);
	},
	
	/** `postJSON(url, content, headers, user, password)` makes a POST request 
	with the content encoded with `JSON.stringify()`.
	*/
	postJSON: function postJSON(url, content, headers, user, password) {
		headers = headers || {};
		headers['Content-Type'] = "application/json";
		return this.post(url, JSON.stringify(content) || 'null', headers, user, password);
	}	
}); // declare HttpRequest.

/** Most methods of HttpRequest have "static" analogues to simplify creating an
instance and using a method right away.
*/
['request', 'get', 'getJSON', 'getText', 'post', 'postJSON'
].forEach(function (id) {
	HttpRequest[id] = function () {
		return HttpRequest.prototype[id].apply(new HttpRequest(), arguments);
	};
});

/** # Parallel

Wrapper for standard web workers, that includes bootstraping and a future oriented interface.
*/
var Parallel = exports.Parallel = declare({
	/** The constructor may take a worker instance to deal with. If not given, a new worker is build 
	using `newWorker()`. If given, it must be properly initialized.
	*/
	constructor: function Parallel(worker) {
		if (!worker) {
			worker = Parallel.newWorker();
		}
		worker.onmessage = this.__onmessage__.bind(this);
		this.worker = worker;
	},
	
	/** `newWorker()` builds a new web worker. Loading `creatartis-base` in its environment. Sets up
	a message handler that evaluates posted messages as code, posting the results back.
	*/
	"static newWorker": function newWorker() {
		var src = 'self.base = ('+ exports.__init__ +')();'+
				'self.onmessage = ('+ (function (msg) {
					try {
						self.base.Future.when(eval(msg.data)).then(function (result) {
							self.postMessage(JSON.stringify({ result: result }));
						});
					} catch (err) {
						self.postMessage(JSON.stringify({ error: err +'' }));
					}
				}) +');',
			blob = new Blob([src], { type: 'text/javascript' });
		return new Worker(URL.createObjectURL(blob));
	},	
	
	/** The handler for the `worker.onmessage` event is the `__onmessage__(msg)` method. It deals 
	with the futures issued by `run()`.
	*/
	__onmessage__: function __onmessage__(msg) {
		var future = this.__future__;
		if (future) {
			this.__future__ = null;
			try {
				var data = JSON.parse(msg.data);
				if (data.error) {
					future.reject(data.error);
				} else {
					future.resolve(data.result);
				}
			} catch (err) {
				future.reject(err);
			}
		}
	},
	
	/** `run(code)` sends the code to run in the web worker in parallel.
	
	Warning! This method will raise an error if it is called while a previous execution is still 
	running.
	*/
	run: function run(code) {
		if (this.__future__) {
			throw new Error('Worker is working!');
		}
		this.__future__ = new Future();
		this.worker.postMessage(code +'');
		return this.__future__;
	}, 
	
	/** A _"static"_ version of `run(code)` is provided also. It creates a web worker to run this 
	code in parallel, and returns a future for its result. After its finished the web worker is 
	terminated.
	*/
	"static run": function run(code) {
		var parallel = new Parallel();
		return parallel.run(code).always(function () {
			parallel.worker.terminate();
		});
	},
	
	/** `loadModule` loads a module in the worker. The module has to have a `__name__`, an 
	`__init__` function that builds the module and a `__dependencies__` array of modules.
	*/
	loadModule: function loadModule(module, recursive) {
		var parallel = this;
		return Future.sequence(recursive ? module.__dependencies__ : [], function (dep) {
			return parallel.loadModule(dep, recursive);
		}).then(function () {
			return parallel.run('self.'+ module.__name__ +' || (self.'+ module.__name__ +'=('+ 
				module.__init__ +')('+ 	module.__dependencies__.map(function (dep) {
					return dep.__name__;
				}).join(',') +')), "OK"'
			);
		});
	}
}); // declare Parallel.

/** # Events

Events is a simple event handler that manages callbacks registered as listeners.
*/
var Events = exports.Events = declare({
/** The constructor argument may include:

+ `maxListeners=Infinity`: Maximum amount of listeners these events can have.
	
+ `isOpen=true`: An open Events accepts listeners to any event. Otherwise 
	event names	have to be specified previously via the 'events' property in the 
	configuration.
	
+ `events=[]`: An array of event identifiers to be managed.
*/
	constructor: function Events(config) {
		initialize(this, config)
			.number('maxListeners', { defaultValue: Infinity, coerce: true, minimum: 1 })
			.bool('isOpen', { defaultValue: true });
		var __listeners__ = this.__listeners__ = {};
		if (config && Array.isArray(config.events)) {
			config.events.forEach(function (eventName) {
				__listeners__[eventName] = [];
			});
		}
	},

	/** `listeners(eventName)` returns an array with the listeners for the 
	event with the given identifier.
	*/
	listeners: function listeners(eventName) {
		if (this.__listeners__.hasOwnProperty(eventName)) {
			return this.__listeners__[eventName].slice(); // Return a copy of the array.
		} else {
			return [];
		}
	},
	
	/** `emit(eventName, ...args)` emits an event with the given arguments. 
	Listeners' callbacks are called asynchronously with the provided args. 
	
	If `eventName` is an array instead of a string, all events in the array are
	emitted with the given args.
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
						return listener[0].apply(global, args);
					}, 1);
					listener[1]--;
					return listener[1] > 0;
				} else {
					return false;
				}
			});
		return true;
	},
	
	/** `on(eventName, callback, times=Infinity)` registers a callback function
	to listen to the event the given number of times, or always by default.
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

	/** `once(eventName, callback)` registers a callback to listen to the event
	only once.
	*/
	once: function once(eventName, callback) {
		return this.on(eventName, callback, 1);
	},

	/** `off(eventName, callback)` deregisters the callback from the event.
	*/
	off: function off(eventName, callback) {
		if (Array.isArray(eventName)) {
			var events = this;
			eventName.forEach(function (name) {
				events.off(name, callback);
			});
		} else if (this.__listeners__.hasOwnProperty(eventName)) {
			this.__listeners__[eventName] = this.__listeners__[eventName]
				.filter(function (listener) {
					return listener[0] !== callback;
				});
		}
	}
}); // declare Events.


/** # Randomness

Randomness is the base class for pseudorandom number generation algorithms and related functions. A 
limitation with Javascript's `Math.random` function is that it cannot be seeded. This hinders its 
use for simulations and simular purposes.
*/
var Randomness = exports.Randomness = declare({
	/** The `Randomness` instances are build with a `generator` function. This is a function that is 
	called without any parameters and returns a random number between 0 (inclusive) and 1 
	(exclusive). If none is given the standard `Math.random´ is used.
	*/
	constructor: function Randomness(generator) {
		if (typeof generator === 'function') {
			this.__random__ = generator;
		}
	},

	__random__: Math.random,
	
	/** The basic use of the pseudorandom number generator is through the method `random`. Called 
	without arguments returns a random number in [0,1). Called with only the first argument x, 
	returns a random number in [0, x). Called with two arguments (x, y) return a random number in 
	[x,y).
	*/
	random: function random() {
		var n = this.__random__();
		switch (arguments.length) {
			case 0: return n;
			case 1: return n * arguments[0];
			default: return (1 - n) * arguments[0] + n * arguments[1];
		}
	},

	/** The method `randomInt` behaves the same way `random` does, but returns an integer instead.
	*/
	randomInt: function randomInt() {
		return Math.floor(this.random.apply(this, arguments));
	},

	/** The method `randomBool` tests against a probability (50% by default), yielding true with the 
	given chance, or else false.
	*/
	randomBool: function randomBool(prob) {
		return this.random() < (isNaN(prob) ? 0.5 : +prob);
	},

	// ## Sequence handling ########################################################################

	/** A shortcut for building an array of n random numbers calling is `randoms`. Numbers are 
	generated calling `random` many times.
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

	/** To randomnly selects an element from a sequence `xs` use `choice(xs)`. If more than one 
	argument is given, the element is chosen from the argument list.
	*/
	choice: function choice(from) {
		from = arguments.length > 1 ? Array.prototype.slice.call(arguments) : 
			Array.isArray(from) ? from : 
			iterable(from).toArray();
		return from.length < 1 ? undefined : from[this.randomInt(from.length)];
	},

	/** To randomnly selects `n` elements from a sequence `xs` use `choices(n, xs)`. If more than 
	two arguments are given, the elements are taken from the second arguments on.
	*/
	choices: function choices(n, from) {
		return this.split.apply(this, arguments)[0];
	},
	
	/** To take `n` elements from a sequence `xs` randomnly use `split(n, xs)`. It returns an array 
	`[A, B]` with `A` being the taken elements and `B` the remaining ones. If more than two 
	arguments are given, elements are taken from the second argument on.
	*/
	split: function split(n, from) {
		from = arguments.length > 2 ? Array.prototype.slice.call(arguments) : iterable(from).toArray();
		var r = [];
		for (n = Math.min(from.length, Math.max(+n, 0)); n > 0; n--) {
			r = r.concat(from.splice(this.randomInt(from.length), 1));
		}
		return [r, from];
	},

	/** The method `shuffle(xs)` randomnly rearranges elements in xs; returning a copy.
	*/
	shuffle: function shuffle(elems) { //TODO This can be optimized by making random swaps.
		return this.choices(elems.length, elems);
	},

	// ## Weighted choices #########################################################################
	
	/** Given a sequence of `weightedValues` (pairs `[value, weight]`), a normalization scales all 
	weights proportionally, so they add up to 1 and hence can be treated as probabilities. If any
	weight is negative, an error is raised.
	*/
	normalizeWeights: function normalizeWeights(weightedValues) {
		weightedValues = iterable(weightedValues);
		var sum = 0, min = Infinity, length = 0;
		weightedValues.forEachApply(function (value, weight) {
			raiseIf(weight < 0, "Cannot normalize with negative weights!");
			sum += weight;
			if (weight < min) {
				min = weight;
			}
			length++;
		});
		sum -= min * length;
		return weightedValues.mapApply(function (value, weight) {
			return [value, (weight - min) / sum];
		});
	},
	
	/** A `weightedChoice` is a choice where each value has its own probability. The given 
	`weightedValues` must be normalized, i.e. the weights must add up to 1.
	*/
	weightedChoice: function weightedChoice(weightedValues) {
		var chance = this.random(), result;
		iterable(weightedValues).forEachApply(function (value, weight) {
			chance -= weight;
			if (chance <= 0) {
				result = value;
				Iterable.stop();
			}
		});
		return result;
	},
	
	/** The method `weightedChoices` performs `n` weighted choices, without repeating values.
	*/
	weightedChoices: function weightedChoices(n, weightedValues) {
		weightedValues = iterable(weightedValues).toArray();
		var maxProb = 1, results = [], random;
		for (var i = 0; i < n; ++i) {
			random = this.random(maxProb);
			iterable(weightedValues).forEachApply(function (value, weight, i) {
				random -= weight;
				if (random <= 0) {
					results.push(value);
					maxProb -= weight;
					weightedValues.splice(i, 1); // Remove selected element.
					Iterable.stop();
				}
			});
		}
		return results;
	},

	// ## Distributions ############################################################################

	/** An `averagedDistribution(times)` of a `Randomness` instance is another `Randomness` instance 
	based on this one, but generating numbers by averaging its random values a given number of 
	`times` (2 by default). The result is an aproximation of the normal distribution as times
	increases.
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
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Randomness',
		serializer: function serialize_Randomness(obj) {
			return obj.__random__ !== Math.random ? [obj.__random__] : [];
		},
		materializer: function materialize_Randomness(obj, args) {
			return args && (args.length < 1 ? Randomness.DEFAULT : new Randomness(args[0]));
		}
	}
}); //- declare Randomness.

// ## Default generator ############################################################################

/** `Randomness.DEFAULT` holds the default static instance, provided for convenience. Uses 
`Math.random()`.
*/
Randomness.DEFAULT = new Randomness();

['random', 'randomInt', 'randomBool', 'choice', 'split', 'choices', 'shuffle',
 'averagedDistribution'
].forEach(function (id) {
	Randomness[id] = Randomness.DEFAULT[id].bind(Randomness.DEFAULT);
});

// ## Algorithms ###################################################################################

// ### Linear congruential #########################################################################

/** `Randomness.LinearCongruential` builds a pseudorandom number generator constructor implemented 
with the [linear congruential algorithm](http://en.wikipedia.org/wiki/Linear_congruential_generator).
It also contain the following shortcuts to build common variants:
*/
var LinearCongruential = Randomness.LinearCongruential = declare(Randomness, {
	constructor: function LinearCongruential(m, a, c, seed) {
		var i = isNaN(seed) ? Date.now() : Math.floor(seed);
		this.__arguments__ = [m, a, c, i];
		this.__random__ = function __random__() {
			return (i = (a * i + c) % m) / m;
		};
	},
	
	'static __SERMAT__': {
		identifier: 'LinearCongruential',
		serializer: function serializer_LinearCongruential(obj) {
			return obj.__arguments__;
		}
	},
	
	/** + `numericalRecipies(seed)`: builds a linear congruential pseudorandom number generator as 
		it is specified in [Numerical Recipies](http://www.nr.com/).
	*/
	'static numericalRecipies': function (seed) {
		return new LinearCongruential(0xFFFFFFFF, 1664525, 1013904223, seed);
	},
	
	/** + `borlandC(seed)`: builds a linear congruential pseudorandom number generator as it used by
		Borland C/C++.
	*/
	'static borlandC': function (seed) {
		return new LinearCongruential(0xFFFFFFFF, 22695477, 1, seed);
	},
	
	/** + `glibc(seed)`: builds a linear congruential pseudorandom number generator as it used by
		[glibc](http://www.mscs.dal.ca/~selinger/random/).
	*/
	'static glibc': function (seed) {
		return new LinearCongruential(0xFFFFFFFF, 1103515245, 12345, seed);
	}
});

// ### Mersenne twister ############################################################################

/** The method `Randomness.mersenneTwister` returns a pseudorandom number generator constructor 
implemented with the [Mersenne Twister algorithm](http://en.wikipedia.org/wiki/Mersenne_twister#Pseudocode).
*/
Randomness.MersenneTwister = (function (){
	/** Bit operations in Javascript deal with signed 32 bit integers. This algorithm deals with
	unsigned 32 bit integers. That is why this function is necessary.
	*/
	function unsigned(n) {
		return n < 0 ? n + 0x100000000 : n;
	}
	
	function initialize(seed) {
		var numbers = new Array(624),
			last;
		numbers[0] = last = seed;
		for (var i = 1; i < 624; ++i) {
			numbers[i] = last = (0x6C078965 * unsigned(last ^ (last << 30)) + i) % 0xFFFFFFFF;
		}
		return numbers;
	}
	
	function generate(numbers) {
		for(var i = 0; i < 624; ++i) {
			var y = (numbers[i] & 0x80000000) | (numbers[(i+1) % 624] & 0x7FFFFFFF);
			numbers[i] = unsigned(numbers[(i + 397) % 624] ^ (y * 2));
			if ((y & 1) !== 0) {
				numbers[i] = unsigned(numbers[i] ^ 0x9908B0DF);
			}
		}
	}

	return declare(Randomness, {
		constructor: function MersenneTwister(seed) {
			this.__seed__ = isNaN(seed) ? Date.now() : Math.floor(seed);
			var numbers = initialize(this.__seed__),
				index = 0;
			this.__random__ = function () {
				if (index === 0) {
					generate(numbers);
				}
				var y = numbers[index];
				y = unsigned(y ^ (y << 11));
				y = unsigned(y ^ ((y >>> 7) & 0x9D2C5680));
				y = unsigned(y ^ ((y >>> 15) & 0xEFC60000));
				y = unsigned(y ^ (y << 18));
				index = (index + 1) % 624;
				return y / 0xFFFFFFFF;
			};
		},
		
		'static __SERMAT__': {
			identifier: 'MersenneTwister',
			serializer: function serializer_MersenneTwister(obj) {
				return [obj.__seed__];
			}
		},
	});
})();

/** # Chronometer

A Chronometer is a simple tool to measure time.
*/
var Chronometer = exports.Chronometer = declare({
	/** The constructor may take a timestamp to initiate the chronometer, 
	otherwise it uses the current time.
	*/
	constructor: function Chronometer(t) {
		this.reset(t);
	},
	
	/** Resetting the chronometer sets its `__timestamp__` property to the given
	time or now by default.
	*/
	reset: function reset(t) {
		return this.__timestamp__ = t || Date.now();
	},

	/** `time()` gets the elapsed time since the creation or resetting of the
	chronometer.
	*/
	time: function time() {
		return Date.now() - this.__timestamp__;
	},

	/** `tick(t=now)` gets the elapsed time since the creation or resetting of 
	the chronometer, and resets it.
	*/
	tick: function tick(t) {
		var result = this.time();
		this.reset(t);
		return result;
	},

	/** `chronometer(f, times=1)` executes the parameterless function `f` the 
	given number of `times` (1 by default) and logs the time each run takes. 
	
	Finally, returns the average of all those measurements.
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


/** # Statistic

Component representing statistical accounting for one concept.
*/
var Statistic = exports.Statistic = declare({
	/** Every statistic object has a set of keys that identify the numerical value it represents. 
	This can be as simple as one string, or an object with many values for different aspects of the 
	statistic.
	*/
	constructor: function Statistic(keys) {
		if (typeof keys !== 'undefined') {
			this.keys = typeof keys === 'object' ? 	(keys !== null ? keys : '') : keys +'';
		}
		this.reset(); // At first all stats must be reset.
	},
	
	/** Resetting a statistic deletes all registered values and sets all properties to zero.
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

	/** An Statistic object may apply to a certain concept or not, depending on its `keys`. When 
	dealing with sets of keys (objects), `applies(keys)` checks if all the given keys are this 
	statistic's keys.
	*/
	applies: function applies(keys) {
		if (typeof keys === 'undefined') {
			return false;
		} else if (keys === null) {
			keys = '';
		}
		if (typeof this.keys === 'undefined') {
			return false;
		} else if (typeof this.keys === 'object') {
			var i;
			if (typeof keys === 'object') {
				if (Array.isArray(this.keys) && Array.isArray(keys)) {
					for (i in keys) {
						if (this.keys.indexOf(keys[i]) < 0) {
							return false;
						}
					}
				} else { 
					for (i in keys) {
						if (typeof this.keys[i] === 'undefined' || keys[i] !== this.keys[i]) {
							return false;
						}
					}
				}
				return true;
			} else {
				return false;
			}
		} else {
			return typeof keys !== 'object' && this.keys === keys +'';
		}
	},
	
	// ## Querying statistics ######################################################################
	
	/** `count()` gets the current count, or 0 if values have not been added.
	*/
	count: function count() {
		return this.__count__;
	},
	
	/** `sum()` gets the current sum, or zero if values have not been added.
	*/
	sum: function sum() {
		return this.__sum__;
	},
	
	/** `squareSum()` gets the current sum of squares, or zero if values have not been added.
	*/
	squareSum: function squareSum() {
		return this.__sqrSum__;
	},
	
	/** `minimum()` gets the current minimum, or Infinity if values have not been added.
	*/
	minimum: function minimum() {
		return this.__min__;
	},
	
	/** `maximum()` gets the current maximum, or -Infinity if values have not been added.
	*/
	maximum: function maximum() {
		return this.__max__;
	},
	
	/** `minData()` gets the data associated with the current minimum, or `undefined` if there is 
	not one.
	*/
	minData: function minData() {
		return this.__minData__;
	},
	
	/** `maxData()` gets the data associated with the current maximum, or `undefined` if there is 
	not one.
	*/
	maxData: function maxData() {
		return this.__maxData__;
	},

	/** `average()` calculates the current average, or zero if values have not been added.
	*/
	average: function average() {	
		var count = this.count();
		return count > 0 ? this.sum() / count : 0.0;
	},
	
	/** `variance(center=average)` calculates current variance, as the average squared difference of
	each element with the center, which is equal to the average by default. Returns zero if values 
	have not been added.
	*/
	variance: function variance(center) {
		if (isNaN(center)) {
			center = this.average();
		}
		var count = this.count();
		return count > 0 ? center * center + (this.squareSum() - 2 * center * this.sum()) / count : 0.0;
	},

	/** `standardDeviation(center=average)` calculates current standard deviation, as the square 
	root of the current variance.
	*/
	standardDeviation: function standardDeviation(center) {
		return Math.sqrt(this.variance(center));
	},
	
	// ## Updating statistics ######################################################################
	
	/** Values are added to a statistic with `add(value, data=none)`, which updates the statistic. 
	Optionally data about the instances can be attached.
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

	/** `addAll(values, data=none)` adds all the given values (using `add()`).
	*/
	addAll: function addAll(values, data) {	
		for (var i = 0; i < values.length; i++) {
			this.add(values[i], data);
		}
		return this; // For chaining.
	},
	
	/** `gain(value, factor=DEFAULT_GAIN_FACTOR, data=none)` is similar to `add()`, but fades 
	previous values by multiplying them by the given factor. This is useful to implement schemes 
	similar to exponential moving averages.
	*/
	gain: function gain(value, factor, data) {
		factor = isNaN(factor) ? this.DEFAULT_GAIN_FACTOR : +factor;
		this.__count__ *= factor;
		this.__sum__ *= factor;
		this.__sqrSum__ *= factor;
		return this.add(value, data);
	},

	/** The `DEFAULT_GAIN_FACTOR=0.99` is used in the `gain()` method.
	*/
	DEFAULT_GAIN_FACTOR: 0.99,
	
	/** `gainAll(values, factor=DEFAULT_GAIN_FACTOR, data=none)` gains all the given values (using 
	`gain()`).
	*/
	gainAll: function gainAll(values, factor, data) {	
		for (var i = 0; i < values.length; i++) {
			this.gain(values[i], factor, data);
		}
		return this; // For chaining.
	},
	
	/** `addStatistic(stat)` adds the values in the given Statistic object to this one.
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
	
	// ### Time handling ###########################################################################
	
	/** `startTime(timestamp=now)` starts a chronometer for this statistic.
	*/
	startTime: function startTime(timestamp) {
		var chronometer = this.__chronometer__ || (this.__chronometer__ = new Chronometer());
		return chronometer.reset(timestamp);
	},
	
	/** `addTime(data=undefined)` adds to this statistic the time since `startTime` was called.
	*/
	addTime: function addTime(data) {
		raiseIf(!this.__chronometer__, "Statistic's chronometer has not been started.");
		return this.add(this.__chronometer__.time(), data);
	},

	/** `addTick(data=undefined)` adds to this statistic the time since `startTime` was called, and 
	resets the chronometer.
	*/
	addTick: function addTick(data) {
		raiseIf(!this.__chronometer__, "Statistic's chronometer has not been started.");
		return this.add(this.__chronometer__.tick(), data);
	},
	
	// ## Tests and inference ######################################################################
	
	/** The static `z_test` method returns the mean statistic for [z-tests](http://en.wikipedia.org/wiki/Z-test)
	given the expected `mean` and `variance` and the `sampleCount` and `sampleMean`.	
	*/
	'static z_test': function z_test(mean, variance, sampleCount, sampleMean) {
		var r = {},
			z = r.z = (sampleMean - mean) / Math.sqrt(variance / sampleCount),
			p = math.gauss_cdf(z);
		r.p_lessThan    = z < 0 ? p : 0;
		r.p_greaterThan = z > 0 ? 1 - p : 0;
		r.p_notEqual    = z !== 0 ? 2 * Math.max(r.p_lessThan, r.p_greaterThan) : 0; //TODO Check this.
		return r;
	},
	
	/** The instance `z_test` method is analogue to the static one, using this object's data. The 
	`variance` is assumed to this sample's variance by default.
	*/
	z_test: function z_test(mean, variance) {
		variance = isNaN(variance) ? this.variance() : +variance;
		return Statistic.z_test(mean, variance, this.count(), this.average());
	},
	
	/** The static `t_test1` method returns the mean statistic for 
	[Student's one-sample t-tests](http://en.wikipedia.org/wiki/Student%27s_t-test#One-sample_t-test) 
	given: `mean`, `sampleCount`, `sampleMean` and `sampleVariance`.
	*/
	'static t_test1': function t_test1(mean, sampleCount, sampleMean, sampleVariance) {
		return { 
			t: (sampleMean - mean) / (sampleVariance / Math.sqrt(sampleCount))
		};
	},
	
	/** The instance `t_test1` method is analogue to the static one, using this object's data. The 
	`mean` is assumed to be zero by default.
	*/
	t_test1: function t_test1(mean, sampleCount, sampleMean, sampleVariance) {
		return Statistic.t_test1(
			isNaN(mean) ? 0.0 : +mean,
			isNaN(sampleCount) ? this.count() : +sampleCount,
			isNaN(sampleMean) ? this.average() : +sampleMean,
			isNaN(sampleVariance) ? this.variance() : +sampleVariance
		);
	},
	
	/** The static `t_test2` method returns the mean statistic for 
	[Student's two-sample t-tests](http://en.wikipedia.org/wiki/Student%27s_t-test#Unequal_sample_sizes.2C_equal_variance) 
	given the two sample groups' count, mean and variance.
	*/
	'static t_test2': function t_test2(sampleCount1, sampleCount2, 
			sampleMean1, sampleMean2, sampleVariance1, sampleVariance2) {
		var pooledVariance = (((sampleCount1 - 1) * sampleVariance1 + (sampleCount2 - 1) * sampleVariance2) /
			(sampleCount1 + sampleCount2 - 2));
		return { 
			t: (sampleMean1 - sampleMean2) / Math.sqrt(pooledVariance * (1 / sampleCount1 + 1 / sampleCount2))
		};
	},
	
	/** The instance `t_test2` method is analogue to the static one, using this object's and another
	one's data.
	*/
	t_test2: function t_test2(other) {
		return Statistic.t_test2(
			this.count(), other.count(),
			this.average(), other.average(),
			this.variance(), other.variance()
		);
	},
	
	// ## Other ####################################################################################
	
	/** The default string representation is the concatenation of the statistic's id, count, 
	minimum, average, maximum and standard deviation, separated by tabs.
	*/
	toString: function toString(sep) {
		sep = ''+ (sep || '\t');
		var keys = typeof this.keys !== 'object' ? this.keys + '' :
			iterable(this.keys).map(function (kv) {
				return kv[0] +':'+ kv[1];
			}).join(', ');
		return [keys, this.count(), this.minimum(), this.average(), 
			this.maximum(), this.standardDeviation()].join(sep);
	},
	
	/** Serialization and materialization using Sermat, registered with identifier
	`creatartis-base.Statistic`.
	*/
	'static __SERMAT__': {
		identifier: 'Statistic',
		serializer: function serialize_Statistic(obj) {
			var result = [obj.keys || null, obj.__count__, obj.__sum__, obj.__sqrSum__, obj.__min__, obj.__max__];
			if (typeof obj.__minData__ !== 'undefined') { // Assumes this implies (typeof obj.__maxData__ !== 'undefined')
				return result.concat([obj.__minData__, obj.__maxData__]);
			} else {
				return result;
			}
		},
		materializer: function materialize_Statistic(obj, args  /* [keys, count, sum, sqrSum, min, max, minData, maxData] */) {
			if (!args) {
				return null;
			}
			var stat = args[0] ? new Statistic(args[0]) : new Statistic();
			stat.__count__ = +args[1]; 
			stat.__sum__ = +args[2];
			stat.__sqrSum__ = +args[3];
			stat.__min__ = +args[4];
			stat.__max__ = +args[5];
			if (stat.__count__ > 0) {
				stat.__minData__ = args[6];
				stat.__maxData__ = args[7];
			}
			return stat;
		}
	}
}); // declare Statistic.

/** # Statistics

Statistical accounting, measurements and related functions.
*/
var Statistics = exports.Statistics = declare({
	/** A `Statistics` is a bundle of Statistic objects.
	*/
	constructor: function Statistics() {
		this.__stats__ = {};
	},
	
	/** Each [`Statistic`](Statistic.js.html) object is stored in `__stats__` indexed by an 
	identifier string generated by `__id__(keys)`.
	*/
	__id__: function __id__(keys) {
		if (typeof keys === 'object' && keys !== null) {
			if (Array.isArray(keys)) {
				return JSON.stringify(keys.slice().sort());
			} else {
				return Object.keys(keys).sort().map(function (n) {
					return JSON.stringify(n) +':'+ JSON.stringify(keys[n]);
				}).join(',');
			}
		} else {
			return JSON.stringify(keys)+'';
		}
	},
	
	/** `stats(keys)` gets the [`Statistic`](Statistic.js.html) objects that applies to `keys`.
	*/
	stats: function stats(keys) {
		return iterable(this.__stats__).map(function (keyVal) {
			return keyVal[1];
		}, function (stat) {
			return stat.applies(keys);
		}).toArray();
	},
	
	/** `stat(keys)` gets the statistic that applies to `keys`, or creates it if it does not exist.
	*/
	stat: function stat(keys) {
		var id = this.__id__(keys);
		return this.__stats__[id] || (this.__stats__[id] = new Statistic(keys));
	},
	
	/** `addObject(obj, data)` adds the values in the given object, one stat per member. If a member 
	is an array, all numbers in the array are added.
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
	
	/** `addStatistic(stat, keys=stat.keys)` adds the values in the given [`Statistic`](Statistic.js.html) 
	to the one with the same keys in this object. If there is none one is created. This does not put
	the argument as an statistic of this object.
	*/
	addStatistic: function addStatistic(stat, keys) {
		return this.stat(typeof keys !== 'undefined' ? keys : stat.keys).addStatistic(stat);
	},
	
	/** `addStatistics(stats, keys=all)` combines the stats of the given `Statistics` with this 
	one's.
	*/
	addStatistics: function addStatistics(stats, keys) {
		var self = this;
		stats.stats(keys).forEach(function (stat) {
			self.stat(stat.keys).addStatistic(stat);
		});
		return this;
	},
	
	// ## Statistic updating shortcuts #############################################################
	
	/** `reset(keys)` resets all the stats that apply to the given `keys`.
	*/
	reset: function reset(keys) {
		this.stats(keys).forEach(function (stat) {
			stat.reset();
		});
		return this; // For chaining.
	},

	/** `add(keys, value, data)` adds a value to the corresponding statistics.
	*/
	add: function add(keys, value, data) {
		return this.stat(keys).add(value, data);
	},
	
	/** `gain(keys, value, factor, data)` gain a value to the corresponding statistics.
	*/
	gain: function gain(keys, value, factor, data) {
		return this.stat(keys).gain(value, factor, data);
	},
	
	/** `addAll(keys, values, data)` add all values to the corresponding statistics.
	*/
	addAll: function addAll(keys, values, data) {
		return this.stat(keys).addAll(values, data);
	},
	
	/** `gainAll(keys, values, factor, data)` gain all values to the corresponding statistics.
	*/
	gainAll: function gainAll(keys, values, factor, data) {
		return this.stat(keys).addAll(values, data);
	},

	/** `startTime(keys, timestamp=now)` starts the timers of all the corresponding statistics.
	*/
	startTime: function startTime(keys, timestamp) {
		return this.stat(keys).startTime(timestamp);
	},
	
	/** `addTime(keys, data=undefined)` adds the times elapsed since the timers of the corresponding 
	statistics was started.
	*/
	addTime: function addTime(keys, data) {
		return this.stat(keys).addTime(data);
	},
	
	/** `addTick(keys, data=undefined)` adds the times elapsed since the timers of the corresponding 
	statistics was started, and resets them.
	*/
	addTick: function addTick(keys, data) {
		return this.stat(keys).addTick(data);
	},
	
	// ## Statistic querying shortcuts #############################################################
	
	/** `accumulation(keys)` creates a new statistic that accumulates all that apply to the given 
	keys.
	*/
	accumulation: function accumulation(keys) {
		var acc = new Statistic(keys);
		this.stats(keys).forEach(function (stat) {
			acc.addStatistic(stat);
		});
		return acc;
	},
	
	/** `count(keys)` gets the count of the accumulation of the corresponding statistics.
	*/
	count: function count(keys) {
		return this.accumulation(keys).count();
	},
	
	/** `sum(keys)` gets the sum of the accumulation of the corresponding statistics.
	*/
	sum: function sum(keys) {
		return this.accumulation(keys).sum();
	},
	
	/** `squareSum(keys)` gets the sum of squares of the accumulation of the corresponding 
	statistics.
	*/
	squareSum: function squareSum(keys) {
		return this.accumulation(keys).squareSum();
	},
	
	/** `minimum(keys)` gets the minimum value of the accumulation of the corresponding statistics.
	*/
	minimum: function minimum(keys) {
		return this.accumulation(keys).minimum();
	},
	
	/** `maximum(keys)` gets the maximum value of the accumulation of the corresponding statistics.
	*/
	maximum: function maximum(keys) {
		return this.accumulation(keys).maximum();
	},
	
	/** `average(keys)` gets the average value of the accumulation of the corresponding statistics.
	*/
	average: function average(keys) {
		return this.accumulation(keys).average();
	},
	
	/** `variance(keys, center=average)` calculates the variance of the accumulation of the 
	corresponding statistics.
	*/
	variance: function variance(keys, center) {
		return this.accumulation(keys).variance(center);
	},
	
	/** `standardDeviation(keys, center=average)` calculates the standard deviation of the 
	accumulation of the corresponding statistics.
	*/
	standardDeviation: function standardDeviation(keys, center) {
		return this.accumulation(keys).standardDeviation(center);
	},
	
	// ## Other ####################################################################################
	
	/** The default string representation concatenates the string representations off all 
	`Statistic` objects, one per line.
	*/
	toString: function toString(fsep, rsep) {
		fsep = ''+ (fsep || '\t');
		rsep = ''+ (rsep || '\n');
		var stats = this.__stats__;
		return Object.keys(stats).map(function (name) {
			return stats[name].toString(fsep);
		}).join(rsep);
	},
	
	/** Serialization and materialization using Sermat, registered with identifier 
	`creatartis-base.Statistics`.
	*/
	'static __SERMAT__': {
		identifier: 'Statistics',
		serializer: function serialize_Statistics(obj) {
			var stats = obj.__stats__;
			return Object.keys(stats).map(function (k) {
				return stats[k];
			});
		},
		materializer: function materialize_Statistics(obj, args) {
			if (!args) {
				return null;
			}
			var result = new Statistics();
			args.forEach(function (stat) {
				result.addStatistic(stat);
			});
			return result;
		}
	}
}); // declare Statistics.

/** # Logger

Simple logging capabilities in a similar (but greatly simplified) fashion that 
Log4J.
*/
var Logger = exports.Logger	= declare({
	/** All loggers have a name, a level and a parent (except `Logger.ROOT`). 
	The level is the priority of the entries accepted by the logger, and is used
	to filter which messages are displayed. All log entries accepted by a logger
	are forwarded to the parent (if defined).
	*/
	constructor: function Logger(name, parent, level) { 
		this.name = ''+ name;
		this.parent = parent || Logger.ROOT;
		this.level = level || "INFO";
		this.appenders = [];
	},
	
	/** `log(level, message...)` appends a new entry in the log if the given 
	level is greater than the current logger's level. The message results of a 
	timestamp and the arguments.
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
	
	/** Log levels are numbers, with the default one being 0. Some standard 
	levels are predefined. For each of these there is a shortcut method to log
	directly in that level:
	*/
	LEVELS: {
		TRACE: -Infinity, DEBUG: -1, INFO: 0, WARN: 1, ERROR: 2, FATAL: Infinity,
		OK: 0, FAIL: 1, TODO: 1, FIXME: 1 // Utility levels.
	},
	
	/** + `trace(message...)` logs an entry with the `TRACE` level.
	*/
	trace: function trace() {
		return this.log("TRACE", Array.prototype.slice.call(arguments, 0).join(""));
	},
	
	/** + `debug(message...)` logs an entry with the `DEBUG` level.
	*/
	debug: function debug() {
		return this.log("DEBUG", Array.prototype.slice.call(arguments, 0).join(""));
	},

	/** + `info(message...)` logs an entry with the `INFO` level.
	*/
	info: function info() {
		return this.log("INFO", Array.prototype.slice.call(arguments, 0).join(""));
	},

	/** + `warn(message...)` logs an entry with the `WARN` level.
	*/
	warn: function warn() {
		return this.log("WARN", Array.prototype.slice.call(arguments, 0).join(""));
	},
	
	/** + `error(message...)` logs an entry with the `ERROR` level.
	*/
	error: function error() {
		return this.log("ERROR", Array.prototype.slice.call(arguments, 0).join(""));
	},

	/** + `fatal(message...)` logs an entry with the `FATAL` level.
	*/
	fatal: function fatal() {
		return this.log("FATAL", Array.prototype.slice.call(arguments, 0).join(""));
	},
	
	/** ## Formats. ###########################################################
	
	Entries are formatted before appending them. Each appender may have a
	different format function. 
	*/
	
	/** By default, `defaultFormat(name, time, level, message)`
	is used. It simply concatenates the log entry data in a string.
	*/
	defaultFormat: function defaultFormat(name, time, level, message) {
		return [level, name, Text.formatDate(time, 'hhnnss.SSS'), message].join(' ');
	},
	
	/** The `htmlFormat(tag='pre', cssClassPrefix='log_')` writes the entry in
	valid HTML with CSS styling support.
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
	
	/** ## Appenders. ##########################################################
	
	Appenders are functions attached to loggers that output the log entries in
	different ways.
	*/
	
	/** `appendToConsole()` adds to the logger an appender that writes messages 
	to the console (using console.log).
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
	
	/** `appendToFile(filePath, flags='a', encoding='utf-8')` adds to the logger
	an appender that writes the log entries to a file using NodeJS's file system
	module.
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
	
	/** `appendToHtml(htmlElement=document.body, maxEntries=all)` adds to the 
	logger an appender that writes the log entries as paragraphs inside the 
	given `htmlElement`. The number of entries can be limited with `maxEntries`.
	
	Warning! Formatted entry text is assumed to be valid HTML and hence is not
	escaped.
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
	
	/** `appendAsWorkerMessages(messageTag='log')` adds to the logger an 
	appender that posts the log entries with the web workers `postMessage()`
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
	
	// ## Other ################################################################
	
	/** `stats()` gets the logger's Statistics objects, creating it if 
	necessary.
	*/
	stats: function stats() {
		return this.__stats__ || (this.__stats__ = new Statistics());
	}
}); // declare Logger.	

/** The `Logger.ROOT` must be the final ancestor of all loggers. It is the 
default parent of the Logger constructor.
*/
Logger.ROOT = new Logger("");


// See __prologue__.js
	[	Randomness, Randomness.LinearCongruential, Randomness.MersenneTwister,
		Statistic, Statistics
	].forEach(function (type) {
		type.__SERMAT__.identifier = exports.__package__ +'.'+ type.__SERMAT__.identifier;
		exports.__SERMAT__.include.push(type);
	});
	return exports;
});
//# sourceMappingURL=creatartis-base.js.map