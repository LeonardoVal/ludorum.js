/** # Rule based players

Automatic players based on rules, either for evaluating game states or to choose moves.
*/
players.RuleBasedPlayer = declare(Player, {
	/** todo
	*/
	constructor: function RuleBasedPlayer(params) {
		players.HeuristicPlayer.call(this, params);
		initialize(this, params)
			/** + `rules` must be an array of functions that return either a move (if the rule 
				applies) or `null` (if the rule does not apply).
			*/
			.array('rules', { defaultValue: [] })
			/** + ``
			*/
			.func('features', { ignore: true })
			/** + the `random` generator must be an instance of `Randomness`. 
			*/
			.object('random', { defaultValue: Randomness.DEFAULT });
	},

	/** This function extracts the relevant `features` of the given game state. These data is the
	one passed to the rules.
	*/
	features: function features(game, role) {
		return [game, role]; // Please override.
	},
	
	/** To choose a move, the `rules` are checked in order. The first rule that fits decides the
	move to make. If no rule fits, a move is chosen randomly. If a rule returns a move that is not
	valid, it is ignored.
	*/
	decision: function decision(game, role) {
		var result = null,
			features = this.features(game, role),
			moves = this.movesFor(game, role);
		for (var i = 0, len = this.rules.length; i < len; i++) {
			result = this.rules[i].call(this, features);
			if (result !== null && moves.indexOf(result) >= 0) {
				return result;
			}
		}
		return this.random.choice(moves);
	},
	
	/** The rule method adds a rule to the players' list of rules.
	*/
	rule: function rule(f) {
		raiseIf(typeof(f) !== 'function', 'A rule must be in the form of a function!');
		this.rules.push(f);
		return this; // for chaining.
	},
	
	// ## Rule definition helpers ##################################################################
	
	/** The class `regExpRule` method builds a rule function based on a regular expression.
	*/
	'static regExpRule': function regExpRule(regExp, move) {
		return function (features) {
			return regExp.test(features) ? move : null;
		};
	},
	
	/** The instance method `regExpRule` adds a rule based on a regular expression to the players'
	list of rules.
	*/
	regExpRule: function regExpRule(regExp, move) {
		return this.rule(this.constructor.regExpRule(regExp, move));
	},
	
	// ## Rule based heuristics ####################################################################
	
	// ## Other utilities ##########################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'RuleBasedPlayer',
		serializer: function serialize_Player(obj) {
			var ser = Player.__SERMAT__.serializer(obj),
				args = ser[0];
			args.rules = obj.rules;
			if (obj.hasOwnProperty('features')) {
				args.features = obj.features;
			}
			return ser;
		}
	}
}); // declare RulePlayer.