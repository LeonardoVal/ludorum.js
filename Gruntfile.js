/** Gruntfile for [ludorum.js](http://github.com/LeonardoVal/ludorum.js).
*/
var sourceFiles = [ 'src/__prologue__.js',
	'src/Game.js', 'src/Player.js', 'src/Match.js', 
		'src/Tournament.js', 'src/Aleatory.js',
	// players.
	'src/players/RandomPlayer.js', 'src/players/TracePlayer.js',
		'src/players/HeuristicPlayer.js', 
		'src/players/MaxNPlayer.js',
		'src/players/MiniMaxPlayer.js', 'src/players/AlphaBetaPlayer.js',
		'src/players/MonteCarloPlayer.js',
		'src/players/UserInterfacePlayer.js',
		'src/players/WebWorkerPlayer.js',
	// aleatories.
		'src/aleatories/Dice.js',
	// utils.
		'src/utils/Checkerboard.js', 
			'src/utils/CheckerboardFromString.js',
		'src/utils/Scanner.js',
	// games.
	'src/games/__Predefined__.js',  'src/games/Choose2Win.js',
		'src/games/ConnectionGame.js',
		'src/games/OddsAndEvens.js', 'src/games/TicTacToe.js',
		'src/games/ToadsAndFrogs.js', 'src/games/Mancala.js',
		'src/games/Pig.js', 'src/games/ConnectFour.js',
		'src/games/Mutropas.js',
	// tournaments.
	'src/tournaments/RoundRobin.js', 'src/tournaments/Measurement.js',
		'src/tournaments/Elimination.js',
// end
	'src/__epilogue__.js'];

// Init config. ////////////////////////////////////////////////////////////////
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat_sourcemap: { ////////////////////////////////////////////////////
			build: {
				src: sourceFiles,
				dest: 'build/<%= pkg.name %>.js',
				options: {
					separator: '\n\n'
				}
			},
		},
		karma: { ///////////////////////////////////////////////////////////////
			options: {
				configFile: 'tests/karma.conf.js'
			},
			build: { browsers: ['PhantomJS'] },
			chrome: { browsers: ['Chrome'] },
			firefox: { browsers: ['Firefox'] },
			opera: { browsers: ['Opera'] },
			iexplore: { browsers: ['IE'] }
		},
		uglify: { //////////////////////////////////////////////////////////////
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
		groc: { ////////////////////////////////////////////////////////////////
			build: ["src/**/*.js", "README.md"],
			options: {
				"out": "docs/",
				"style": "Default",
				"silent": true,
				"repository-url": "<%= pkg.repository.url %>"
			}
		}
	});

// Load tasks. /////////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-concat-sourcemap');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-groc');

// Register tasks. /////////////////////////////////////////////////////////////
	grunt.registerTask('build', 
		['concat_sourcemap:build', 'karma:build', 'uglify:build', 'groc:build']);
	grunt.registerTask('default', 
		['build']);
	grunt.registerTask('test', 
		['concat_sourcemap:build', 'karma:build', 'karma:chrome', 'karma:firefox', 
		'karma:opera', 'karma:iexplore']);
};