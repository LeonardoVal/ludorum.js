(function (global, init) { "use strict";
	if (typeof define === 'function' && define.amd) {
		define([], init); // AMD module.
	} else if (typeof exports === 'object' && module.exports) {
		module.exports = init(); // CommonJS module.
	} else {
		global.Sermat = init(); // Browser.
	}
})(this,/** Library wrapper and layout.
*/
function __init__() { "use strict";
	/** Some utility functions used in the library.
	*/
	function raise(context, message, data) {
		var error = new Error("Sermat."+ context +': '+ message);
		if (data) {
			error.data = data;
		}
		throw error;
	}

	function member(obj, id, value, flags) {
		flags = flags|0;
		Object.defineProperty(obj, id, {
			value: value,
			writable: flags & 4, 
			configurable: flags & 2, 
			enumerable: flags & 1
		});
	}

	function coalesce(v1, v2) {
		return typeof v1 === 'undefined' ? v2 : v1;		
	}
	
/** See `__epilogue__.js`.
*/

/** ## Registry ####################################################################################

Sermat allows an extensible syntax to write and read instances of custom _classes_. The syntax 
ressembles a function call in Javascript. For example:

```
RegExp("\d+", "g")
Date(1999,12,31,23,59,59,999)
```

These are called _constructions_. In order to use them, the custom class' constructor has to be 
registered with two functions: serializer and materializer. The serializer calculates an array of
values that will allow to rebuild (i.e. materialize) the instance being serialized (i.e. 
_stringified_). The materializer creates a new instance based on the previously serialized values.

All constructions use a name to identify the type's custom serializer and materializer. Sermat must 
be able to infer this name from the constructor function of the type. By default the name of the 
constructor function is used, but this can be overriden by setting a `__SERMAT__` property of the 
function.
*/
var FUNCTION_ID_RE = /^\s*function\s+([\w\$]+)/,
	ID_REGEXP = /^[\$A-Z_a-z][\$\-\.\w]*$/;
function identifier(type, must) {
	var id = (type.__SERMAT__ && type.__SERMAT__.identifier)
		|| type.name
		|| (FUNCTION_ID_RE.exec(constructor +'') || [])[1];
	if (!id && must) {
		raise('identifier', "Could not found id for type!", { type: type });
	}
	return id;
}

/** A `record` for a construction can be obtained using its identifier or the constructor function
of the type.
*/
function record(type) {
	var id = typeof type === 'function' ? identifier(type, true) : type +'';
	return this.registry[id];
}

/** The registry spec for every custom construction usually has four components: an `identifier`, a 
`type` constructor function, a `serializer` function and a `materializer` function. A `global` flag
can also be provided, and if true causes the construction to be added to the `Sermat.CONSTRUCTIONS` 
global registry.

The identifier can be inferred from the constructor function. If a materializer function is not 
specified, it is assumed the serialization is equal to the arguments with which the constructor has 
to be called to recreate the instance. So, a default materializer is created, which calls the 
constructor with the list of values in the text.
*/
function register(registry, spec) {
	if (typeof spec.type !== 'function') {
		raise('register', "No constructor found for type ("+ spec +")!", { spec: spec });
	}
	spec = {
		type: spec.type,
		identifier: (spec.identifier || identifier(spec.type, true)).trim(),
		serializer: spec.serializer,
		materializer: spec.materializer || materializeWithConstructor.bind(this, spec.type),
		global: !!spec.global,
		include: spec.include
	};
	var id = spec.identifier;
	['true', 'false','null','NaN','Infinity',''].forEach(function (invalidId) {
		if (id === invalidId) {
			raise('register', "Invalid identifier '"+ id +"'!", { spec: spec });
		}
	});
	if (registry.hasOwnProperty(id)) {
		raise('register', "Construction '"+ id +"' is already registered!", { spec: spec });
	}
	if (typeof spec.serializer !== 'function') {
		raise('register', "Serializer for '"+ id +"' is not a function!", { spec: spec });
	}
	if (typeof spec.materializer !== 'function') {
		raise('register', "Materializer for '"+ id +"' is not a function!", { spec: spec });
	}
	Object.freeze(spec);
	registry[id] = spec;
	if (spec.global && !CONSTRUCTIONS[id]) {
		CONSTRUCTIONS[id] = spec;
	}
	if (spec.include) {
		this.include(spec.include);
	}
	return spec;
}

/** A registered construction can be removed with the `remove` method giving its identifier.
*/
function remove(registry, id) {
	if (!registry.hasOwnProperty(id)) {
		raise('remove', "A construction for '"+ id +"' has not been registered!", { identifier: id });
	}
	var r = registry[id];
	delete registry[id];
	return r;
}

/** The `include` method is a more convenient and flexible way of registering custom types. If a 
name (i.e. a string) is provided, the corresponding entry in `Sermat.CONSTRUCTIONS` will be added.
If a constructor function is given and it has a `__SERMAT__` member with the type's definitions, 
then this will be registered. An array with a combination of the previous two types registers all
members. Lastly, an spec record can be used as well. The method tries not to raise errors. 
*/
function include(arg) {
	var spec = null;
	switch (typeof arg) {
		case 'function': {
			spec = this.record(arg);
			if (!spec && arg.__SERMAT__) {
				arg.__SERMAT__.type = arg;
				spec = this.register(arg.__SERMAT__);
			}
			return spec;
		}
		case 'string': {
			spec = this.record(arg);
			if (!spec && CONSTRUCTIONS[arg]) {
				spec = this.register(CONSTRUCTIONS[arg]);
			}
			return spec;
		}
		case 'object': {
			if (Array.isArray(arg)) {
				return arg.map((function (c) {
					return this.include(c);
				}).bind(this));
			} else if (typeof arg.type === 'function') {
				return this.record(arg.identifier || arg.type) || this.register(arg);
			} else if (arg && arg.__SERMAT__ && arg.__SERMAT__.include) {
				return this.include(arg.__SERMAT__.include);
			}
		}
		default: raise('include', "Could not include ("+ arg +")!", { arg: arg });
	}
}

/** The `exclude` method is also a convenient way of removing type registrations. Returns the amount
of registrations actually removed.
*/
function exclude(arg) {
	switch (typeof arg) {
		case 'string': {
			if (this.record(arg)) {
				this.remove(arg);
				return 1;
			}
			return 0;
		}
		case 'function': {
			return this.exclude(identifier(arg));
		}
		case 'object': {
			if (Array.isArray(arg)) {
				var r = 0;
				arg.forEach((function (c) {
					r += this.exclude(c);
				}).bind(this));
				return r;
			}
		}
		default: raise('exclude', "Could not exclude ("+ arg +")!", { arg: arg });
	}
}

/** ## Serialization ###############################################################################

Serialization is similar to JSON's `stringify` method. The method takes a data structure and 
produces a text representation of it. As a second argument the function takes a set of modifiers of
the functions behaviour. The most important one is perhaps `mode`.
*/

/** There are four modes of operation:

+ `BASIC_MODE`: No object inside the given value is allowed to be serialized more than once.

+ `REPEATED_MODE`: If while serializing any object inside the given value is visited more than once,
	its serialization is repeated every time. Still, circular references are not allowed. This is
	analoguos to `JSON.stringify`'s behaviour.

+ `BINDING_MODE`: Every object inside the given value is given an identifier. If any one of these
	is visited twice or more, a reference to the first serialization is generated using this 
	identifier. The materialization actually reuses instances, though circular references are still 
	forbidden.

+ `CIRCULAR_MODE`: Similar to `BINDING_MODE`, except that circular references are allowed. This
	still depends on the constructions' materializers supporting circular references.
*/
var BASIC_MODE = 0,
	REPEAT_MODE = 1,
	BINDING_MODE = 2,
	CIRCULAR_MODE = 3;

/** Serialization method can be called as `serialize` or `ser`.
*/
var serialize = (function () {
	function __serializeValue__(ctx, value) {
		switch (typeof value) {
			case 'undefined': {
				if (ctx.allowUndefined) {
					return 'null';
				} else {
					raise('serialize', "Cannot serialize undefined value!");
				}
			}
			case 'boolean':   
			case 'number': return value +'';
			case 'string': return __serializeString__(value);
			case 'function': // Continue to object, using Function's serializer if it is registered.
			case 'object': return __serializeObject__(ctx, value);
		}
	}
	
	function __serializeString__(str) {
		return '"'+ str.replace(/[\\\"]/g, '\\$&') +'"';
	}
	
	/** During object serialization two lists are kept. The `parents` list holds all the ancestors 
	of the current object. This is useful to check for circular references. The `visited` list holds
	all previously serialized objects, and is used to check for repeated references and bindings.
	*/
	function __serializeObject__(ctx, obj) {
		if (!obj) {
			return 'null';
		} else if (ctx.parents.indexOf(obj) >= 0 && ctx.mode !== CIRCULAR_MODE) {
			raise('serialize', "Circular reference detected!", { circularReference: obj });
		}
		var i = ctx.visited.indexOf(obj), output = '', 
			k, len;
		if (i >= 0) {
			if (ctx.mode & BINDING_MODE) {
				return '$'+ i;
			} else if (ctx.mode !== REPEAT_MODE) {
				raise('serialize', "Repeated reference detected!", { repeatedReference: obj });
			}
		} else {
			i = ctx.visited.push(obj) - 1;
			if (ctx.mode & BINDING_MODE) {
				output = '$'+ i +'=';
			}
		}
		ctx.parents.push(obj);
		if (Array.isArray(obj)) { // Arrays.
		/** An array is serialized as a sequence of values separated by commas between brackets, as 
			arrays are written in plain Javascript. 
		*/
			output += '[';
			for (i = 0, len = obj.length; i < len; i++) {
				output += (i ? ',' : '')+ __serializeValue__(ctx, obj[i]);
			}
			output += ']';
		} else if (obj.constructor === Object || !ctx.useConstructions) { // Object literals.
		/** An object literal is serialized as a sequence of key-value pairs separated by commas 
			between braces. Each pair is joined by a colon. This is the same syntax that 
			Javascript's object literals follow.
		*/
			i = 0;
			output += '{';
			for (var key in obj) {
				output += (i++ ? ',' : '')+ 
					(ID_REGEXP.exec(key) ? key : __serializeValue__(ctx, key)) +':'+ 
					__serializeValue__(ctx, obj[key]);
			}
			output += '}';
		} else { 
		/** Constructions is the term used to custom serializations registered by the user for 
			specific types. They are serialized as an identifier, followed by a sequence of values 
			separated by commas between parenthesis. It ressembles a call to a function in 
			Javascript.
		*/
			var record = ctx.record(obj.constructor) || ctx.autoInclude && ctx.include(obj.constructor);
			if (!record) {
				raise('serialize', 'Unknown type "'+ ctx.sermat.identifier(obj.constructor) +'"!', { unknownType: obj });
			}
			var args = record.serializer.call(ctx.sermat, obj),
				id = record.identifier;
			output += (ID_REGEXP.exec(id) ? id : __serializeString__(id)) +'(';
			for (i = 0, len = args.length; i < len; i++) {
				output += (i ? ',' : '')+ __serializeValue__(ctx, args[i]);
			}
			output += ')';
		}
		ctx.parents.pop();
		return output;
	}

	return function serialize(obj, modifiers) {
		modifiers = modifiers || this.modifiers;
		return __serializeValue__({
			visited: [], 
			parents: [],
			sermat: this,
			record: this.record.bind(this),
			include: this.include.bind(this),
/** Besides the `mode`, other modifiers of the serialization include:

+ `allowUndefined`: If `true` allows undefined values to be serialized as `null`. If `false` (the 
	default) any undefined value inside the given object will raise an error.

+ `autoInclude`: If `true` forces the registration of types found during the serialization, but not
	in the construction registry.
	
+ `useConstructions=true`: If `false` constructions (i.e. custom serializations) are not used, and 
	all objects are treated as literals (the same way JSON does). It is `true` by default.
*/
			mode: coalesce(modifiers.mode, this.modifiers.mode), // Modifiers
			allowUndefined: coalesce(modifiers.allowUndefined, this.modifiers.allowUndefined),
			autoInclude: coalesce(modifiers.autoInclude, this.modifiers.autoInclude),
			useConstructions: coalesce(modifiers.useConstructions, this.modifiers.useConstructions)
		}, obj);
	};
})();

/** The function `serializeAsType` allows to add a reference to a constructor to the serialization.
*/
function serializeAsType(constructor) {
	return new type(constructor);
}

/** ## Materialization #############################################################################

The `materialize` method is similar to JSON's `parse` method. It takes text and parses it to produce
the data structure it represents.
*/

/** The `construct` method seeks for a materializer for the given identifier and calls it.
*/
function construct(id, obj, args) {
	var record = this.record(id);
	if (record) {
		return record.materializer.call(this, obj, args);
	} else {
		raise('construct', "Cannot materialize construction for '"+ id +"'", { invalidId: id });
	}
}

var EOL_RE = /\r\n?|\n/g,
/** The lexer is implemented with a big regular expression that combines all the regular 
	expressions of Sermat's lexemes. The function `String.replace` is used with a callback that 
	performs the actual parsing.
*/
	LEXER_RE = new RegExp([
		/\s+/, // whitespace (1)
		/\/\*(?:[\0-)+-.0-\uFFFF]*|\*+[\0-)+-.0-\uFFFF])*\*+\//, // block comment (2)
		/[\$A-Z_a-z][\$\-\.\w]*/, // identifier (3)
		/[+-]Infinity|[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/, // numerals (4)
		/\"(?:[^\\\"]|\\[\0-\uFFFF])*\"/, // string literals (5)
		/[\[\]\{\}\(\):,=]/, // symbols (6)
		/.|$/ // error (7)
	].map(function (re) {
		re = re +'';
		return '('+ re.substr(1, re.length - 2) +')';
	}).join('|'), 'g'),
/** The parse table was calculated using [JS/CC](http://jscc.phorward-software.com/jscc/jscc.html).
	The generated parser is not used because of two reasons. First, the lexer generated by JS/CC
	is always limited to characters from `\x00` and `\xFF`. Second, because the way it is done here 
	results in less code, even after minimization.
*/
	PARSE_TABLE = [[,10,11,3,13,,12,,,,,,,2,4,5,6,7,8,9,1],
		[,,,,,,,,,,,,,,,,,,,,,,0],
		[,,,,,-1,,-1,,-1,,-1,,,,,,,,,,,-1],
		[,,,,,-9,,-9,15,-9,,-9,14,,,,,,,,,,-9],
		[,,19,18,,,,17,,,,,,,,,,,,,,16],
		[,,,,,,,21,,,,20],
		[,10,11,3,13,23,12,,,,,,,2,4,5,6,7,8,9,22],
		[,,,,,25,,,,,,24],
		[,10,11,3,13,,12,,,27,,,,2,4,5,6,7,8,9,26],
		[,,,,,,,,,29,,28],
		[,,,,,-10,,-10,,-10,,-10,,,,,,,,,,,-10],
		[,,,,,-11,,-11,30,-11,,-11,,,,,,,,,,,-11],
		[,,-13,-13,,,,-13],
		[,-19,-19,-19,-19,-19,-19],
		[,,31,34,33,,32],
		[,-23,-23,-23,-23,,-23,,,-23],
		[,,,,,,,,,,35],
		[,,,,,-3,,-3,,-3,,-3,,,,,,,,,,,-3],
		[,,,,,,,,,,-16],
		[,,,,,,,,,,-17],
		[,,19,18,,,,,,,,,,,,,,,,,,36],
		[,,,,,-4,,-4,,-4,,-4,,,,,,,,,,,-4],
		[,,,,,-20,,,,,,-20],
		[,,,,,-5,,-5,,-5,,-5,,,,,,,,,,,-5],
		[,10,11,3,13,,12,,,,,,,2,4,5,6,7,8,9,37],
		[,,,,,-6,,-6,,-6,,-6,,,,,,,,,,,-6],
		[,,,,,,,,,-26,,-26],
		[,,,,,-7,,-7,,-7,,-7,,,,,,,,,,,-7],
		[,10,11,3,13,,12,,,,,,,2,4,5,6,7,8,9,38],
		[,,,,,-8,,-8,,-8,,-8,,,,,,,,,,,-8],
		[,-25,-25,-25,-25,,-25,,,-25],
		[,,,,,-2,,-2,39,-2,,-2,,,,,,,,,,,-2],
		[,,-12,-12,,,,-12],
		[,-18,-18,-18,-18,-18,-18],
		[,,,,,,,,40],
		[,10,11,3,13,,12,,,,,,,2,4,5,6,7,8,9,41],
		[,,,,,,,,,,42],
		[,,,,,-21,,,,,,-21],
		[,,,,,,,,,-27,,-27],
		[,-24,-24,-24,-24,,-24,,,-24],
		[,-22,-22,-22,-22,,-22,,,-22],
		[,,,,,,,-14,,,,-14],
		[,10,11,3,13,,12,,,,,,,2,4,5,6,7,8,9,43],
		[,,,,,,,-15,,,,-15]
	],
/** Parsing a Sermat string literal uses `eval` after escaping all ends of lines.
*/
	parseString = function parseString(lit) {
		return eval.call(null, lit.replace(EOL_RE, function (match) {
			return match === '\n' ? '\\n' : match === '\r' ? '\\r' : '\\r\\n';
		}));
	};

function materialize(text) {
	/** Sermat's parser is LALR. It handles two stacks: the `stateStack` one for parsing states 
		and the `valueStack` for intermediate values. Bindings are used to resolve all values that
		appear as words (`true`, `null`, etc.).
	*/
	var construct = this.construct.bind(this),
		valueStack = new Array(50), 
		stateStack = new Array(50), 
		stackPointer = 0,
		bindings = { 'true': true, 'false': false, 'null': null, 'NaN': NaN, 'Infinity': Infinity },
		offset, result;
	stateStack[0] = 0;

	/** Unbound identifiers showing in the text always raise an error. Also, values cannot be rebound.
	*/
	var getBind = (function (id) {
		var value = bindings[id];
		if (typeof value === 'undefined') {
			parseError("'"+ id +"' is not bound", { unboundId: id });
		}
		return value;
	}).bind(this);

	function setBind(id, value) {
		if (id.charAt(0) != '$') {
			parseError("Invalid binding identifier '"+ id +"'", { invalidId: id });
		}
		if (bindings.hasOwnProperty(id)) {
			parseError("'"+ id +"' is already bound", { boundId: id });
		}
		return (bindings[id] = value);
	}
	
	/** The parser does not keep track of ends of lines. These are calculated when an error must
		be raised.
	*/
	function parseError(message, data) {
		data = data || {};
		data.offset = offset;
		var line = 0, lineStart = 0;
		text.substr(0, offset).replace(EOL_RE, function (match, pos) {
			lineStart = pos + match.length;
			line++;
			return '';
		});
		data.line = line + 1;
		data.column = offset - lineStart;
		raise('materialize', message +" at line "+ data.line +" column "+ data.column +" (offset "+ offset +")!", data);
	}

	/** Being an LALR parser, the _semantics_ is expressed in functions that are called when a reduce 
		actions is made. The following matches with the language's grammar.
	*/
	var ACTIONS = (function () { 
		function return$1($1) {
			return $1;
		}
		function cons($1, $2) {
			var obj = construct($1[1], $1[2], $1[3]);
			if ($1[2] && obj !== $1[2]) {
				parseError("Object initialization for "+ $1[1] +" failed", { oldValue: $1[2], newValue: obj });
			}
			return $1[0] ? setBind($1[0], obj) : obj;
		}
		return [null, // ACCEPT
		// `value : atom ;`
			[20, 1, return$1],
		// `value : 'id' '=' 'str' ;`
			[20, 3, function ($1,$2,$3) {
				return setBind($1, $3);
			}],
		// `value : obj0 '}' ;`
			[20, 2, return$1],
		// `value : obj1 '}' ;`
			[20, 2, return$1],
		// `value : array0 ']' ;`
			[20, 2, return$1],
		// `value : array1 ']' ;`
			[20, 2, return$1],
		// `value : cons0 ')' ;`
			[20, 2, cons],
		// `value : cons1 ')' ;`
			[20, 2, cons],
		// `atom : 'id' ;`
			[13, 1, function ($1) {
				return getBind($1);
			}],
		// `atom : 'num' ;`
			[13, 1, Number],
		// `atom : 'str' ;`
			[13, 1, parseString],
		// `obj0 : 'id' '=' '{' ;`
			[14, 3, function ($1,$2,$3) {
				return setBind($1, {});
			}],
		// `obj0 : '{' ;`
			[14, 1, function ($1) {
				return {};
			}],
		// `obj1 : obj0 key ':' value ;`
			[15, 4, function ($1,$2,$3,$4) {
				$1[$2] = $4;
				return $1;
			}],
		// `obj1 : obj1 ',' key ':' value ;`
			[15, 5, function ($1,$2,$3,$4,$5) {
				$1[$3] = $5;
				return $1;
			}],
		// `key : 'id' ;`
			[21, 1, return$1],
		// `key : 'str' ;`
			[21, 1, parseString],
		// `array0 : 'id' '=' '[' ;`
			[16, 3, function ($1,$2,$3) {
				return setBind($1, []);
			}],
		// `array0 : '[' ;`
			[16, 1, function ($1) {
				return [];
			}],
		// `array1 : array0 value ;`
			[17, 2, function ($1,$2) { 
				$1.push($2);
				return $1;
			}],
		// `array1 : array1 ',' value ;`
			[17, 3, function ($1,$2,$3) { 
				$1.push($3);
				return $1;
			}],
		// `cons0 : 'id' '=' 'id' '(' ;`
			[18, 4, function ($1,$2,$3,$4) {
				var obj = construct($3, null, null);
				return obj ? [null, $3, setBind($1, obj), []] : [$1, $3, obj, []];
			}],
		// `cons0 : 'id' '(' ;`
			[18, 2, function ($1,$2,$3) {
				return [null, $1, null, []];
			}],
		// `cons0 : 'id' '=' 'str' '(' ;`
			[18, 4, function ($1,$2,$3,$4) {
				$3 = parseString($3);
				var obj = construct($3, null, null);
				return obj ? [null, $3, setBind($1, obj), []] : [$1, $3, obj, []];
			}],
		// `cons0 : 'str' '(' ;`
			[18, 2, function ($1,$2,$3) {
				return [null, parseString($1), null, []];
			}],
		// `cons1 : cons0 value ;`
			[19, 2, function ($1,$2) {
				return ($1[3].push($2), $1);
			}],
		// `cons1 : cons1 ',' value ;`
			[19, 3, function ($1,$2,$3) {
				return ($1[3].push($3), $1);
			}]
		];
	})();
	
	/** The actual parser is implemented with the `String.replace` method with a regular expression
		and a function callback. The regular expression deals with all language's lexemes. The 
		function callback handles the parser's stacks.
	*/
	text.replace(LEXER_RE, function (match, $wsp, $comm, $id, $num, $str, $sym, $err, _offset) {
		if ($wsp || $comm) {
			return ''; // Ignore whitespace and comments.
		}
		offset = _offset;
		var symbol = $num ? 1 : $str ? 2 : $id ? 3 : $sym ? '[]{}():,='.indexOf($sym) + 4 : $err ? 23 /* ERROR */ : 22 /* EOF */,
			parseAction, action;
		while (true) {
			parseAction = PARSE_TABLE[stateStack[stackPointer]][symbol];
			if (parseAction < 0) {
				action = ACTIONS[-parseAction];
				if (action) { // reduce
					stackPointer += 1 - action[1];
					valueStack[stackPointer] = action[2].apply(null, valueStack.slice(stackPointer, stackPointer + action[1]));
					stateStack[stackPointer] = PARSE_TABLE[stateStack[stackPointer - 1]][action[0]]; // GOTO action.
					continue;
				}
			} else if (parseAction > 0) { // shift
				stateStack[++stackPointer] = parseAction;
				valueStack[stackPointer] = match;
				return '';
			} else if (parseAction == 0) { // accept.
				result = valueStack[stackPointer];
				return '';
			}
			parseError("Parse error");
		}
	});
	return result;
}

/** ## Utilities ###################################################################################

*/

/** `serializeAsProperties` is a generic way of serializing an object, by creating another object 
with some of its properties. This method can be used to quickly implement a serializer function when 
the constructor of the type can be called with an object.
*/
function serializeAsProperties(obj, properties, ownProperties) {
	var result = {}, 
		fromArray = Array.isArray(properties),
		name;
	for (var i in properties) {
		name = properties[i];
		if (!ownProperties || obj.hasOwnProperty(name)) {
			result[fromArray ? name : i] = obj[name];
		}
	}
	return [result];
}

/** `materializeWithConstructor` is a generic way of creating a new instance of the given type
`constructor`. Basically a new object is built using the type's prototype, and then the constructor 
is called on this object and the given arguments (`args`) to initialize it.

This method can be used to quickly implement a materializer function when only a call to a 
constructor function is required. It is the default materialization when no method has been given 
for a registered type.
*/
function materializeWithConstructor(constructor, obj, args) {
	if (!obj) {
		obj = Object.create(constructor.prototype);
		if (!args) {
			return obj;
		}
	}
	constructor.apply(obj, args);
	return obj;
}

/** `sermat` is a shortcut to materialize a serialization of a value, e.g. to clone the value. 
*/
function sermat(obj, modifiers) {
	return this.mat(this.ser(obj, modifiers));
}

/** # Binary support 

Sermat includes a custom base 85 encoding (similar to [ascii85](https://en.wikipedia.org/wiki/Ascii85)) 
of Javascript's byte arrays. It is more space efficient than base64. Assuming UTF8 text enconding, 
each 100 characters in base 64 encoded strings hold around 75 bytes, while 100 characters in base 85
hold around 80 bytes.

The characters used are in the range `[\x21-\x7F]` excluing `"$%&'``<>\`. These are special 
characters in XML and in the syntax of string literals in many programming language and macro 
systems. Not using these characters allows the encoded strings to be embedded in XML and string 
literals safely without requiring escape sequences.
*/
var CHARS85 = '!#()*+,-./0123456789:;=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}~',
	DIGITS85 = (function () {
		var r = {};
		for (var i = 0; i < 85; i++) {
			r[CHARS85.charAt(i)] = i;
		}
		return r;
	})();

function enc85(num) {
	var result = '', div;
	while (num !== 0 || result.length < 5) {
		div = Math.floor(num / 85);
		result = CHARS85[num - div * 85] + result;
		num = div;
	}
	return result;
}
	
function encode85(buffer) {
	var view = new DataView(buffer),
		result = '', i = 0, len = view.byteLength;
	switch (len % 4) {
		case 1: result += enc85(0x101010000 + view.getUint8(i++)); break;
		case 2: result += enc85(0x101000000 + view.getUint8(i++) * 0x100 + 
			view.getUint8(i++)); break;
		case 3: result += enc85(0x100000000 + view.getUint8(i++) * 0x10000 +
			view.getUint8(i++) * 0x100 + view.getUint8(i++)); break;
	}
	while (i < len) {
		result += enc85(view.getUint8(i++) * 0x1000000 + view.getUint8(i++) * 0x10000 +
			view.getUint8(i++) * 0x100 + view.getUint8(i++));
	}
	return result;
}

function dec85(str) {
	var result = 0;
	for (var i = 0, len = str.length; i < len; i++) {
		result = DIGITS85[str[i]] + 85 * result;
	}
	return result;
}

function decode85(string) {
	var len = string.length, i = 0, j = 0,
		buffer, view, num;
	if (len < 1) {
		return new ArrayBuffer(0);
	}
	num = dec85(string.substr(0, 5));
	buffer = new ArrayBuffer((len / 5 - 1) * 4 + 
		(num < 0x100000000 ? 4 : num < 0x101000000 ? 3 : num < 0x101010000 ? 2 : 1)
	);
	view = new DataView(buffer);
	len = buffer.byteLength;
	if (num < 0x100000000) {
		view.setUint8(i++, Math.floor(num / 0x1000000));
	}
	if (num < 0x101000000) {
		view.setUint8(i++, (num & 0xFF0000) >> 16);
	}
	if (num < 0x101010000) {
		view.setUint8(i++, (num & 0xFF00) >> 8);
	}
	view.setUint8(i++, num & 0xFF);
	while (i < len) {
		num = dec85(string.substr(j += 5, 5));
		view.setUint8(i++, Math.floor(num / 0x1000000)); // Cannot use bitwise because 32 bits are signed.
		view.setUint8(i++, (num & 0xFF0000) >> 16);
		view.setUint8(i++, (num & 0xFF00) >> 8);
		view.setUint8(i++, num & 0xFF);
	}
	return buffer;
}

function typedArraySerializer(value) {
	return [this.encode85(value.buffer)];
}

function typedArrayMaterializer(id, arrayType) {
	return function (obj, args) {
		return args
			&& checkSignature(id, /^,string$/, obj, args)
			&& new arrayType(this.decode85(args[0]));
	};
}

/** ## Constructions for Javascript types ##########################################################

One of Sermat's most important features is extensible handling of custom types. But the library 
provides some implementations for some of Javascript's base types.
*/

/** The `signature` function builds a string representing the types of the arguments (separated by
comma). For each value it is equal to `typeof value` if is not `'object'`, the empty string (for 
`null`) or the name of the value's constructor.

It can be used to quickly check a call to a materializer using a regular expression.
*/
function signature() {
	var r = "", t, v;
	for (var i = 0; i < arguments.length; i++) {
		v = arguments[i];
		t = typeof v;
		if (i) {
			r += ',';
		}
		r += t === 'object' ? (v ? identifier(v.constructor) : '') : t;
	}
	return r;
}

/** The `checkSignature` function checks the types of a call to a materializer using a regular
	expression to match the result of `signature`. This is a simple and quick way of making the
	materializer functions more secure.
*/
function checkSignature(id, regexp, obj, args) {
	var types = signature.apply(this, [obj].concat(args));
	if (!regexp.exec(types)) {
		raise('checkSignature', "Wrong arguments for construction of "+ id +" ("+ types +")!", 
			{ id: id, obj: obj, args: args });
	}
	return true;
}

/** `Sermat.CONSTRUCTIONS` contains the definitions of constructions registered globally. At first 
it includes some implementations for Javascript's base types.
*/
var CONSTRUCTIONS = {};
[
/** All `Boolean`, `Number`, `String`, `Object` and `Array` instances are serialized with their 
	specific syntax and never as constructions. These are added only for compatibility at 
	materialization.
*/
	[Boolean,
		function serialize_Boolean(value) {
			return [!!value];
		},
		function materialize_Boolean(obj, args) {
			return args && new Boolean(args[0]);
		}
	],
	[Number,
		function serialize_Number(value) {
			return [+value];
		},
		function materialize_Number(obj, args) {
			return args && new Number(args[0]);
		}
	],
	[String,
		function serialize_String(value) {
			return [value +''];
		},
		function materialize_String(obj, args) {
			return args && new String(args[0]);
		}
	],
	[Object,
		function serialize_Object(value) { // Should never be called.
			return [value];
		},
		function materialize_Object(obj, args) {
			return args && Object.apply(null, args);
		}
	],
	[Array,
		function serialize_Array(value) { // Should never be called.
			return value; 
		},
		function materialize_Array(obj, args) {
			obj = obj || [];
			return args ? obj.concat(args) : obj;
		}
	],

/** + `RegExp` instances are serialized with two arguments: a string for the regular expression and 
	a string for its flags.
*/
	[RegExp,
		function serialize_RegExp(value) {
			var comps = /^\/(.+?)\/([a-z]*)$/.exec(value +'');
			if (!comps) {
				raise('serialize_RegExp', "Cannot serialize RegExp "+ value +"!", { value: value });
			}
			return [comps[1], comps[2]];
		},
		function materialize_RegExp(obj, args /* [regexp, flags] */) {
			return args 
				&& checkSignature('RegExp', /^(,string){1,2}$/, obj, args) 
				&& (new RegExp(args[0], args[1] || ''));
		}
	],

/** + `Date` instances are serialized using its seven UTC numerical components (in this order): 
	year, month, day, hours, minutes, seconds and milliseconds.
*/
	[Date,
		function serialize_Date(value) {
			return [value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 
				value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds(), 
				value.getUTCMilliseconds()];
		},
		function materialize_Date(obj, args /*[ years, months, days, hours, minutes, seconds, milliseconds ] */) {
			return args 
				&& checkSignature('Date', /^(,number){1,7}$/, obj, args) 
				&& (new Date(Date.UTC(args[0] |0, +args[1] || 1, args[2] |0, args[3] |0, args[4] |0, args[5] |0, args[6] |0)));
		}
	],

/** + `Function` is not registered by default, but it is available. Functions are serialized as 
	required by the `Function` constructor.
*/
	[Function,
		function serialize_Function(value) {
			var comps = /^function\s*[\w$]*\s*\(((\s*[$\w]+\s*,?)*)\)\s*\{([\0-\uFFFF]*)\}$/.exec(value +'');
			if (!comps) {
				raise('serialize_Function', "Could not serialize Function "+ value +"!", { value: value });
			}
			return comps[1].split(/\s*,\s*/).concat([comps[3]]);
		},
		function materialize_Function(obj, args /* [args..., body] */) {
			return args 
				&& checkSignature('Function', /^(,string)+$/, obj, args) 
				&& (Function.apply(null, args));
		}
	],
	
/** + `ArrayBuffer` instances and typed arrays are serialized using `encode85` and materialized with
	`decode85`.
*/
	[ArrayBuffer,
		function serialize_ArrayBuffer(value) {
			return [this.encode85(value)];
		},
		function materialize_ArrayBuffer(obj, args) {
			return args
				&& checkSignature('ArrayBuffer', /^,string$/, obj, args)
				&& this.decode85(args[0]);
		}
	],
	[Int8Array, typedArraySerializer, typedArrayMaterializer('Int8Array', Int8Array)],
	[Uint8Array, typedArraySerializer, typedArrayMaterializer('Uint8Array', Uint8Array)],
	//[Uint8ClampedArray, typedArraySerializer, typedArrayMaterializer('Uint8ClampedArray', Uint8ClampedArray)],
	
].forEach(function (rec) {
	if (typeof rec[0] === 'function') { // PhantomJS' ArrayBuffer is weird.
		var id = identifier(rec[0], true);
		member(CONSTRUCTIONS, id, Object.freeze({
			identifier: id,
			type: rec[0],
			serializer: rec[1], 
			materializer: rec[2]
		}), 1);
	}
});

/** The pseudoconstruction `type` is used to serialize references to constructor functions of 
registered types. For example, `type(Date)` materializes to the `Date` function.
*/
function type(f) {
	this.typeConstructor = f;
}

member(CONSTRUCTIONS, 'type', type.__SERMAT__ = Object.freeze({
	identifier: 'type',
	type: type,
	serializer: function serialize_type(value) {
		var rec = this.record(value.typeConstructor);
		if (!rec) {
			raise('serialize_type', "Unknown type \""+ identifier(value.typeConstructor) +"\"!", { type: value.typeConstructor });
		} else {
			return [rec.identifier];
		}
	},
	materializer: function materialize_type(obj, args) {
		if (!args) {
			return null;
		} else if (checkSignature('type', /^,string$/, obj, args)) {
			var rec = this.record(args[0]);
			if (rec) {
				return rec.type;
			}
		}
		raise('materialize_type', "Cannot materialize construction for type("+ args +")!", { args: args });
	}
}), 1);

/** ## Wrap-up #####################################################################################

Here both `Sermat`'s prototype and singleton are set up. 
*/
function Sermat(params) {
	var __registry__ = {},
		__modifiers__ = {};
	member(this, 'registry', __registry__);
	member(this, 'register', register.bind(this, __registry__));
	member(this, 'remove', remove.bind(this, __registry__));
	
	params = params || {};
	member(this, 'modifiers', __modifiers__);
	member(__modifiers__, 'mode', coalesce(params.mode, BASIC_MODE), 5);
	member(__modifiers__, 'allowUndefined', coalesce(params.allowUndefined, false), 5);
	member(__modifiers__, 'autoInclude', coalesce(params.autoInclude, true), 5);
	member(__modifiers__, 'useConstructions', coalesce(params.useConstructions, true), 5);
	/** The constructors for Javascript's _basic types_ (`Boolean`, `Number`, `String`, `Object`, 
		and `Array`, but not `Function`) are always registered. Also `Date` and `RegExp` are
		supported by default.
	*/
	this.include('Boolean Number String Object Array Date RegExp type'.split(' '));
}

var __members__ = {
	BASIC_MODE: BASIC_MODE,
	REPEAT_MODE: REPEAT_MODE,
	BINDING_MODE: BINDING_MODE,
	CIRCULAR_MODE: CIRCULAR_MODE,
	CONSTRUCTIONS: CONSTRUCTIONS,
	
	identifier: identifier,
	record: record,
	include: include,
	exclude: exclude,
	
	serialize: serialize, ser: serialize,
	serializeAsProperties: serializeAsProperties,
	serializeAsType: serializeAsType,
	signature: signature, checkSignature: checkSignature,
	
	materialize: materialize, mat: materialize,
	construct: construct,
	materializeWithConstructor: materializeWithConstructor,
	
	encode85: encode85, decode85: decode85,
	
	sermat: sermat
};
Object.keys(__members__).forEach(function (id) {
	var m = __members__[id];
	member(Sermat.prototype, id, m);
});

/** Sermat can be used as a constructor of serializer/materializer components as well as a 
	singleton. Each instance has a separate registry of constructors.
*/
var __SINGLETON__ = new Sermat();

/** The constructions for `Date` and `RegExp` are registered globally. 
*/
__SINGLETON__.include(['Date', 'RegExp']);

Object.keys(__members__).forEach(function (id) {
	var m = __members__[id];
	member(Sermat, id, typeof m === 'function' ? m.bind(__SINGLETON__) : m);
});

['registry', 'register', 'remove', 'modifiers'].forEach(function (id) {
	member(Sermat, id, __SINGLETON__[id]);
});

/** Module layout.
*/
member(Sermat, '__package__', 'sermat');
member(Sermat, '__name__', 'Sermat');
member(Sermat, '__init__', __init__, 4);
member(Sermat, '__dependencies__', [], 4);

/** See __prologue__.js
*/
	return Sermat;
});
//# sourceMappingURL=sermat-umd.js.map