/** Gruntfile for [ludorum.js](http://github.com/LeonardoVal/ludorum.js).
*/
module.exports = function(grunt) {
	var SOURCE_FILES = [ '__prologue__',
		'Game', 'Player', 'Match', 'Contingent', 'Tournament', 
		// utils.
			'utils/Checkerboard', 'utils/CheckerboardFromString', 'utils/CheckerboardFromPieces',
			'utils/Scanner', 'utils/Cache', 'utils/GameTree',
		// players.
		'players/RandomPlayer', 'players/TracePlayer', 'players/HeuristicPlayer', 'players/MaxNPlayer',
			'players/MiniMaxPlayer', 'players/AlphaBetaPlayer', 'players/MonteCarloPlayer', 
			'players/UCTPlayer', 'players/UserInterfacePlayer', 'players/WebWorkerPlayer',
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
			build: { browsers: ['PhantomJS'] },
			chrome: { browsers: ['Chrome'] },
			firefox: { browsers: ['Firefox'] },
			iexplore: { browsers: ['IE'] }
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
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-docker');

// Custom tasks. ///////////////////////////////////////////////////////////////////////////////////
	grunt.registerTask('test-lib', 'Copies libraries for the testing facilities to use.', function() {
		var path = require('path'),
			pkg = grunt.config.get('pkg');
		grunt.log.writeln("Copied to tests/lib/: "+ [
			'node_modules/requirejs/require.js',
			'node_modules/creatartis-base/build/creatartis-base.js',
			'node_modules/creatartis-base/build/creatartis-base.js.map',
			'node_modules/sermat/build/sermat-umd.js',
			'node_modules/sermat/build/sermat-umd.js.map',
			'build/'+ pkg.name +'.js', 
			'build/'+ pkg.name +'.js.map'
		].map(function (fileToCopy) {
			var baseName = path.basename(fileToCopy);
			grunt.file.copy('./'+ fileToCopy, './tests/lib/'+ baseName);
			return baseName;
		}).join(", ") +".");
	}); // test-lib
	
// Register tasks. /////////////////////////////////////////////////////////////////////////////////
	grunt.registerTask('compile', ['concat:build', 'jshint:build', 'uglify:build']); 
	grunt.registerTask('test', ['compile', 'test-lib', 'karma:build']);
	grunt.registerTask('test-all', ['test', 'karma:chrome', 'karma:firefox', 'karma:iexplore']);
	grunt.registerTask('build', ['test', 'docker:build']);
	grunt.registerTask('default', ['build']);
};