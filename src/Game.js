/* eslint-disable no-mixed-operators */
import { fromArray, fromObject, Iterable } from '@creatartis/iterables';
import { raiseIf, unimplemented } from './utils';
import { Contingent } from './Contingent';

/** The class `ludorum.Game` is the base type for all games.
*/
export default class Game {
  /** `Game`'s constructor takes the active player/s. A player is active if and
   * only if it can move.
   *
   * @param {object} [args]
   * @param {string|string[]} [args.activeRoles] - Role/s that are active are
   *  allowed to perform actions, and hence have actions available.
   */
  constructor({ activeRoles }) {
    this.activateRoles(activeRoles);
  }

  /** The game's `name` is used mainly for displaying purposes.
   *
   * @property {string} [name]
   */
  get name() {
    return this.constructor.name;
  }

  /** The game `players` are specified in an array of role names (strings), that
   * the players can assume in a match of this game. For example: `"Xs"` and
   * `"Os"` in TicTacToe, or `"Whites"` and `"Blacks"` in Chess.
   */
  get players() { //FIXME rename to `roles`
    return [];
  }

  /** This method returns an object with every active player related to the
   * moves each can make in this turn. If the game has finished then a _falsy
   * value must be returned (`null` is recommended).
   *
   * @return {iterable<object>}
   * @example
   * { Player1: ['Rock', 'Paper', 'Scissors'], Player2: ['Rock', 'Paper', 'Scissors'] }
  */
  moves() {
    unimplemented(this.constructor.name || 'Game', 'moves()');
  }

  /** Once the players have chosen their moves, the method `next` is used to
   * perform the given moves. There isn't a default implementation of `next`, so
   * it must be overriden. It is strongly advised to check if the arguments are
   * valid.
   * 
   * @param {object} moves - Should be an object with a move for each active
   *   player. For example: `{ Player1: 'Rock', Player2: 'Paper' }`.
   * @param {object} haps - May be added if the game has random variables. It
   *   must have the same form as the `moves` argument, but instead of players
   * as keys it will have random variables as keys, e.g. `{ die1: 6, die2: 3 }`.
   * @param {boolean}	[update=false] - If true indicates that is not necessary
   *   to return a new game instance. Else (and by default) the returned
   *   resulting state is always a new game instance.
   * @return {Game}
  */
  next(__moves, __haps, __update) {
    unimplemented(this.constructor.name || 'Game', 'next(moves, haps, update)');
  }

  /** If the game is finished the result of the game is calculated with
   * `result()`. If the game is not finished, this function must return a
   * _falsy_ value (`null` is recommended).
   *
   * @return {object} An object with every player in the game related to a
   *   number. This number must be positive if the player wins, negative if the
   *   player loses or zero if the game is a tie. For example: `{ Player1: -1, Player2: +1 }`.
   */
  result() {
    unimplemented(this.constructor.name || 'Game', 'result()');
  }

  /** Some games may assign scores to the players in a finished game. This may
   * differ from the result, since the score sign doesn't have to indicate
   * victory or defeat. For example:
   *
   * + result: `{ Player1: -1, Player2: +1 }`
   *
   * + scores: `{ Player1: 14, Player2: 15 }`
   *
   * The method `scores()` returns the scores if such is the case. Also the
   * score may be defined for unfinished games. By default, it return the same
   * that `result()` does.
   *
   * @return {object}
   */
  scores() {
    return this.results();
  }

  /** In incomplete or imperfect information games players have different access
   * to the game state data. The method `view` returns a modified version of
   * this game, that shows only the information from the perspective of the
   * given player. The other information is modelled as aleatory variables.
   *
   * In this way searches in the game tree can be performed without revealing to
   * the automatic player information it shouldn't have access to (a.k.a
   * _cheating_).
   *
   * @param {string} player
   * @return {Game}
   */
  view(player) {
    return this;
  }

  // Player information ////////////////////////////////////////////////////////

  /** Method `isActive` checks if the given players are all active.
   *
   * @param {...string} players
   * @return {boolean}
   */
  isActive(...players) {
    for (const player of players) {
      if (this.activePlayers.indexOf(player) < 0) {
        return false;
      }
    }
    return true;
  }

  /** In most games there is only one active player per turn. The method
   * `activePlayer` returns that active player's role if there is one and only
   * one, else it raises an error.
   *
   * @return {string}
   */
  activePlayer() {
    const len = this.activePlayers.length;
    raiseIf(len < 1, 'There are no active players!');
    raiseIf(len > 1, 'More than one player is active!');
    return this.activePlayers[0];
  }

  /** Sets the `activePlayers` of this game state. Since this method changes the
   * current game state, use with care.
   *
   * @param {...string} activePlayers
   * @return {string[]}
   */
  activatePlayers(...activePlayers) {
    this.activePlayers = activePlayers.length > 0 ? activePlayers
      : [this.players[0]];
    return this.activePlayers;
  }

  /** All players in a game are assumed to be opponents. The method `opponents`
   * returns an array with the opponent roles of the given players, or of the
   * active players by default. If not all players are opponents this method can
   * be overriden.
   *
   * @param {string[]=null} players
   * @return {string[]}
   */
  opponents(players = null) {
    players = players || this.activePlayers;
    return this.players.filter((p) => players.indexOf(p) < 0);
  }

  /** Since most games have only two players, the method `opponent` conveniently
   * returns the opponent of the given player, or the active player by default.
   *
   * @param {string=null} player
   *
   */
  opponent(player = null) {
    const playerIndex = this.players.indexOf(player || this.activePlayer());
    return this.players[(playerIndex + 1) % this.players.length];
  }

  // Game flow /////////////////////////////////////////////////////////////////

  /** Since `next()` expects a moves object, the method `perform` pretends to
   * simplify simpler game mechanics. It performs the given moves for the given
   * players (activePlayer by default) and returns the next game state.
   *
   * @param {...any} args - List of pairs `move,player`, with the active player
   *   by default.
   */
  perform(...args) {
    const moves = {};
    let player;
    for (let i = 0; i < args.length; i += 2) {
      player = args[i + 1];
      if (typeof player === 'undefined') {
        player = this.activePlayer();
      }
      moves[player] = args[i];
    }
    return this.next(moves);
  }

  /** The method `moves` returns the available moves for each player. Yet this
   * is not the same as the `moves` objects that can be used with `next()` to
   * obtain a next game state. Furthermore, if there are more than one active
   * player per turn, the possible decisions can be build with all combinations
   * for all active players.
   *
   * The method `possibleMoves` calculates all possible `moves` objects based on
   * the result of `moves`. For example, if `moves` returns `{A:[1,2], B:[3,4]}`,
   * then `possibleMoves` would return `[{A:1, B:3}, {A:1, B:4}, {A:2, B:3}, {A:2, B:4}]`.
   *
   * @param {object=null} moves
   * @return {iterable<object>}
   */
  possibleMoves(moves = null) {
    moves = moves || this.moves();
    if (!moves || typeof moves !== 'object') {
      return [];
    }
    const activePlayers = Object.keys(moves);
    if (activePlayers.length === 1) { // Most common case.
      const activePlayer = activePlayers[0];
      return moves[activePlayer].map((move) => [{ [activePlayer]: move }]);
    }
    // Simultaneous games.
    const moveCombinations = fromObject(moves)
      .map(([player, ms]) => ms.map((move) => [player, move]));
    return Iterable.product(...moveCombinations)
      .map((playerMoves) => fromArray(playerMoves).toObject());
  }

//TODO ES8 conversion pending from this point on.

  /** Game states that depend on random variables are `Contingent` game states.
   * The `contingent` method is a shortcut to make such states based on the
   * current game state.
   */
  contingent(moves, aleatories, update) {
    return new Contingent(this, moves, aleatories, update);
  }

  /** A `randomNext` picks one of the next states at random.
   */
  randomNext(random, update) {
    const allMoves = this.moves();
    const randomMoves = {};
    this.activePlayers.forEach((activePlayer) => {
      randomMoves[activePlayer] = random.choice(allMoves[activePlayer]);
    });
    return {
      state: this.next(randomMoves, null, update),
      moves: randomMoves,
    };
  }

  // ## Result functions #######################################################

  /** The maximum and minimum results may be useful and even required by some
   * game search algorithm. To expose these values, `resultBounds()` returns an
   * array with first the minimum and then the maximum. Most game have one type
   * of victory (+1) and one type of defeat (-1). That's why `resultBounds()`
   * returns [-1,+1] by default. Yet some games can define different bounds by
   * overriding it.
   */
  get resultBounds() {
    return [-1, +1];
  }

  /** The `normalizedResult(result=this.result())` is the `result()` expressed
   * so the minimum defeat is equal to -1 and the maximum victory is equal to
   * +1.
   */
  normalizedResult(result) {
    result = result || this.result();
    let bounds;
    if (result && typeof result === 'object') {
      bounds = this.resultBounds();
      result = base.copy(result);
      for (const player in result) {
        result[player] = (result[player] - bounds[0]) / (bounds[1] - bounds[0]) * 2 - 1;
      }
      return result;
    }
    if (typeof result === 'number') {
      bounds = this.resultBounds();
      return (+result - bounds[0]) / (bounds[1] - bounds[0]) * 2 - 1;
    }
    return null;
  }

  /** Most games have victory and defeat results that cancel each other. It is
   * said that all the victors wins the defeated player loses. Those games are
   * called _zerosum games_. The method `zerosumResult(score, players=activePlayers)`
   * builds a game result object for a zerosum game.
   * The given score is split between the given players (the active players by
   * default), and (-score) is split between their opponents.
   */
  zerosumResult(score, players) {
    players = !players ? this.activePlayers : (!Array.isArray(players) ? [players] : players);
    score = (+score) / (players.length || 1);
    const opponentScore = -score / (this.players.length - players.length || 1);
    return iterable(this.players).map(
      (player) => [player, players.indexOf(player) < 0 ? opponentScore : score],
    ).toObject();
  }

  /** There are two shortcuts for `zerosumResult()`. First `victory(players=activePlayers, score=1)`
   * returns the zero-sum game result with the given players (or the active
   * players by default) as winners, and their opponents as losers.
   */
  victory(players, score) {
    return this.zerosumResult(score || 1, players);
  }

  /** Second `defeat(players=activePlayers, score=-1)` returns the zero-sum game
   * result with the given players (or the active players by default) as losers,
   * and their opponents as winners.
   */
  defeat(players, score) {
    return this.zerosumResult(score || -1, players);
  }

  /** Finally `tied(players=this.players, score=0)` returns the game result of a
   * tied game with the given players (or the active players by default) all
   * with the same score (zero by default).
   * A tied game must always have the same result for all players.
	 */
  tied(players, score) {
    score = +(score || 0);
    return iterable(players || this.players).map(function (p) {
      return [p, score];
    }).toObject();
  }

  // ## Game information #######################################################

  /** Some AI algorithms have constraints on which games they can support. A
   * game can provide some information to assess its compatibility with an
   * artificial player automaticaly. Properties may include:
     + `isZeroSum`: The sum of all results in every match is zero. True by
       default.
   */
  get isZeroSum() {
    return true;
  }

  /** + `isDeterministic`: Perfect information game without random variables.
   *    False by default.
   */
  get isDeterministic() {
    return false;
  }

  /** + `isSimultaneous`: In some or all turns more than one player is active.
   *    False by default.
   */
  get isSimultaneous() {
    return false;
  }

  // ## Conversions & presentations ############################################

  /** Some algorithms require a `__hash__()` for each game state, in order to
   * store them in caches or hash tables. The default implementation uses
   * `Sermat.hashCode`.
   */
  __hash__() {
    return Sermat.hashCode(this).toString(36);
  }

  /** Based on the game's serialization, `clone()` creates a copy of this game
   * state.
   */
  clone() {
    return Sermat.clone(this);
  }

  /** The default string representation of a game is equal to its serialization
   * with Sermat.
   */
  toString() {
    return Sermat.ser(this);
  }

  // ## Game implementation ####################################################

  /** `make` is a shortcut for making a subclass of `Game`.
   */
  static make(members) {
    members = copy({}, members);

    if (!members.hasOwnProperty('name') && typeof members.constructor === 'function') {
      members.name = members.constructor.name;
    }
    raiseIf(typeof members.name !== 'string' || !members.name, "A game must have a `name`!");
    raiseIf(!Array.isArray(members.players), "A game must have `players`!");
    return declare(this, members);
  }

  /** `cacheProperties` modifies getter methods (like `moves()` or `result()`)
   * to cache its results. Warning! Caching the results of the `next()` method
   * may lead to memory leaks or overload.
	 */
  static cacheProperties() {
    const clazz = this;
    Array.prototype.slice.call(arguments).forEach(function (propertyName) {
      const cacheName = '__' + propertyName + '$cache__',
        originalGetter = clazz.prototype[propertyName];
      clazz.prototype[propertyName] = function () {
        if (arguments.length > 0) {
          return originalGetter.apply(this, arguments);
        } else if (!this.hasOwnProperty(cacheName)) {
          this[cacheName] = originalGetter.call(this);
        }
        return this[cacheName];
      };
    });
    return clazz;
  } // static cacheProperties

  /** `serialized(game)` builds a serialized version of a simultaneous game,
   * i.e. one in which two or more players may be active in the same turn. It
   * converts a simultaneous game to an alternated turn based game. This may be
   * useful for using algorithms like MiniMax to build AIs for simultaneous
   * games.
	 */
  static serialized(game) {
    const super_moves = game.prototype.moves;
    const super_next = game.prototype.next;
    return declare(game, {
      /** The `moves()` of a serialized game returns the moves of the player
       * deemed as the active player, if there are any moves.
			 */
      moves() {
        const fixedMoves = this.__fixedMoves__ || (this.__fixedMoves__ = {});
        const allMoves = super_moves.call(this);
        let activePlayer;
        for (let i = 0; i < this.activePlayers.length; i++) {
          if (fixedMoves.hasOwnProperty(this.activePlayers[i])) {
            activePlayer = this.activePlayers[i];
            break;
          }
        }
        return activePlayer && allMoves ? obj(activePlayer, allMoves[activePlayer]) : null;
      },

      /** The `next(moves)` of a serialized game advances the actual game if
       * with the given move all active players in the real game state have
       * moved. Else the next player that has to move becomes active.
			 */
      next(moves) {
        const nextFixedMoves = copy({}, this.fixedMoves || {}, moves);
        const allMoved = iterable(this.players).all(function (p) {
          return nextFixedMoves.hasOwnProperty(p);
        });
        let result;
        if (allMoved) {
          result = super_next.call(this, nextFixedMoves);
          result.fixedMoves = {};
        } else {
          result = this.clone();
          result.fixedMoves = nextFixedMoves;
        }
        return result;
      }
    });
  } // static serialized

} // class Game.
