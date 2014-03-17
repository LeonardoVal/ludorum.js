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
	// tournaments.
	'src/tournaments/RoundRobin.js', 'src/tournaments/Measurement.js',
// end
	'src/__epilogue__.js'];

module.exports = function(grunt) {
// Init config. ////////////////////////////////////////////////////////////////
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: { //////////////////////////////////////////////////////////////
			options: {
				separator: '\n\n'
			},
			build: {
				src: sourceFiles,
				dest: './<%= pkg.name %>.js',
			},
		},
		uglify: { //////////////////////////////////////////////////////////////
		  options: {
			banner: '//! <%= pkg.name %> <%= pkg.version %>\n',
			report: 'min'
		  },
		  build: {
			src: './<%= pkg.name %>.js',
			dest: './<%= pkg.name %>.min.js'
		  }
		},
		docgen: { //////////////////////////////////////////////////////////////
			build: {
				src: sourceFiles,
				dest: 'docs/api.html'
			}
		},
		markdown: { ////////////////////////////////////////////////////////////
			build: {
				files: [ {
					expand: true,
					src: 'docs/*.md',
					ext: '.html'
				}]
			}
		}
	});

// Load tasks. /////////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-markdown');
	require('./docs/docgen')(grunt); // In-house documentation generation.

// Register tasks. /////////////////////////////////////////////////////////////
	grunt.registerTask('default', ['concat', 'uglify', 'docgen', 'markdown']);
};