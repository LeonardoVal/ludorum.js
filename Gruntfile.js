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
	// boards.
		'src/boards/Checkerboard.js', 'src/boards/CheckerboardFromString.js',
	// utils.
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
// end
	'src/__epilogue__.js'];

module.exports = function(grunt) {
// Init config. ////////////////////////////////////////////////////////////////
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
		docgen: { //////////////////////////////////////////////////////////////
			build: {
				src: sourceFiles,
				dest: 'docs/api.html'
			}
		}
	});

// Load tasks. /////////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-concat-sourcemap');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	require('./docs/docgen')(grunt); // In-house documentation generation.

// Register tasks. /////////////////////////////////////////////////////////////
	grunt.registerTask('default', ['concat_sourcemap', 'uglify', 'docgen']);
};