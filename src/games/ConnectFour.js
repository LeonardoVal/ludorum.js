/** # ConnectFour.

Implementation of the [Connect Four game](http://en.wikipedia.org/wiki/Connect_Four), 
based on [`ConnectionGame`](ConnectionGame.js.html).
*/
games.ConnectFour = declare(games.ConnectionGame, {
	name: 'ConnectFour',

	/** The default `height` of the board is 6 ...
	*/
	height: 6,
	
	/** ... and the default `width` of the board is 7.
	*/
	width: 7,
	
	/** The default `lineLength` to win the game is 4.
	*/
	lineLength: 4,
	
	/** The game's players are Yellow and Red, since these are the classic 
	colours of the pieces.
	*/
	players: ['Yellow', 'Red'],
	
	/** The active players `moves()` are the indexes of every column that has 
	not reached the top height.
	*/
	moves: function moves() {
		var result = null;
		if (!this.result()) {
			var ms = [],
				board = this.board.string,
				offset = (this.height - 1) * this.width;
			for (var i = 0; i < board.length; ++i) {
				if (board.charAt(offset + i) === '.') {
					ms.push(i);
				}
			}
			if (ms.length > 0) {
				result = {};
				result[this.activePlayer()] = ms;
			}
		}
		return result;
	},

	/** The `next(moves)` game state drops a piece at the column with the index
	of the active player's move.
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(),
			board = this.board.string,
			column = +moves[activePlayer],
			height = this.height,
			width = this.width;
		for (var row = 0; row < height; ++row) {
			if (board.charAt(row * width + column) === '.') {
				return new this.constructor(this.opponent(), 
					this.board.place([row, column], activePlayer === this.players[0] ? '0' : '1'));
			}
		}
		throw new Error('Invalid move '+ JSON.stringify(moves) +'!');
	},
	
	// ## User intefaces #######################################################
	
	/** The `display(ui)` method is called by a `UserInterface` to render the
	game state. The only supported user interface type is `BasicHTMLInterface`.
	The look can be configured using CSS classes.
	*/
	display: function display(ui) {
		raiseIf(!ui || !(ui instanceof UserInterface.BasicHTMLInterface), "Unsupported UI!");
		var moves = this.moves(),
			activePlayer = this.activePlayer(),
			board = this.board;
		moves = moves && moves[activePlayer];
		var table = this.board.renderAsHTMLTable(ui.document, ui.container, function (data) {
				data.className = data.square === '.' ? 'ludorum-empty' : 'ludorum-player'+ data.square;
				data.innerHTML = data.square === '.' ? "&nbsp;" : "&#x25CF;";
				if (moves && moves.indexOf(data.coord[1]) >= 0) {
					data.move = data.coord[1];
					data.activePlayer = activePlayer;
					data.onclick = ui.perform.bind(ui, data.move, activePlayer);
				}
			});
		table.insertBefore(
			ui.build(ui.document.createElement('colgroup'), 
				Iterable.repeat(['col'], this.board.width).toArray()),
			table.firstChild
		);
		return ui;
	},
	
	// ## Utility methods ######################################################
	
	/** The serialization of the game is a representation of a call to its
	constructor (inherited from [`ConnectionGame`](ConnectionGame.js.html)).
	*/
	__serialize__: function __serialize__() {
		return [this.name, this.activePlayer(), this.board.string];
	}
}); // declare ConnectFour.