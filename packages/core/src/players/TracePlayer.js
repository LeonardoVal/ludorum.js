import Player from './Player';

/** Scripted automatic player that uses a predefined list of actions.
 *
 * @class
 * @extends Player
*/
class TracePlayer extends Player {
  /** @inheritdoc */
  static get name() {
    return 'TracePlayer';
  }

  /** The constructor takes the player's `name` and the `trace` as an sequence
   * of moves to make.
   *
   * @param {object} [args]
   * @param {string} [args.name] - Name for the player.
   * @param {Randomness} [args.random] - Pseudo-random number generator.
   * @param {Array} [args.trace] - A list of actions.
   * @param {Player} [args.player] - A player to act when there is no trace.
  */
  constructor(args = null) {
    const {
      player, trace, traceIndex = 0,
    } = args || {};
    super(args);
    this
      ._prop('player', player, Player, undefined)
      ._prop('trace', trace, Array, []);
    this.traceIndex = traceIndex;
  }

  /** @inheritdoc
  */
  async decision(game, role) {
    const { player, trace, traceIndex } = this;
    if (traceIndex < trace.length) {
      const result = trace[traceIndex]?.[role];
      this.traceIndex += 1;
      return result;
    }
    if (player) {
      return player.decision(game, role);
    }
    throw new Error(`No action in trace for ${role}!`);
  }

  /** @inheritdoc
  */
  participate() {
    const {
      name, random, trace, player,
    } = this;
    return new TracePlayer({
      name, random, trace, player,
    });
  }
} // declare TracePlayer.

/** Serialization and materialization using Sermat.
*/
TracePlayer.defineSERMAT('player trace traceIndex');

export default TracePlayer;
