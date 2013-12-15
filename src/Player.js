/** ludorum/src/Player.js:
	Player is the base type for all playing agents.
 
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@contributors Gonzalo de Oliveira Madeira
	@licence MIT Licence
*/
// Players /////////////////////////////////////////////////////////////////////
	
var __PlayerCount__ = 0; // Used by the Player's default naming.

var Player = exports.Player = basis.declare({
	/** new Player(name):
		A player is an agent that plays a game. This means deciding which 
		move to make from the set of moves available to the player, each 
		time the game enables the player to do so.
		This is an abstract class that is meant to be extended.
	*/
	constructor: function Player(name) {
		this.name = ''+ (name || 'Player' + (__PlayerCount__++));
	},

	/** Player.__moves__(game, player):
		Get the moves in the game for the player, checks if there are any, 
		and if such is not the case it raises an error.
	*/
	__moves__: function __moves__(game, role) {
		var moves = game.moves();
		basis.raiseIf(!moves || !moves[role] || moves[role].length < 1, 
			"Player ", role, " has no moves for game ", game, ".");
		return moves[role];
	},

	/** Player.decision(game, player):
		Ask the player to make a move in the given name for the given player 
		(role). The result is the selected move if it can be obtained 
		synchronously, else a Future is returned.
	*/
	decision: function decision(game, role) {
		// Indeed not a very thoughtful base implementation.
		return this.__moves__(game, role)[0]; 
	},

	/** Player.participate(match, role):
		Called when the player joins a match, in order for the player to prepare
		properly. If this implies building another instance of the player 
		object, it must be returned in order to participate in the match.
	*/
	participate: function participate(match, role) {
		return this;
	},
	
	// Match commands. /////////////////////////////////////////////////////
	
	commandQuit: function commandQuit(role) {
		return { command: 'quit', role: role };
	},
	
	commandReset: function commandReset(role, ply) {
		return { command: 'reset', role: role, 
			ply: isNaN(ply) ? 0 : +ply 
		};
	},
}); // declare Player.

/** players:
	Bundle of Player subclasses and related definitions.
*/
var players = exports.players = {};
