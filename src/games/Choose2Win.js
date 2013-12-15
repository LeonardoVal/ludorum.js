/** ludorum/src/games/Choose2Win.js:
	Simple silly game where players can instantly choose to win, loose, draw or
	just continue. Mostly for testing purposes.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
games.Choose2Win = basis.declare(Game, {
	/** new games.Choose2Win(turns=Infinity, activePlayer=players[0], winner=none):
		Choose2Win is a silly game indeed. Each turn one of the players can
		decide to win, to lose or to pass the turn. It is meant to be used 
		only for testing Ludorum, since a game can hardly become less 
		interesting than this.
	*/
	constructor: function Choose2Win(turns, activePlayer, winner) {
		Game.call(this, activePlayer);
		this.__turns__ = isNaN(turns) ? Infinity : +turns;
		this.__winner__ = winner;		
	},

	/** games.Choose2Win.players=['This', 'That']:
		Players of the dummy game.
	*/
	players: ['This', 'That'],

	/** games.Choose2Win.moves():
		Moves always are 'win', 'lose', 'pass'.
	*/
	moves: function moves() {
		if (!this.__winner__ && this.__turns__ > 0) {
			return basis.obj(this.activePlayer(), ['win', 'lose', 'pass']);
		}
	},

	/** games.Choose2Win.result():
		Victory for who chooses to win. Defeat for who chooses to lose. Draw 
		only when a limit of turns (if given) is met.
	*/
	result: function result() {
		return this.__winner__ ? this.victory(this.__winner__) :
			this.__turns__ < 1 ? this.draw() : null;
	},

	/** games.Choose2Win.next(moves):
		Moves must be always 'win', 'lose' or 'pass'.
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(),
			opponent = this.opponent(activePlayer);
		switch (moves[activePlayer]) {
			case 'win': return new this.constructor(this.__turns__ - 1, opponent, activePlayer);
			case 'lose': return new this.constructor(this.__turns__ - 1, opponent, opponent);
			case 'pass': return new this.constructor(this.__turns__ - 1, opponent);
			default: break; // So the lint would not complaint.
		}
		return basis.raise('Invalid move '+ moves[activePlayer] +' for player '+ activePlayer +'.');
	},
	
	args: function args() {
		return ['Choose2Win', this.__turns__, this.activePlayer(), this.__winner__];
	},
	
	toString: function toString() {
		//WARN JSON does not support Infinity nor -Infinity.
		return 'Choose2Win('+ this.__turns__ +","+ JSON.stringify(this.activePlayer()) +","+ JSON.stringify(this.__winner__) +')';
	}
}); // declare Choose2Win.
