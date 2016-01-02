require.config({ paths: {
	'creatartis-base': '../../lib/creatartis-base', 
	'sermat': '../../lib/sermat-umd',
	'ludorum': '../../lib/ludorum',
	'playtester': '../../lib/playtester-common'
}});
require(['ludorum', 'creatartis-base', 'sermat', 'playtester'], function (ludorum, base, Sermat, PlayTesterApp) {
	var iterable = base.iterable,
		CheckerboardFromString = ludorum.utils.CheckerboardFromString;

	/** Custom HTML interface for Bahab.
	*/
	var BahabHTMLInterface = base.declare(ludorum.players.UserInterface.BasicHTMLInterface, {
		constructor: function BahabHTMLInterface() {
			ludorum.players.UserInterface.BasicHTMLInterface.call(this, {
				document: document, container: document.getElementById('board')
			});
		},
	
		/** Each of the board's squares looks are customized via CSS.
		*/
		classNames: { 
			'A': "ludorum-square-Uppercase-A", 'B': "ludorum-square-Uppercase-B",
			'a': "ludorum-square-Lowercase-A", 'b': "ludorum-square-Lowercase-B",
			'.': "ludorum-square-empty"
		},
		
		/** This is a mapping from the board to HTML for each of the board's squares.
		*/
		squareHTML: {
			'X': "X",
			'O': "O",
			'_': "&nbsp;"
		},
	
		display: function display(game) {
			this.container.innerHTML = ''; // empty the board's DOM.
			var ui = this,
				moves = game.moves(),
				activePlayer = game.activePlayer(),
				board = game.board,
				classNames = this.classNames,
				movesByFrom = moves ? iterable(moves[activePlayer]).groupAll(function (m) {
					return JSON.stringify(m[0]);
				}) : {},
				selectedMoves = ui.selectedPiece && 
					movesByFrom[JSON.stringify(ui.selectedPiece)].map(function (m) {
						return JSON.stringify(m[1]);
					});
			board.renderAsHTMLTable(ui.document, ui.container, function (data) {
				data.className = classNames[data.square];
				data.innerHTML = data.square == '.' ? '&nbsp;' : data.square;
				if (ui.selectedPiece) {
					if (selectedMoves && selectedMoves.indexOf(JSON.stringify(data.coord)) >= 0) {
						data.className = "ludorum-square-"+ activePlayer +"-move";
						data.onclick = function () {
							var selectedPiece = ui.selectedPiece;
							ui.selectedPiece = (void 0);
							ui.perform([selectedPiece, data.coord], activePlayer);
						};
					}
				}
				if (movesByFrom.hasOwnProperty(JSON.stringify(data.coord))) {
					data.onclick = function () {
						ui.selectedPiece = data.coord;
						ui.display(game); // Redraw the game state.			
					};
				}
			});
			return ui;
		}
	});
	
	/** PlayTesterApp initialization.
	*/
	base.global.APP = new PlayTesterApp(
		new ludorum.games.Bahab(), new BahabHTMLInterface(),
		//new ludorum.players.UserInterface.BasicHTMLInterface({ container: document.getElementById('board') }), 
		{ bar: document.getElementsByTagName('footer')[0] });
	APP.playerUI("You")
		.playerRandom()
		.playerMonteCarlo("MCTS (50 sims)", 50, true)
		.playerMonteCarlo("MCTS (100 sims)", 100, true)
		.playerAlfaBeta("MiniMax-\u03b1\u03b2 (4 plies)", 3, true)
		.playerAlfaBeta("MiniMax-\u03b1\u03b2 (6 plies)", 5, true)
		.playerMaxN("MaxN (6 plies)", 5, true)
		.selects(['playerUppercase', 'playerLowercase'])
		.button('resetButton', document.getElementById('reset'), APP.reset.bind(APP))
		.reset();
}); // require().
