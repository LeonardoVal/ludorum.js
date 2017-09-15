(function () { "use strict";
	var config = {
		paths: {
			"ludorum": "../build/ludorum",
			"creatartis-base": "../node_modules/creatartis-base/build/creatartis-base.min",
			"sermat": "../node_modules/sermat/build/sermat-umd-min",
			"playtester": "../build/playtester-common"
		}
	};
	require.config(config);
	console.log("RequireJS configuration: "+ JSON.stringify(config, null, '  '));
})();
