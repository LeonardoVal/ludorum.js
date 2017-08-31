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
				'players/UCTPlayer', 'players/RuleBasedPlayer',
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
			{	name: 'creatartis-base',
				path: 'node_modules/creatartis-base/build/creatartis-base.js',
				id: 'base'
			},
			{	name: 'sermat',
				path: 'node_modules/sermat/build/sermat-umd.js',
				id: 'Sermat'
			}
		],
		otherCopy: [
			{ nonull: true, src: 'src/playtester-common.js', dest: 'build/playtester-common.js' }
		],
		perf: 'tests/perf/*.perf.js'
	});

	grunt.registerTask('default', ['build']);
};
