/** # Game tree

A data structure to help building game trees, i.e. trees in which each node is a game state, the
final states are leaves and each child node belongs to one of the next states of its parent.
*/
var GameTree = utils.GameTree = declare({
	/** Each instance represents a node in the game tree. The `parent` must be null or undefined at
	the root. The given `transition` is either the moves or the haps values used to move from the 
	parent's state to this node's state. They also must be null or undefined at the root.
	*/
	constructor: function GameTree(args) {
		this.parent = args && args.parent;
		this.state = args && args.state;
		this.transition = args && args.transition;
		this.probability = args && +args.probability;
		this.__children__ = args && args.children;
		this.children();
	},
	
	// ## Children #################################################################################

	children: function children() {
		if (!this.__children__) {
			if (!this.state) {
				return null;
			} else { 
				this.__children__ = this.possibleTransitions();
			}
		}
		return this.__children__;
	},

	/** Returns the possible moves is the state is an instance of Game, or the possible haps values 
	if the state is contingent.
	*/
	possibleTransitions: function possibleTransitions() {
		var state = this.state,
			Cons = this.constructor,
			parent = this;
		raiseIf(!state, "GameTree node has no state!");
		if (state.isContingent) {
			return state.possibleHaps().map(function (t) {
				var child = new Cons({ parent: parent, transition: t[0], probability: t[1] });
				return child;
			});
		} else {
			return state.possibleMoves().map(function (m) {
				return new Cons({ parent: parent, transition: m });
			});
		}
	},
	
	// ## Node expansion ###########################################################################

	/** .
	*/
	expand: function expand() {
		raiseIf(this.state, "Node `", this, "` is already expanded!");
		raiseIf(!this.parent, "Cannot expand node `", this, "` without a parent!");
		this.state = this.parent.state.next(this.transition);
		this.children();
		return this;
	},

	/** Children are `pending` when they have not been expanded yet. This method returns an array
	of these for this node.
	*/
	pending: function pending() {
		return this.children().filter(function (child) {
			return !child.state;
		});
	},
	
	/** Expands one of the given `nodes` at random. If `nodes` are not given, this node's pending
	children are used instead.
	*/
	expandRandom: function expandRandom(random, nodes) {
		random = random || Randomness.DEFAULT;
		nodes = nodes || this.pending();
		return nodes.length < 1 ? null :
			(nodes.length === 1 ? nodes[0] : random.choice(nodes)).expand();
	},

	// ## Utilities ###############################################################################

	toString: function toString() { //FIXME
		return 'GameTree('+ this.state +')';
	},

	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'GameTree',
		serializer: function serialize_GameTree(obj) {
			return [{ 
				parent: obj.parent, 
				state: obj.state, 
				transition: obj.transition, 
				probability: obj.probability,
				children: obj.children
			}];
		}
	}
}); // declare GameTree