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
		this.children = {};
	},
	
	/** This node's `children` are stored in an object, hence getting the count is a little tricky.
	*/
	childrenCount: function childrenCount() {
		return Object.keys(this.children).length;
	},
	
	/** In the `children` object nodes are stored with a serialization of their transitions as keys.
	By default the JSON _"strinigification"_ is used.
	*/
	__childSerialization__: function __childSerialization__(moves) {
		return JSON.stringify(moves);
	},
	
	/** A node expansion takes the `moves` to calculate the next state and creates the child node
	with it. If the node already exists, it is returned and none is created.
	*/
	expand: function expand(transition) {
		var key = this.__childSerialization__(transition),
			child = this.children[key],
			nextState;
		if (!child) {
			try {
				nextState = this.state.next(transition); 
			} catch (err) {
				raise("Node expansion for ", this.state, " with ", JSON.stringify(transition),
					" failed with: ", err);
			}
			child = new this.constructor(this, nextState, transition);
			this.children[key] = child;
		}
		return child;
	},
	
	/** Returns the possible moves is the state is an instance of Game, or the possible values if
	the state is an instance of Aleatory.
	*/
	possibleTransitions: function possibleTransitions() {
		var state = this.state;
		if (state.isContingent) {
			return iterable(state.possibleHaps()).select(0).toArray();
		} else {
			return state.possibleMoves();
		}
	},
	
	/** A full expansion creates all child nodes for this node.
	*/
	expandAll: function expandAll() {
		var node = this;
		return this.possibleTransitions().map(function (transition) {
			return node.expand(// An array as transition means it belongs to a contingent state
				Array.isArray(transition) ? transition[0] : transition);
		});
	}
}); // declare GameTree