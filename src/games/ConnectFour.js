games.ConnectFour = declare(games.ConnectionGame, {
	/** games.ConnectFour.height=6:
		Number of rows in the ConnectFour board.
	*/
	height: 6,
	
	/** games.ConnectFour.width=7:
		Number of columns in the ConnectFour board.
	*/
	width: 7,
	
	/** games.ConnectFour.lineLength=4:
		Length of the line required to win.
	*/
	lineLength: 4,
	
	name: 'ConnectFour',
	
	/** games.ConnectFour.players=['Yellow', 'Red']:
		Connect Four's players.
	*/
	players: ['Yellow', 'Red'],
	
	/** games.ConnectFour.moves():
		Return the index of every column that has not reached the top height.
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

	/** games.ConnectFour.next(moves):
		Each ConnectFour move is a column index.
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
	
	/** games.ConnectFour.toHTML():
		Renders the ConnectFour board as a HTML table.
	*/
	toHTML: function toHTML() {
		var moves = this.moves(),
			activePlayer = this.activePlayer(),
			board = this.board;
		moves = moves && moves[activePlayer];
		return '<table>'+
			'<colgroup>'+ '<col/>'.repeat(this.board.width) +'</colgroup>'+
			board.horizontals().reverse().map(function (line) {
				return '<tr>'+ line.map(function (coord) {
					var data = '',
						value = board.square(coord);
					if (moves && moves.indexOf(coord[1]) >= 0) {
						data = ' data-ludorum="move: '+ coord[1] +', activePlayer: \''+ activePlayer +'\'"';
					}
					return (value === '.') ? '<td '+ data +'>&nbsp;</td>'
						: '<td class="ludorum-player'+ value +'" '+ data +'>&#x25CF;</td>';
				}).join('') +'</tr>';
			}).join('') + '</table>';
	},
	
	__serialize__: function __serialize__() {
		return [this.name, this.activePlayer(), this.board.string];
	}
}); // declare ConnectFour.