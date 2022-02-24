import { Game, iterables, ListAleatory } from '@ludorum/core';
import { Randomness } from '@creatartis/randomness';

const ROLES = ['Left', 'Right'];
const DEFAULT_SCORE = { [ROLES[0]]: 0, [ROLES[1]]: 0 };
const ACTIONS = { HOLD: 'hold', ROLL: 'roll' };
const { abs, floor, sign } = Math;
const { permutations } = iterables;

/** Mutropas is a game invented for Ludorum as a simple example of a game of
 * hidden (a.k.a. incomplete) information. It is also a simultaneous game.
*/
class Mutropas extends Game {
  /** @inheritdoc */
  static get name() {
    return 'Mutropas';
  }

  /** Builds a new Mutropas game state:
   *
   * @param {object} [args.pieces] - An object with the available pieces for each
   *   player. By default pieces get randomly dealt.
   * @param {number[]} [args.playedPieces] - The array of pieces already played.
   * @param {object} [args.scores] - An object with current score for each
   *   player (0 by default for all players).
  */
  constructor(args = null) {
    const {
      pieces, playedPieces, scores,
    } = args || {};
    super(args);
    this
      ._prop('pieces', pieces, 'object', this.dealPieces())
      ._prop('playedPieces', playedPieces, Array, [])
      ._prop('scores', scores, 'object', DEFAULT_SCORE);
  }

  /** All the pieces to be used in Mutropas. By default are the numbers from 0
   * to 8.
  */
  get allPieces() {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8];
  }

  /** The method `dealPieces` is used to split the pieces randomly between all
   * players. Half the pieces go to each player, and one is left out.
  */
  dealPieces(random) {
    const { allPieces, roles: [role0, role1] } = this;
    random ||= Randomness.DEFAULT;
    const piecesPerPlayer = floor(allPieces.length / 2);
    const [split0, rest] = random.split(piecesPerPlayer, allPieces);
    const [split1] = random.split(piecesPerPlayer, rest);
    return { [role0]: split0, [role1]: split1 };
  }

  /** Being a imperfect information game, Mutropas is not deterministic.
   *
   * @property {boolean}
  */
  get isDeterministic() {
    return false;
  }

  /** Mutropas is a simultaneous game, meaning that both players play at the
   * same time, instead of taking turns.
   *
   * @property {boolean}
  */
  get isSimultaneous() {
    return true;
  }

  /** Players for Mutropas are named `Left` and `Right`.
   *
   * @property {string[]}
  */
  get roles() {
    return [...ROLES];
  }

  /** All roles are active in every turn.
   *
   * @property {string[]}
  */
  get activeRoles() {
    return [...this.roles];
  }

  /** Mutropas is a simultaneous game. Hence every turn all players can move.
   * The moves are the pieces of each player that have not been played.
   *
   * @property {object}
  */
  get actions() {
    return this.result ? null : { ...this.pieces };
  }

  /** If the pieces for one of the players are missing from `this.pieces`, then
   * it is assumed that this instance implements a view of the game. The missing
   * information is treated as an aleatory.
   *
   * @property {object}
  */
  get aleatories() {
    const [[, rolePieces]] = Object.entries(this.pieces);
    const { allPieces, playedPieces } = this;
    const possiblePieces = allPieces.filter(
      (p) => !rolePieces.includes(p) && !playedPieces.includes(p),
    );
    return {
      hiddenPieces: new ListAleatory({
        values: permutations(possiblePieces, rolePieces),
      }),
    };
  }

  /** If all pieces are put in a circle, each piece beats half the pieces next
   * to it, and it is beaten by half the pieces before it. For example if
   * `allPieces` where `[0,1,2,3,4]`:
   *
   * + piece `1` would beat pieces `2` and `3`, and lose against `4` and `0`,
   * + piece `2` would beat pieces `3` and `4`, and lose against `0` and `1`,
   * + piece `4` would beat pieces `0` and `1`, and lose against `2` and `3`,
   *
   * The `moveResult` returns 1 if `piece1` beats `piece2` or -1 if otherwise.
   *
   * @param {number} piece1
   * @param {number} piece2
   * @returns {number}
  */
  pieceCompare(piece1, piece2) {
    const { allPieces } = this;
    const index1 = allPieces.indexOf(piece1);
    const index2 = allPieces.indexOf(piece2);
    if (index1 < 0) {
      throw new Error(`Unknown piece ${piece1}!`);
    }
    if (index2 < 0) {
      throw new Error(`Unknown piece ${piece2}!`);
    }
    return sign(index1 - index2)
      * (abs(index1 - index2) <= floor(allPieces.length / 2) ? -1 : +1);
  }

  /** A game of Mutropas ends when the players have no more pieces to play. The
   * result is the difference in scores.
   *
   * @property {object}
  */
  get result() {
    const {
      allPieces, playedPieces, roles: [role0, role1], scores,
    } = this;
    if (playedPieces.length >= allPieces.length) {
      return this.zerosumResult(scores[role0] - scores[role1], role0);
    }
    return null;
  }

  /** @inheritdoc */
  get resultBounds() {
    const maxScore = Math.floor(this.allPieces.length / 2);
    return [-maxScore, +maxScore];
  }

  /** Each turn all players play a piece, and the player who plays the greatest
   * piece wins a point. Haps are used in views to model the missing information
   * of the opponent's pieces.
   *
   * @param {object} actions
   * @param {object} haps
   * @return {Game}
  */
  perform(actions, haps) {
    const {
      pieces, playedPieces, roles: [role0, role1], scores,
    } = this;
    const { [role0]: action0, [role1]: action1 } = actions;
    if (!pieces[role0].includes(action0)) {
      throw new Error(`Invalid move ${action0} for ${role0}!`);
    }
    if (!pieces[role1].includes(action1)) {
      throw new Error(`Invalid move ${action1} for ${role1}!`);
    }
    playedPieces.push(action0, action1);
    pieces[role0] = pieces[role0].filter((p) => p !== action0);
    pieces[role1] = pieces[role1].filter((p) => p !== action1);
    const turnResult = this.pieceCompare(action0, action1);
    if (turnResult > 0) {
      scores[role0] += 1;
    } else if (turnResult < 0) {
      scores[role1] += 1;
    }
  }

  /** @inheritdoc */
  view(role) {
    const { pieces, playedPieces, scores } = this;
    return new this.constructor({
      pieces: { [role]: pieces[role] },
      playedPieces: [...playedPieces],
      scores: { ...scores },
    });
  }
} // class Mutropas.

/** Serialization and materialization using Sermat.
*/
Mutropas.defineSERMAT('pieces playedPieces scores');

export default Mutropas;

/** # Mutropas
* /
games.Mutropas = declare(Game, {

  __viewNext__: function __viewNext__(moves, haps, update) {
    var player = this.pieces[this.players[0]] ? this.players[0] : this.players[1],
      opponent = this.opponent(player);
    if (!haps) {
      return this.contingent(moves,
        obj(player, aleatories.uniformAleatory(this.__possiblePieces__(opponent))),
        update);
    } else {
      return (new this.constructor({
        pieces: obj(player, this.pieces[player], opponent, haps[opponent]),
        playedPieces: this.playedPieces,
        scores: this.__scores__
      })).next(moves, null, update);
    }
  },

  // ## Game views ###############################################################################

  /** The method `__possiblePieces__` calculates the pieces the `player` may have.
  * /
  __possiblePieces__: function __possiblePieces__(player) {
    var playedPieces = this.playedPieces,
      opponentPieces = this.pieces[this.opponent(player)],
      possiblePieces = iterable(this.allPieces).filter(function (p) {
        return playedPieces.indexOf(p) < 0 && // p has not been played yet ...
          opponentPieces.indexOf(p) < 0; // ... and the opponent does not have it.
      });
    return possiblePieces.combinations(possiblePieces.count() - 1);
  },

  /** In this view of the game the hidden information is modelled as random variables. The
  aleatory that is returned ranges over all possible piece sets that the opponent of the given
  `player` may have. After each possibility the assumption is maintained for the rest of the
  game.

  This allows to model the uncertainty that each player has about its opponent's pieces. By doing
  so an artificial player that searches the game space cannot infer the pieces the opponent has,
  and hence it cannot cheat.
  * /
  view: function view(player) {
    return new this.constructor({
      pieces: obj(player, this.pieces[player]),
      playedPieces: this.playedPieces,
      scores: this.__scores__
    });
  },
}); // declare Mutropas
*/
