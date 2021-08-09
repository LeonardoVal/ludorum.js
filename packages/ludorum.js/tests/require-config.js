// Generated code, please do NOT modify.
(function (config) { "use strict";
	define([], function () {
		if (window.__karma__) {
			config.baseUrl = '/base';
			for (var p in config.paths) {
				config.paths[p] = config.paths[p]
					.replace(/^\.\.\//, '/base/');
			}
			config.deps = Object.keys(window.__karma__.files) // Dynamically load all test files
				.filter(function (file) { // Filter test modules.
					return /\.test\.js$/.test(file);
				}).map(function (file) { // Normalize paths to RequireJS module names.
					return file.replace(/^\/base\/(.*?)\.js$/, '$1');
				});
		}
		require.config(config);
		console.log("RequireJS configuration: "+ JSON.stringify(config, null, '  '));

		return function (deps, main) {
			require(deps, function () {
				var args = Array.prototype.slice.call(arguments);
				args.forEach(function (module, i) {
					name = module.__name__ || deps[i];
					if (window.hasOwnProperty(name)) {
						console.error("Global `"+ name +"` already defined!");
					} else {
						window[name] = module;
						console.log("Loaded library `"+ deps[i] +"` is available as `window."+
							name +"`.");
					}
				});
				switch (typeof main) {
					case 'undefined': break;
					case 'function': main.apply(window, args); break;
					default: throw new Error('Invalid main function '+ main +'!');
				}
				console.log("Ready.");
			}, function (err) {
				console.error(err);
			});
		};
	});
})({
	"paths": {
		"ludorum": "../build/ludorum",
		"creatartis-base": "../node_modules/creatartis-base/build/creatartis-base.min",
		"sermat": "../node_modules/sermat/build/sermat-umd-min",
		"playtester": "../build/playtester-common"
	}
});