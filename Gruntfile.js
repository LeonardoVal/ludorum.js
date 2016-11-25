/** Gruntfile for [ludorum.js](http://github.com/LeonardoVal/ludorum.js).
*/
var path = require('path');

module.exports = function(grunt) {
	var SOURCE_FILES = [ '__prologue__',
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
			'aleatories/Aleatory', 'aleatories/UniformAleatory', 'aleatories/dice',
		// games.
		'games/Predefined', 'games/Choose2Win', 'games/ConnectionGame', 'games/OddsAndEvens',
			'games/TicTacToe', 'games/ToadsAndFrogs', 'games/Pig', 'games/Mutropas',
			'games/Bahab',
		// tournaments.
		'tournaments/RoundRobin', 'tournaments/Measurement', 'tournaments/Elimination',
	// end
		'__epilogue__'].map(function (path) { 
			return 'src/'+ path +'.js';
		});

	grunt.file.defaultEncoding = 'utf8';
// Init config. ////////////////////////////////////////////////////////////////////////////////////
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: { //////////////////////////////////////////////////////////////////////////////////
			options: {
				separator: '\n\n',
				sourceMap: true
			},
			build: {
				src: SOURCE_FILES,
				dest: 'build/<%= pkg.name %>.js'
			},
		},
		jshint: { //////////////////////////////////////////////////////////////////////////////////
			build: {
				options: { // Check <http://jshint.com/docs/options/>.
					loopfunc: true,
					boss: true
				},
				src: ['build/<%= pkg.name %>.js', 'tests/specs/*.js'],
			},
		},
		copy: { ////////////////////////////////////////////////////////////////////////////////////
			test: {
				files: [
					'node_modules/requirejs/require.js',
					'node_modules/creatartis-base/build/creatartis-base.js', 'node_modules/creatartis-base/build/creatartis-base.js.map',
					'node_modules/sermat/build/sermat-umd.js', 'node_modules/sermat/build/sermat-umd.js.map',
					'build/<%= pkg.name %>.js', 'build/<%= pkg.name %>.js.map'
					].map(function (f) {
						return { nonull: true, src: f, dest: 'tests/lib/'+ path.basename(f) };
					})
			}
		},
		uglify: { //////////////////////////////////////////////////////////////////////////////////
			build: {
				src: 'build/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js',
				options: {
					banner: '//! <%= pkg.name %> <%= pkg.version %>\n',
					report: 'min',
					sourceMap: true,
					sourceMapIn: 'build/<%= pkg.name %>.js.map',
					sourceMapName: 'build/<%= pkg.name %>.min.js.map'
				}
			}
		},
		karma: { ///////////////////////////////////////////////////////////////////////////////////
			options: {
				configFile: 'tests/karma.conf.js'
			},
			test_chrome: { browsers: ['Chrome'] },
			test_firefox: { browsers: ['Firefox'] }
		},
		docker: { //////////////////////////////////////////////////////////////////////////////////
			build: {
				src: ['src/**/*.js', 'README.md', 'docs/*.md'],
				dest: 'docs/docker',
				options: {
					colourScheme: 'borland',
					ignoreHidden: true,
					exclude: 'src/__prologue__.js,src/__epilogue__.js'
				}
			}
		}
	});
// Load tasks. /////////////////////////////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-docker');
	
// Register tasks. /////////////////////////////////////////////////////////////////////////////////
	grunt.registerTask('compile', ['concat:build', 'jshint:build', 'uglify:build', 'copy:test']); 
	grunt.registerTask('test', ['compile', 'karma:test_firefox']);
	grunt.registerTask('full-test', ['test', 'karma:test_chrome']);
	grunt.registerTask('build', ['test', 'docker:build']);
	grunt.registerTask('default', ['build']);
};