/** # Colograph

Implementation of the game Colograph, a competitive version of the classic 
[graph colouring problem](http://en.wikipedia.org/wiki/Graph_coloring).
*/ 	
games.Colograph = declare(Game, {
	/** The constructor takes the following arguments:
	*/
	constructor: function Colograph(args) {
		/** + `activePlayer`: There is only one active player per turn, and it 
			is the first player by default.
		*/
		Game.call(this, args ? args.activePlayer : undefined);
		initialize(this, args)
		/** + `colours`: The colour of each node in the graph is given by an
			array of integers, each being the node's player index in the players 
			array, or -1 for uncoloured nodes. By default all nodes are not 
			coloured, which is the initial game state.
		*/
			.object('colours', { defaultValue: {} })
		/** + `edges`: The edges of the graph are represented by an array of 
			arrays of integers, acting as an adjacency list. 
		*/
			.array('edges', { defaultValue: [[1,3],[2],[3],[]] })
		/** + `shapes`: Each of the graph's nodes can have a certain shape. This
			is specified by an array of strings, one for each node.
		*/
			.array('shapes', { defaultValue: ['circle', 'triangle', 'square', 'star'] })
		/** + `scoreSameShape=-1`: Score added by each coloured edge that binds 
			two nodes of the same shape.
		*/
			.number('scoreSameShape', { defaultValue: -1, coerce: true })
		/** + `scoreDifferentShape=-1`: Score added by each coloured edge that 
			binds two nodes of different shapes.
		*/
			.number('scoreDifferentShape', { defaultValue: -1, coerce: true });
	},
	
	name: 'Colograph',
	
	/** There are two roles in this game: Red and Blue.
	*/
	players: ['Red', 'Blue'],
	
	/** Scores are calculated for each player with the edges of their colour. An 
	edge connecting two nodes of the same colour is considered to be of that 
	colour.
	*/
	score: function score() {
		var points = {},
			shapes = this.shapes,
			colours = this.colours,
			scoreSameShape = this.scoreSameShape,
			scoreDifferentShape = this.scoreDifferentShape,
			startingPoints = this.edges.length;
		this.players.forEach(function (player) {
			points[player] = startingPoints;
		});
		iterable(this.edges).forEach(function (n1_edges, n1) {
			n1_edges.forEach(function (n2) {
				var k = n1 +','+ n2;
				if (colours.hasOwnProperty(k)) {
					points[colours[k]] += shapes[n1] === shapes[n2] ? scoreSameShape : scoreDifferentShape;
				}
			});
		});
		return points;
	},
	
	/** The game ends when the active player has no moves, i.e. when all nodes
	in the graph have been coloured. The match is won by the player with the
	greatest score.
	*/
	result: function result() {
		if (!this.moves()) { // If the active player cannot move, the game is over.
			var points = this.score(), 
				players = this.players;
			return this.zerosumResult(points[players[0]] - points[players[1]], players[0]);
		} else {
			return null; // The game continues.
		}
	},

	/** Every non coloured node is a possible move for the active player.
	*/
	moves: function moves() {
		var colours = this.colours, 
			uncoloured = [];
		for (var i = 0; i < this.edges.length; i++) {
			if (!this.colours.hasOwnProperty(i)) {
				uncoloured.push(i);
			}
		}
		return uncoloured.length < 1 ? null : obj(this.activePlayer(), uncoloured);
	},

	/** The result of any move is the colouring of one previously uncoloured 
	node with the active players's colour.
	*/
	next: function next(moves) {
		var activePlayer = this.activePlayer(), 
			move = +moves[activePlayer] >> 0;
		raiseIf(move < 0 || move >= this.colours.length, 
			'Invalid move: node ', move, ' does not exist in ', this, '.');
		raiseIf(this.colours[move] >= 0, 
			'Invalid move: node ', move, ' has already been coloured in ', this, '.');
		var newColours = copy(obj(move, activePlayer), this.colours);
		this.edges[move].forEach(function (n2) { // Colour edges from the one coloured in this move.
			if (newColours[n2] === activePlayer) {
				newColours[move +','+ n2] = activePlayer;
			}
		});
		this.edges.forEach(function (adjs, n1) { // Colour edges to the one coloured in this move.
			if (n1 !== move && adjs.indexOf(move) >= 0 && newColours[n1] === activePlayer) {
				newColours[n1 +','+ move] = activePlayer;
			} 
		});
		return new this.constructor({
			activePlayer: this.opponent(activePlayer),
			colours: newColours,
			edges: this.edges,
			shapes: this.shapes,
			scoreSameShape: this.scoreSameShape,
			scoreDifferentShape: this.scoreDifferentShape
		});
	},

	__serialize__: function __serialize__() {
		return [this.name, {
			activePlayer: this.activePlayer(), 
			colours: this.colours,
			edges: this.edges,
			shapes: this.shapes,
			scoreSameShape: this.scoreSameShape,
			scoreDifferentShape: this.scoreDifferentShape
		}];
	},
	
	// ## Game properties. #####################################################

	/** `edgeColour(node1, node2)` returns a colour (player index) if the nodes 
	are joined by an edge, and both have that same colour.
	*/
	edgeColour: function edgeColour(node1, node2) {
		var connected = this.edges[node1].indexOf(node2) >= 0 || this.edges[node2].indexOf(node1) >= 0,
			colour1 = this.colours[node1],
			colour2 = this.colours[node2];
		return connected && colour1 >= 0 && colour1 === colour2 ? colour1 : -1;
	},
	
	// ## Heuristics. ##########################################################
	
	/** `heuristics` is a namespace for heuristic evaluation functions to be 
	used with artificial intelligence methods such as Minimax.
	*/
	'static heuristics': {
		/** + `scoreDifference(game, player)` is a simple heuristic that uses
		the current score.
		*/
		scoreDifference: function scoreDifference(game, player) {
			var score = game.score(),
				result = 0;
			for (var p in score) {
				result += p === player ? score[p] : -score[p];
			}
			return result / game.edges.length / 2;
		}
	},
	
	// ## Graph generation. ####################################################

	/** One of the nice features of this game is the variety that comes from
	chaning the graph on which the game is played. `randomGraph` can be used to
	generate graphs to experiment with.
	*/
	'static randomGraph': function randomGraph(nodeCount, edgeCount, random) {
		nodeCount = Math.max(2, +nodeCount >> 0);
		edgeCount = Math.max(nodeCount - 1, +edgeCount >> 0);
		var edges = basis.iterables.range(nodeCount - 1).map(function (i) {
			return random.split(1, basis.iterables.range(i + 1, nodeCount).toArray());
		}).toArray();
		for (var n = edgeCount - (nodeCount - 1), pair, pair2; n > 0; n--) {
			pair = random.choice(edges);
			if (pair[1].length > 0) {
				pair2 = random.split(1, pair[1]);
				pair[0].push(pair2[0][0]);
				pair[1] = pair2[1];
				n--;
			}
		}
		edges = edges.map(function (pair) {
			return pair[0];
		});
		edges.push([]); // Last node has no edges.
		return edges;
	},
	
	/** `randomGame(params)` will generates a random Colograph game with a 
	random graph.
	*/
	'static randomGame': function randomGame(args) {
		params = base.initialize({}, params)
			.object('random', { defaultValue: randomness.DEFAULT })
			.integer('nodeCount', { defaultValue: 8, coerce: true })
			.integer('edgeCount', { defaultValue: 11, coerce: true })
			.integer('shapeCount', { defaultValue: 4, coerce: true, minimum: 1, maximum: 4 })
			.subject;
		var SHAPES = ['circle', 'triangle', 'square', 'star'];
		return new Colograph({ 
			edges: this.randomGraph(params.nodeCount, params.edgeCount, params.random),
			shapes: params.random.randoms(params.nodeCount, 0, params.shapeCount).map(function (r) {
				return SHAPES[r|0];
			}),
			scoreSameShape: 1
		});
	},
	
	// ## Human interface based on KineticJS. ##################################
	
	/** This legacy code is an implementation of a UI for Colograph using 
	[KineticJS](http://kineticjs.com/). Not entirely compatible yet.
	*/
	'static KineticUI': declare(UserInterface, {
		constructor: function KineticUI(args) {
			UserInterface.call(this, args);
			initialize(this, args)
				.string("container", { defaultValue: "colograph-container" })
				.object("Kinetic", { defaultValue: window.Kinetic })
				.integer('canvasRadius', { defaultValue: NaN, coerce: true })
				.integer('nodeRadius', { defaultValue: 15, coerce: true })
				.array('playerColours', { defaultValue: ['red', 'blue'] });
			if (isNaN(this.canvasRadius)) {
				this.canvasRadius = (Math.min(screen.width, screen.height) * 0.6) >> 1;
			}
			var stage = this.stage = new Kinetic.Stage({ 
					container: this.container, 
					width: this.canvasRadius * 2, 
					height: this.canvasRadius * 2 
				}),
				layer = this.layer = new Kinetic.Layer({ 
					clearBeforeDraw: true, 
					offsetX: -this.canvasRadius, 
					offsetY: -this.canvasRadius 
				}),
				game = this.match.state();
			stage.add(layer);
			setInterval(stage.draw.bind(stage), 1000 / 30);
			layer.destroyChildren();
			this.edges = {};
			this.nodes = {};
			this.drawEdges(game);
			this.drawNodes(game);
		},
		
		drawEdges: function drawEdges(game) {
			var angle = 2 * Math.PI / game.edges.length,
				radius = this.canvasRadius - this.nodeRadius * 2,
				ui = this;
			game.edges.forEach(function (n2s, n1) { // Create lines.
				n2s.forEach(function (n2) {
					var line = new ui.Kinetic.Line({
						points: [radius * Math.cos(angle * n1), radius * Math.sin(angle * n1),
								radius * Math.cos(angle * n2), radius * Math.sin(angle * n2)],
						stroke: "black", strokeWidth: 2
					});
					ui.edges[n1+','+n2] = line;
					ui.layer.add(line);
				});
			});
		},
		
		drawNodes: function drawNodes(game) {
			var angle = 2 * Math.PI / game.edges.length,
				radius = this.canvasRadius - this.nodeRadius * 2,
				ui = this;
			game.edges.forEach(function (adjs, n) {
				var shape,
					x = radius * Math.cos(angle * n),
					y = radius * Math.sin(angle * n);
				switch (game.shapes[n]) {
					case 'square': 
						shape = ui.drawSquare(x, y, ui.nodeRadius, n); break;
					case 'triangle': 
						shape = ui.drawTriangle(x, y, ui.nodeRadius, n); break;
					case 'star': 
						shape = ui.drawStar(x, y, ui.nodeRadius, n); break;
					default: 
						shape = ui.drawCircle(x, y, ui.nodeRadius, n);
				}
				shape.on('mouseover', function () {
					shape.setScale(1.2);
				});
				shape.on('mouseout', function () {
					shape.setScale(1);
				});
				shape.on('click tap', function () {
					ui.perform(n);
				});
				shape.setRotation(Math.random() * 2 * Math.PI);//FIXME
				ui.nodes[n] = shape;
				ui.layer.add(shape);
			});
		},
		
		drawCircle: function drawCircle(x, y, r, n) {
			return new this.Kinetic.Circle({ 
				x: x, y: y, radius: r,
				fill: "white", stroke: "black", strokeWidth: 2
			});
		},
		
		drawSquare: function drawSquare(x, y, r, n) {
			return new this.Kinetic.Rect({ 
				x: x, y: y, width: r * 2, height: r * 2,
				offsetX: r, offsetY: r,
				fill: "white", stroke: "black", strokeWidth: 2
			});
		},
		
		drawStar: function drawStar(x, y, r, n) {
			return new Kinetic.Star({ numPoints: 5,
				x: x, y: y, innerRadius: r * 0.6, outerRadius: r * 1.5,
				fill: 'white', stroke: 'black', strokeWidth: 2
			});
		},
		
		drawTriangle: function drawTriangle(x, y, r, n) {
			return new Kinetic.RegularPolygon({ sides: 3,
				x: x, y: y, radius: r * 1.25,
				fill: 'white', stroke: 'black', strokeWidth: 2
			});
		},
		
		display: function display(game) {
			this.updateEdges(game);
			this.updateNodes(game);
		},
		
		updateEdges: function updateEdges(game) {
			var ui = this;
			game.edges.forEach(function (n2s, n1) {
				n2s.forEach(function (n2) {
					var k = n1+','+n2;
					ui.edges[k].setStroke(game.colours[k] || "black");
				});
			});
		},
		
		updateNodes: function updateNodes(game) {
			var ui = this;
			game.edges.forEach(function (adjs, n) {
				var colour = game.colours[n];
				if (colour) {
					ui.nodes[n].setFill(colour);
					ui.nodes[n].off('mouseover mouseout click tap');
				}
			});
		}
	}) // KineticJSCircleUI.
	
}); // declare Colograph.	
