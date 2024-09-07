import { BaseClass } from "../utils";

/** TODO
 * 
 * @class
 */
export class Spectator extends BaseClass {
  /** TODO
   * 
   * @param {object} args
   */
  constructor(args) {
    super();
    this.__props({
      matchBegin: args?.matchBegin,
      matchStep: args?.matchStep,
      matchEnd: args?.matchEnd,
    });
  }

  /**
   * 
   * @param {Match} match 
   * @param {string} id 
   * @param {object} args
   * @returns {void}
   */
  static broadcast(match, id, args) {
    args = { match, ...args };
    match.spectators.forEach((spectator) => {
      spectator[id]?.(args);
    });
  }

  /** TODO
   * 
   * @param {object} args
   * @param {Match} args.match
   * @param {Record<string, Player>} args.players 
   * @param {Game} args.start
   * @returns {void}
   */
  matchBegin(_args) {
    return this.__undefined(`${this.constructor.name}.matchBegin`);
  }

  /** TODO
   * 
   * @param {object} args
   * @param {Match} args.match
   * @param {Record<string, unknown>} args.actions
   * @param {Record<string, unknown>} args.haps
   * @param {Game} args.next
   * @returns {void}
   */
  matchStep(_args) {
    return this.__undefined(`${this.constructor.name}.matchStep`);
  }

  /** TODO
   * 
   * @param {object} args
   * @param {Match} args.match
   * @param {Game} args.final
   * @param {Record<string, number>} args.result
   * @returns {void}
   */
  matchEnd(_args) {
    return this.__undefined(`${this.constructor.name}.matchEnd`);
  }

} // class Spectator
