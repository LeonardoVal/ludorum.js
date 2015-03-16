/** Gruntfile for [ludorum.js](http://github.com/LeonardoVal/ludorum.js).
*/
var sourceFiles = [ 'src/__prologue__.js',
	'src/Game.js', 'src/Player.js', 'src/Match.js', 
		'src/Tournament.js', 'src/Aleatory.js',
	// utils.
		'src/utils/Checkerboard.js', 
			'src/utils/CheckerboardFromString.js',
		'src/utils/Scanner.js',
		'src/utils/Cache.js',
		'src/utils/GameTree.js',
	// players.
	'src/players/RandomPlayer.js', 'src/players/TracePlayer.js',
		'src/players/HeuristicPlayer.js', 
		'src/players/MaxNPlayer.js',
		'src/players/MiniMaxPlayer.js', 
			'src/players/AlphaBetaPlayer.js',
		'src/players/MonteCarloPlayer.js',
			'src/players/UCTPlayer.js',
		'src/players/UserInterfacePlayer.js',
		'src/players/WebWorkerPlayer.js',
	// aleatories.
		'src/aleatories/dice.js',
	// games.
	'src/games/Predefined.js',  'src/games/Choose2Win.js',
		'src/games/ConnectionGame.js',
		'src/games/OddsAndEvens.js', 'src/games/TicTacToe.js',
		'src/games/ToadsAndFrogs.js', 'src/games/Mancala.js',
		'src/games/Pig.js', 'src/games/ConnectFour.js',
		'src/games/Mutropas.js', 'src/games/Othello.js',
		'src/games/Bahab.js', 'src/games/Colograph.js',
	// tournaments.
	'src/tournaments/RoundRobin.js', 'src/tournaments/Measurement.js',
		'src/tournaments/Elimination.js',
// end
	'src/__epilogue__.js'];

// Init config. ////////////////////////////////////////////////////////////////
module.exports = function(grunt) {
	grunt.file.defaultEncoding = 'utf8';
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
		jshint: { //////////////////////////////////////////////////////////////
			build: {
				options: { // Check <http://jshint.com/docs/options/>.
					loopfunc: true,
					boss: true
				},
				src: ['build/<%= pkg.name %>.js'],
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
		karma: { ///////////////////////////////////////////////////////////////
			options: {
				configFile: 'tests/karma.conf.js'
			},
			build: { browsers: ['PhantomJS'] },
			chrome: { browsers: ['Chrome'] },
			firefox: { browsers: ['Firefox'] },
			iexplore: { browsers: ['IE'] }
		},
		docker: { //////////////////////////////////////////////////////////////
			build: {
				src: ["src/**/*.js", "README.md"],
				dest: "docs/docker",
				options: {
					colourScheme: 'borland',
					ignoreHidden: true,
					exclude: 'src/__prologue__.js,src/__epilogue__.js'
				}
			}
		},
		bowercopy: { ///////////////////////////////////////////////////////////
			options: {
				clean: true,
				runBower: true,
				srcPrefix: 'bower_components'
			},
			lib: {
				options: {
					destPrefix: 'lib'
				},
				files: {
					'jquery.js': 'jquery/jquery.js',
					'require.js': 'requirejs/require.js',
					'creatartis-base.js': 'creatartis-base/build/creatartis-base.js'
				},
			}
		}
	});
// Load tasks. /////////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-concat-sourcemap');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-docker');
	grunt.loadNpmTasks('grunt-bowercopy');
	grunt.loadNpmTasks('grunt-contrib-jshint');

// Custom tasks. ///////////////////////////////////////////////////////////////
	grunt.registerTask('bower-json', 'Writes <bower.json> based on <package.json>.', function() {
		var pkg = grunt.config.get('pkg'),
			bowerJSON = { // bower.json own members.
				"moduleType": ["amd", "globals", "node"],
				"authors": [pkg.author],
				"ignore": ["**/.*", "node_modules", "bower_components", "src", 
					"tests", "docs", "bower.json", "package.json", "Gruntfile.js", 
					"LICENSE.md", "README.md"],
				"dependencies": {
					"requirejs": "2.1.9",
					"creatartis-base": "~0.1.4"
				},
				"devDependencies": {
					"jquery": "~2.0.3"
				}
			};
		// Copy package.json members to bower.json.
		['name', 'description', 'version', 'keywords', 'licence', 'homepage',
		 'contributors', 'private', 'main', 'dependencies', 'devDependencies',
		 'optionalDependencies'].forEach(function (id) {
			if (pkg.hasOwnProperty(id) && !bowerJSON.hasOwnProperty(id)) {
				bowerJSON[id] = pkg[id];
			}
		});
		grunt.file.write('bower.json', JSON.stringify(bowerJSON, null, '\t'), { encoding: 'utf8' });
	}); // bower-json.
	
// Register tasks. /////////////////////////////////////////////////////////////
	grunt.registerTask('lib', ['bower-json', 'bowercopy:lib']);
	
	grunt.registerTask('compile', ['concat_sourcemap:build', 'jshint:build', 'uglify:build']); 
	grunt.registerTask('test', ['compile', 'karma:build']);
	grunt.registerTask('test-all', ['test', 'karma:chrome', 'karma:firefox', 'karma:iexplore', /*'karma:opera'*/]);
	grunt.registerTask('build', ['test', 'docker:build']);
	grunt.registerTask('default', ['build']);
};