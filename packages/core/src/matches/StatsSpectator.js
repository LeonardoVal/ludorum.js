import { defProps, Statistics } from "../utils";
import { Spectator } from "./Spectator";

/** TODO
 * 
 * @class
 */
export class StatsSpectator extends Spectator {
  constructor(args) {
    super(args);
    defProps(this, {
      stats: args?.stats ?? new Statistics(),
    });
  }

  /** @inheritdoc */
  matchBegin({ players, start }) {
    const { name } = start;
    for (const [role, player] of players) {
      this.account(`${player.name}.${name}.${role}`, 1);
    }
  }

  /** @inheritdoc */
  matchStep({ previous }) {
    for (const [role, roleActions] of Object.entries(previous.actions)) {
      if (roleActions && roleActions.length > 0) {
        this.account(`${previous.name}.width.${role}`, roleActions.length);
      }
    }
  }

  /** @inheritdoc */
  matchEnd({ match, final, ply, result }) {
    const { name } = final;
    for (const [role, roleResult] of Object.entries(result)) {
      this.account(`${name}.result.${role}`, roleResult);
      const roleStatus = roleResult > 0 ? 'victories'
        : (roleResult < 0 ? 'defeats' : 'draws');
      this.account(`${name}.${roleStatus}.${role}`, roleResult);
      const player = match.players[role];
      this.account(`${player.name}.result.${name}`, roleResult);
      this.account(`${player.name}.${roleStatus}.${name}`, roleResult);
    }
    this.account(`${name}.length`, ply);
  }

} // class StatsSpectator
