import { defProps } from "../utils";

/** TODO
 * 
 * @class
 */
export class Spectator {
  /** TODO
   * 
   * @param {object} args
   */
  constructor(args) {
    defProps(this, {
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
    throw new Error(`${this.constructor.name}.matchBegin is not defined!`);
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
    throw new Error(`${this.constructor.name}.matchStep is not defined!`);
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
    throw new Error(`${this.constructor.name}.matchEnd is not defined!`);
  }
} // class Spectator
