/** Gruntfile for [ludorum.js](http://github.com/LeonardoVal/ludorum.js).
*/
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	});

	require('creatartis-grunt').config(grunt, {
		sourceNames: ['__prologue__',
			'Game', 'Player', 'Match', 'Contingent', 'Tournament',
			// utils.
				'utils/Checkerboard', 'utils/CheckerboardFromString', 'utils/CheckerboardFromPieces',
				'utils/Scanner', 'utils/Cache', 'utils/GameTree',
			// players.
			'players/RandomPlayer', 'players/TracePlayer', 'players/HeuristicPlayer', 'players/MaxNPlayer',
				'players/MiniMaxPlayer', 'players/AlphaBetaPlayer', 'players/MonteCarloPlayer',
				'players/UCTPlayer', 'players/RuleBasedPlayer', 'players/EnsemblePlayer',
				'players/UserInterfacePlayer', 'players/WebWorkerPlayer',
			// aleatories.
				'aleatories/Aleatory', 'aleatories/DieAleatory', 'aleatories/aleatories',
			// games.
			'games/Predefined', 'games/Choose2Win', 'games/ConnectionGame', 'games/OddsAndEvens',
				'games/TicTacToe', 'games/ToadsAndFrogs', 'games/Pig', 'games/Mutropas',
				'games/Bahab', 'games/Puzzle15',
			// tournaments.
			'tournaments/RoundRobin', 'tournaments/Measurement', 'tournaments/Elimination',
			'__epilogue__'],
		deps: [
			{ id: 'creatartis-base', name: 'base' },
			{ id: 'sermat', name: 'Sermat', path: 'node_modules/sermat/build/sermat-umd-min.js' },
			{ id: 'playtester', path: 'build/playtester-common.js',
				dev: true, module: false }
		],
		copy: {
			'build/': 'src/playtester-common.js'	
		},
		perf: true,
		connect: {
			console: 'tests/console.html',
			bahab: 'tests/bahab.html',
			tictactoe: 'tests/tictactoe.html'
		}
	});

	grunt.registerTask('default', ['build']);
	grunt.registerTask('console', ['compile', 'docker:build', 'connect:console']);
	grunt.registerTask('bahab', ['bahab', 'connect:bahab']);
	grunt.registerTask('tictactoe', ['tictactoe', 'connect:tictactoe']);
};
