/** Javascript for tester.html, a test case runner in HTML.
*/
var PATHS = {
		"basis": "lib/basis",
		"ludorum": "../ludorum"
	},
	TESTS = [ // Put new test case files here.
		'test_games', 'test_players', 'test_tournaments', 'test_Scanner', 
		'test_Checkerboard'
	];

function main() { "use strict";
	var menuDiv = document.getElementById('menu');
	require.config({ paths: PATHS });
	require(['basis'], function (basis) {
	// Configure logger.
		basis.Logger.ROOT
			.appendToHtml("log")
			.format = basis.Logger.ROOT.htmlFormat();
	// Define menu button click function.
		var runTest = function runTest(path) {
			basis.Logger.ROOT.info("Running test at <", path, ">.");
			return basis.Future.imports(path).then(function (imports) {
				var verifier = imports[0];
				verifier.logger = basis.Logger.ROOT;	
				return verifier.run();
			});
		};
	// Add button to run all test cases.
		var button = document.createElement('button');
		button.onclick = function () {
			basis.Future.sequence(TESTS, function (path) {
				return runTest(path);
			}).then(function () {
				basis.Logger.ROOT.info("Fin.");
			});
		};
		button.innerHTML = 'all';
		menuDiv.appendChild(button);
	// Add buttons for each test file.
		TESTS.forEach(function (test) {
			var button = document.createElement('button');
			button.onclick = runTest.bind(window, test);
			button.innerHTML = test.replace(/^test_/, '');
			menuDiv.appendChild(button);
		});
		/*
		basis.Future.sequence(TESTS, function (path) {
			basis.Logger.ROOT.info("Running test at <", path, ">.");
			return basis.Future.imports(path).then(function (imports) {
				var verifier = imports[0];
				verifier.logger = basis.Logger.ROOT;	
				return verifier.run();
			});
		}).then(function () {
			basis.Logger.ROOT.info("Fin.");
		});*/
	});
}