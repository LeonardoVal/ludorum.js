/** # Game tree

A data structure to help building game trees, i.e. trees in which each node is a game state, the
final states are leaves and each child node belongs to one of the next states of its parent.
*/
var GameTree = utils.GameTree = declare({
	/** Each instance represents a node in the game tree. The `parent` must be null or undefined at
	the root. The given `transition` is either the moves or the aleatory values used to move from 
	the parent's state to this node's state. They also must be null or undefined at the root.
	*/
	constructor: function GameTree(parent, state, transition) {
		this.parent = parent;
		this.state = state;
		this.transition = transition;
		if (state) {
			this.children = this.possibleTransitions();
		}
	},
	
	/** This node's `children` are stored in an object, hence getting the count is a little tricky.
	*/
	childrenCount: function childrenCount() {
		if (!this.children) {
			this.children = this.possibleTransitions();
		}
		return this.children.length;
	},
	
	/** A node expansion takes the `moves` to calculate the next state and creates the child node
	with it. If the node already exists, it is returned and none is created.
	*/
	expand: function expand(i) {
		raiseIf(i < 0 || i >= this.childrenCount(), "Cannot expand children ", i, "!");
		var child = this.children[i];
		if (!child.state) {
			try {
				child.state = child.parent.state.next(child.transition); 
			} catch (err) {
				raise("Node expansion for ", child.parent.state, " with ", 
					JSON.stringify(child.transition), " failed with: ", err);
			}
		}
		return child;
	},
	
	/** Expand a child at random.
	*/
	expandRandom: function expandRandom(random) {
		random = random || Randomness.DEFAULT;
		return this.expand(random.randomInt(this.childrenCount()));
	},

	/** Returns the possible moves is the state is an instance of Game, or the possible values if
	the state is an instance of Aleatory.
	*/
	possibleTransitions: function possibleTransitions() {
		var state = this.state,
			Cons = this.constructor,
			parent = this;
		raiseIf(!state, "GameTree node has no state!");
		if (state.isContingent) {
			return state.possibleHaps().map(function (t) {
				var child = new Cons(parent, null, t[0]);
				child.probability = t[1];
				return child;
			});
		} else {
			return state.possibleMoves().map(function (m) {
				return new Cons(parent, null, m);
			});
		}
	},
	
	/** A full expansion creates all children nodes for this node.
	*/
	expandAll: function expandAll() {
		var child;
		for (var i = 0, len = this.childrenCount; i < len; i++) {
			if (child.state) {
				try {
					child.state = child.parent.next(child.transition); 
				} catch (err) {
					raise("Node expansion for ", child.parent, " with ", 
						JSON.stringify(child.transition), " failed with: ", err);
				}
			}
		}
		return this.children;
	}
}); // declare GameTree