﻿require.config({
	baseUrl: '../../../',
	paths: {
		'creatartis-base': 'node_modules/creatartis-base/build/creatartis-base',
		'sermat': 'node_modules/sermat/build/sermat-umd',
		'ludorum': 'build/ludorum',
		'playtester': 'build/playtester-common'
	}
});
require(['ludorum', 'creatartis-base', 'sermat', 'playtester'], function (ludorum, base, Sermat, PlayTesterApp) {
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

	/** PlayTesterApp initialization.
	*/
	base.global.APP = new PlayTesterApp(new ludorum.games.TicTacToe(), new TicTacToeHTMLInterface(),
		{ bar: document.getElementsByTagName('footer')[0] });
	APP.playerUI("You")
		.playerRandom()
		.playerMonteCarlo("MCTS (20 sims)", true, 20)
		.playerMonteCarlo("MCTS (80 sims)", true, 80)
		.playerAlfaBeta("MiniMax-\u03b1\u03b2 (4 plies)", true, 3)
		.playerAlfaBeta("MiniMax-\u03b1\u03b2 (6 plies)", true, 5)
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
		.selects(['playerXs', 'playerOs'])
		.button('resetButton', document.getElementById('reset'), APP.reset.bind(APP))
		.reset();
}); // require().
