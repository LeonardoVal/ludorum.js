/** # Choose2Win

Choose2Win is a simple silly game. Each turn one of the players can decide to win, to lose or to 
pass the turn. It is meant to be used only for testing Ludorum, since a game can hardly become less 
interesting than this.
*/
games.Choose2Win = declare(Game, {
	/** The constructor takes a number of turns for the game to last (`Infinity` by default), the 
	active player and the winner if the game has ended. 
	*/
	constructor: function Choose2Win(turns, activePlayer, winner) {
		Game.call(this, activePlayer);
		this.__turns__ = isNaN(turns) ? Infinity : +turns;
		this.__winner__ = winner;		
	},

	name: 'Choose2Win',
	
	/** Players of this dummy game are labeled This and That.
	*/
	players: ['This', 'That'],

	/** Every turn the active player's moves are: `'win'`, `'lose'` and `'pass'`.
	*/
	moves: function moves() {
		if (!this.__winner__ && this.__turns__ > 0) {
			return obj(this.activePlayer(), ['win', 'lose', 'pass']);
		}
	},

	/** Victory is for whom chooses to win first. Defeat is for whom chooses to lose first. A draw 
	only results when the limit of turns (if any) is met.
	*/
	result: function result() {
		return this.__winner__ ? this.victory(this.__winner__) :
			this.__turns__ < 1 ? this.draw() : null;
	},

	/** If a player moves to win or lose, a final game state is returned. Else the game goes on.
	*/
	next: function next(moves, haps, update) {
		var activePlayer = this.activePlayer(),
			opponent = this.opponent(activePlayer);
		raiseIf(!moves.hasOwnProperty(activePlayer), 
			'No move for active player ', activePlayer, ' at ', this, '!');
		raiseIf(haps, 'Haps are not required (given ', haps, ')!');
		var winner = { win: activePlayer, lose: opponent, pass: undefined },
			move = moves[activePlayer];
		if (!winner.hasOwnProperty(move)) {
			raise('Invalid move ', moves[activePlayer], ' for ', activePlayer, ' at ', this, '!');
		} else if (update) {
			this.activatePlayers(opponent);
			this.__turns__--;
			this.__winner__ = winner[move];
			return this;
		} else {
			return new this.constructor(this.__turns__ - 1, opponent, winner[move]);
		}
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Choose2Win',
		serializer: function serialize_Choose2Win(obj) {
			var r = [obj.__turns__, obj.activePlayer()];
			if (obj.__winner__) {
				r.push(obj.__winner__);
			}
			return r;
		}
	}
}); // declare Choose2Win.