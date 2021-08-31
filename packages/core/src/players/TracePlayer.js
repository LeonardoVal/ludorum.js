import Player from './Player';
import RandomPlayer from './RandomPlayer';

/** # TracePlayer

Scripted automatic player that uses a predefined list of actions.
*/
export default class TracePlayer extends Player {
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
    super(args);
    const {
      player = null,
      trace = [],
    } = args || {};
    this.player = player;
    this.trace = trace;
    this.traceIndex = 0;
  }

  /** @inheritdoc
  */
  decision(_game, role) {
    const { trace, traceIndex } = this;
    if (traceIndex < trace.length) {
      const result = trace[traceIndex]?.[role];
      this.traceIndex += 1;
      if (result) {
        return result;
      }
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

  /** Serialization and materialization using Sermat.
  */
  static __SERMAT__ = {
    identifier: 'TracePlayer',
    serializer(obj) {
      const [args] = Player.__SERMAT__.serializer(obj);
      return [{ ...args, trace: obj.trace }];
    },
  };
} // declare TracePlayer.
