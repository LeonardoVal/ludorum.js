/** ## Class `Tournament`

A tournament is a set of matches played between many players. The whole contest 
ranks the participants according to the result of the matches. This is an 
abstract base class for many different types of contests.
*/
var Tournament = exports.Tournament = declare({
	constructor: function Tournament(game, players) {
		/** The tournament always has one [`game`](Game.html) state from which 
		all matches start.
		*/
		this.game = game;
		/** All the [`players`](Player.html) involved in the tournament must be
		provided to the constructor in an array.
		*/
		this.players = Array.isArray(players) ? players : iterables.iterable(players).toArray();
		this.statistics = new Statistics();
		this.events = new Events({ 
			events: ['begin', 'beforeMatch', 'afterMatch', 'end']
		});
	},

	/** The next match to be played is determined by `__advance__`, which 
	returns a match instance, or null if the tournament has finished. It is not 
	implemented in this base class. 
	*/
	__advance__: unimplemented("Tournament", "__advance__"),
	
	/** `Tournament.run()` plays all the tournament's matches. Since running a 
	match is asynchronous, running a tournament is too. Hence the result is 
	always a future, which will be resolved when all matches have been played.
	*/
	run: function run() {
		this.onBegin();
		var tournament = this;
		return Future.doWhile(function () {
			return Future.then(tournament.__advance__(), function (match) {
				if (match) {
					tournament.beforeMatch(match);
					return tournament.__runMatch__(match).then(function (match) {
						tournament.account(match);
						tournament.afterMatch(match);
						return match;
					});
				} else {
					return null;
				}
			});
		}).then(this.onEnd.bind(this));
	},
	
	/** The method `__runMatch__` runs a match. It is present so it can be 
	overridden, to implement some specific behaviour of the contest.
	*/
	__runMatch__: function __runMatch__(match) {
		return match.run();
	},
	
	/** Tournaments gather information from the played matches using their
	`statistics` property (instance of `basis.Statistics`). The method 
	`Tournament.account(match)` is called to accounts the results of each 
	finished match for the players' score.
	
	The match results are gathered in the `results` key. The keys `victories`,
	`defeats` and `draws` count each result type. The length of each game is
	recorded under `length`. The move count at each ply is aggregated under
	`width`. All these numbers are open by game, role, player.
	*/
	account: function account(match) {
		var game = this.game,
			results = match.result(), 
			isDraw = false,
			stats = this.statistics;
		raiseIf(!results, "Match doesn't have results. Has it finished?");
		iterable(match.players).forEach(function (p) { // Player statistics.
			var role = p[0],
				player = p[1],
				playerResult = results[p[0]];
			stats.add({key:'results', game:game.name, role:role, player:player.name}, 
				playerResult);
			stats.add({key:(playerResult > 0 ? 'victories' : playerResult < 0 ? 'defeats' : 'draws'),
				game:game.name, role:role, player:player.name}, playerResult);
			stats.add({key:'length', game:game.name, role:role, player:player.name}, 
				match.ply()); //FIXME This may not be accurate if the game has random variables.
			match.history.forEach(function (entry) {
				if (typeof entry.moves === 'function') {
					var moves = entry.moves();	
					if (moves && moves.hasOwnProperty(role) && moves[role].length > 0) {
						stats.add({key:'width', game:game.name, role:role, player:player.name}, 
							moves[role].length);
					}
				}
			})
		});
	},
	
	/** ### Events #############################################################
	
	Tournaments provide events to enable further analysis and control over it. 
	`Tournament.events` is the event handler. The emitted events are:
	*/
	
	/** + The `begin` event fired by `Tournament.onBegin()` when the whole 
	contest begins. The callbacks should have the signature 
	`function (tournament)`.
	*/	
	onBegin: function onBegin() {
		this.events.emit('begin', this);
		this.logger && this.logger.info('Tournament begins for game ', game.name, '.');
	},
	
	/** + The `beforeMatch` event triggered by `Tournament.beforeMatch(match)` 
	just before starting a match. The callbacks should have the signature 
	`function (match, tournament)`.
	*/
	beforeMatch: function beforeMatch(match) {
		this.events.emit('beforeMatch', match, this);
		this.logger && this.logger.debug('Beginning match with ', JSON.stringify(match.players), '.');
	},
	
	/** + The `afterMatch` event triggered by `Tournament.afterMatch(match)` 
	just after a match ends. The callbacks should have the signature 
	`function (match, tournament)`.
	*/
	afterMatch: function afterMatch(match) {
		this.events.emit('afterMatch', match, this);
		this.logger && this.logger.debug('Finishing match with ', JSON.stringify(match.players), '.');
	},
	
	/** + The `end` event triggered by `Tournament.onEnd()` when the whole 
	contest is completed. The callbacks should have the signature 
	`function (statistics, tournament)`.
	*/
	onEnd: function onEnd() {
		this.events.emit('end', this.statistics, this);
		this.logger && this.logger.info('Tournament ends for game ', game.name, ':\n', this.statistics, '\n');
	}
}); // declare Tournament

/** The namespace `ludorum.tournaments` holds several contest types implemented 
as Tournament subtypes.
*/
var tournaments = exports.tournaments = {};