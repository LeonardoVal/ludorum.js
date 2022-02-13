const {
  Choose2Win, Player, RandomPlayer, RoundRobinTournament,
  iterables: { permutations },
} = require('../../dist/core');

class FixedPlayer extends Player {
  constructor(args) {
    const { action } = args || {};
    super(args);
    this._prop('action', action);
  }

  async decision() {
    return this.action;
  }
} // class FixedPlayer

async function main() {
  const game = new Choose2Win();
  const players = [
    new RandomPlayer({ name: 'random' }),
    new FixedPlayer({ name: 'playWin', action: 'win' }),
    new FixedPlayer({ name: 'playLose', action: 'lose' }),
    new FixedPlayer({ name: 'playPass', action: 'pass' }),
  ];
  const matchCount = 20;
  const tournament = new RoundRobinTournament({ game, players, matchCount });
  const { stats } = tournament.statisticalSpectator();
  tournament.spectate({
    begin() {
      console.log('Tournament begins.');
    },
    end(count) {
      console.log(`Tournament ends after ${count} matches were played.`);
    },
    matchCreated(match, matchNumber) {
      console.log(`Beginning match #${matchNumber} between ${
        Object.entries(match.players)
          .map(([role, player]) => `${player.name} as ${role}`).join(' and ')
      }.`);
    },
    matchCompleted(match, matchNumber) {
      console.log(`Finished match #${matchNumber} between ${
        Object.entries(match.players)
          .map(([role, player]) => `${player.name} as ${role}`).join(' and ')
      }.`);
    },
  });
  await tournament.complete();
  console.log(stats.toString());
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
} else {
  module.exports = main;
}
