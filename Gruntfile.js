/** Gruntfile for basis.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
var umdWrapper = function (init) {
	if (typeof define === 'function' && define.amd) {
		define(['basis'], init); // AMD module.
	} else if (typeof module === 'object' && module.exports) {
		module.exports = init(require('basis')); // CommonJS module.
	} else {
		var global = (0, eval)('this');
		global.inveniemus = init(global.basis); // Global namespace.
	}
};

var sourceFiles = [
	'src/Game.js', 'src/Player.js', 'src/Match.js', 
		'src/Tournament.js', 'src/Aleatory.js',
	'src/players/RandomPlayer.js', 'src/players/TracePlayer.js',
		'src/players/HeuristicPlayer.js', 'src/players/MiniMaxPlayer.js',
		'src/players/MonteCarloPlayer.js',
		'src/players/UserInterfacePlayer.js',
	'src/games/__Predefined__.js',  'src/games/Choose2Win.js',
		'src/games/OddsAndEvens.js', 'src/games/TicTacToe.js',
		'src/games/ToadsAndFrogs.js', 'src/games/Mancala.js',
		'src/games/Pig.js',
	'src/tournaments/RoundRobin.js', 'src/tournaments/Measurement.js',
	'src/aleatories/Dice.js'
];

module.exports = function(grunt) {
// Init config. ////////////////////////////////////////////////////////////////
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: { //////////////////////////////////////////////////////////////
			options: {
				separator: '\n\n',
				banner: '"use strict"; ('+ umdWrapper +')(function (basis){ var exports = {};\n',
				footer: '\nreturn exports;\n});'
			},
			build: {
				src: sourceFiles,
				dest: './<%= pkg.name %>.js',
			},
		},
		uglify: { //////////////////////////////////////////////////////////////
		  options: {
			banner: '//! <%= pkg.name %> <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n',
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