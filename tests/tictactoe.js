require(['require-config'], function (init) { "use strict";
init(['ludorum', 'creatartis-base', 'sermat', 'playtester'], function (ludorum, base, Sermat, PlayTesterApp) {
	var CheckerboardFromString = ludorum.utils.CheckerboardFromString;

	/** Custom HTML interface for TicTacToe.
	*/
	var TicTacToeHTMLInterface = base.declare(ludorum.players.UserInterface.BasicHTMLInterface, {
		constructor: function TicTacToeHTMLInterface() {
			ludorum.players.UserInterface.BasicHTMLInterface.call(this, {
				document: document, container: document.getElementById('board')
			});
		},

		/** Each of the board's squares looks are customized via CSS.
		*/
		classNames: {
			'X': "ludorum-square-Xs",
			'O': "ludorum-square-Os",
			'_': "ludorum-square-empty"
		},

		/** This is a mapping from the board to HTML for each of the board's squares.
		*/
		squareHTML: {
			'X': "X",
			'O': "O",
			'_': "&nbsp;"
		},

		display: function display(game) {
			var ui = this,
				activePlayer = game.activePlayer(),
				moves = game.moves(),
				board = game.board,
				classNames = this.classNames,
				squareHTML = this.squareHTML;
			this.container.innerHTML = ''; // empty the board's DOM.
			moves = moves && moves[activePlayer] && moves[activePlayer].length > 0;
			(new CheckerboardFromString(3, 3, game.board, '_'))
				.renderAsHTMLTable(ui.document, ui.container, function (data) {
					data.className = classNames[data.square];
					data.innerHTML = squareHTML[data.square];
					if (moves && data.square === '_') {
						data.move = data.coord[0] * 3 + data.coord[1];
						data.activePlayer = activePlayer;
						data.onclick = ui.perform.bind(ui, data.move, activePlayer);
					}
				});
		}
	});

	/** PlayTesterApp initialization. ************************************************************/
	var APP = new PlayTesterApp(new ludorum.games.TicTacToe(), new TicTacToeHTMLInterface(),
		{ bar: document.getElementsByTagName('footer')[0] });
	base.global.APP = APP;
	APP.SOLUTION = {};
	APP.playerUI("You")
		.playerRandom()
		.playerAlfaBeta("MiniMax-\u03b1\u03b2 (4 plies)", true, 3)
		.playerAlfaBeta("MiniMax-\u03b1\u03b2 (6 plies)", true, 5)
		.playerMonteCarlo("MCTS (100 sims)", true, 100, Infinity)
		.playerUCT("UCT (100 sims)", true, 100, Infinity)
		.playerMaxN("MaxN (6 plies)", true, 5)
		.player("Rule based", function () {
			return new ludorum.players.RuleBasedPlayer({
				features: function (game, role) {
					return game.board;
				},
				rules: [4, 0, 2, 6, 8].map(function (i) {
					return function (board) {
						return board.charAt(i) === '_' ? i : null;
					};
				})
			});
		}, false)
		.player("Solution", function () {
			return new ludorum.players.HeuristicPlayer({
				heuristic: function (game, player) {
					var k = game.equivalent()[0];
					return APP.SOLUTION[k] * (player === game.players[0] ? +1 : -1);
				}
			});
		}, false)
		.selects(['playerXs', 'playerOs'])
		.button('resetButton', document.getElementById('reset'), APP.reset.bind(APP))
		.reset();

	/* TicTacToe solution calculation ************************************************************/
	(function () {
		var par = new base.Parallel();
		return par.loadModule(ludorum, true).then(function () {
			return par.run('('+ function () {
				return ludorum.players.MiniMaxPlayer.solution(new ludorum.games.TicTacToe(), {
					gameKey: function (g) { 
						return g.equivalent()[0];
					}
				});
			} +')()');
		}).then(function (solution) {
			APP.SOLUTION = solution;
			console.log("Solution has "+ Object.keys(solution).length +" entries.");
		});
	})();
}); // init()
}); // require().
