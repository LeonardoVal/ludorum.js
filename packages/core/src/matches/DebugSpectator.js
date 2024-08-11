import { Spectator } from "./Spectator";

/** TODO
 * 
 * @class
 */
export class DebugSpectator extends Spectator {
  /** @inheritdoc */
  matchBegin(args) {
    console.log({ matchBegin: args });
  }

  /** @inheritdoc */
  matchStep(args) {
    console.log({ matchStep: args });
  }

  /** @inheritdoc */
  matchEnd(args) {
    console.log({ matchEnd: args });
  }
} // class DebugSpectator
