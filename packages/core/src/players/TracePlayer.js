import { Player } from './Player';

/** Scripted automatic player that uses a predefined list of actions.
 *
 * @class
 * @extends Player
*/
export class TracePlayer extends Player {
  /** The constructor takes the the `trace` as an sequence of moves to make.
   *
   * @param {object} [args]
   * @param {Array} [args.trace] - A list of actions.
   * @param {Player} [args.player] - A player to act when there is no trace.
  */
  constructor(args) {
    super(args);
    this.player = args?.player;
    this.record = args?.record ?? false;
    this.trace = [...args?.trace ?? []];
    this.traceIndex = 0;
  }

  /** @inheritdoc
  */
  async decision(game, role) {
    const {
      player, record, trace, traceIndex,
    } = this;
    if (traceIndex < trace.length) {
      const action = trace[traceIndex]?.[role];
      this.traceIndex += 1;
      return action;
    }
    if (player) {
      const action = await player.decision(game, role);
      this.traceIndex += 1;
      if (record) {
        trace.push({ [role]: action });
      }
      return action;
    }
    throw new Error(`No action in trace for ${role}!`);
  }

  /** @inheritdoc
  */
  participate() {
    return new TracePlayer({ ...this, traceIndex: 0 });
  }
} // declare TracePlayer.

export default TracePlayer;
