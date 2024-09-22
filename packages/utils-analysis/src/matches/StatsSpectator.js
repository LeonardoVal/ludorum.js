import { Spectator } from "@ludorum/core";
import { Statistics } from "../utils/Statistics";

/** TODO
 * 
 * @class
 */
export class StatsSpectator extends Spectator {
  constructor(args) {
    super(args);
    this.__props({
      stats: args?.stats ?? new Statistics(),
    });
  }

  /** @inheritdoc */
  matchBegin({ players, start }) {
    const { stats } = this;
    const { name } = start;
    for (const [role, player] of Object.entries(players)) {
      stats.account(`matches ${name} ${player.name} ${role}`, 1);
    }
  }

  /** @inheritdoc */
  matchStep({ previous, match: { players } }) {
    const { stats } = this;
    for (const [role, roleActions] of Object.entries(previous.actions)) {
      if (roleActions && roleActions.length > 0) {
        const player = players[role];
        stats.account(`width ${previous.name} ${player.name} ${role}`, roleActions.length);
      }
    }
  }

  /** @inheritdoc */
  matchEnd({ match: { players }, final, ply, result }) {
    const { stats } = this;
    const { name } = final;
    for (const [role, roleResult] of Object.entries(result)) {
      const player = players[role];
      stats.account(`result ${name} ${player.name} ${role}`, roleResult);
      const roleStatus = roleResult > 0 ? 'victories'
        : (roleResult < 0 ? 'defeats' : 'draws');
      stats.account(`${roleStatus} ${name} ${player.name} ${role}`, roleResult); 
      stats.account(`length ${name} ${player.name} ${role}`, ply);
    }
  }

} // class StatsSpectator
