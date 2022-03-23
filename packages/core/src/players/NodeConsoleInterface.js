import UserInterface from './UserInterface';
import Match from '../Match';
import RandomPlayer from './RandomPlayer';

const bold = (x) => `\x1b[1m${x}\x1b[0m`;
const boldBlue = (x) => `\x1b[1;94m${x}\x1b[0m`;
const boldRed = (x) => `\x1b[1;91m${x}\x1b[0m`;

const completer = (choices, line) => [
  choices ? [...choices.keys()].filter((key) => key.startsWith(line)) : [],
  line,
];

const listText = (texts) => (
  `${texts.slice(0, -1).join(', ')} and ${texts.slice(-1)[0]}`
);

/** Player that uses the console in the NodeJS environment. Meant mostly for
 * testing.
 *
 * @class
*/
class NodeConsoleInterface extends UserInterface {
  /** @inheritdoc */
  static get name() {
    return 'NodeConsoleInterface';
  }

  /** The constructor takes the following arguments.
   *
   * @param {object} args - Argument object.
   * @param {function} [actionString] - A callback that returns a string for a
   *   game's action, with the signature `(action, game, role)`.
   * @param {function} [hapString] - A callback that returns a string for a
   *   game's hap (aleatory value), with the signature `(value, aleatory, game)`.
   * @param {function} [gameString] - A callback that returns a string for a
   *   game, with the signature `(game)`.
   * @param {object} readline - The NodeJS's standards `readline` module.
  */
  constructor(args) {
    const {
      actionString, hapString, gameString, readline,
    } = args || {};
    super(args);
    if (typeof readline?.createInterface !== 'function') {
      throw new TypeError('Cannot create interface from provided `readline` argument!');
    }
    const readLineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line) => completer(this.choices, line),
    });
    const defaultStringFunction = (x) => `${x}`;
    this
      ._prop('actionString', actionString, 'function', defaultStringFunction)
      ._prop('hapString', hapString, 'function', defaultStringFunction)
      ._prop('gameString', gameString, 'function', defaultStringFunction)
      ._prop('readLineInterface', readLineInterface);
  }

  /** @inheritdoc */
  renderBeginning(game, players) {
    const { readLineInterface } = this;
    const playerStrings = Object.entries(players)
      .map(([r, p]) => `${bold(p.name)} (${p.constructor.name}) as ${bold(r)}`);
    process.stdout.write(`Playing a match of ${bold(game.name)} between ${
      listText(playerStrings)}.\n`);
    readLineInterface.write(`${this.gameString(game)}\n`);
  }

  /** @inheritdoc */
  renderChoices(game, role, choose, fail) {
    const { random, readLineInterface } = this;
    const choices = new Map();
    for (const action of game.actions[role]) {
      choices.set(this.actionString(action, game, role), action);
    }
    readLineInterface.question(`${bold(role)}> `, (answer) => {
      const action = answer.trim().length === 0
        ? random.choice([...choices.values()])
        : choices.get(answer);
      if (action === undefined) {
        fail(new Error(`Unknown action "${answer}"!`));
      } else {
        choose(action);
      }
    });
  }

  /** @inheritdoc */
  renderMovePerformed(gameBefore, actions, haps, gameAfter) {
    const write = (text) => process.stdout.write(text);
    const { readLineInterface } = this;
    if (actions) {
      Object.entries(actions).forEach(([r, a]) => write(
        `- ${bold(r)} played ${this.actionString(a, gameBefore, r)}.\n`,
      ));
    }
    if (haps) {
      Object.entries(haps).forEach(([a, v]) => write(
        `- ${bold(a)} happened as ${this.hapString(v, a, gameBefore)}.\n`,
      ));
    }
    readLineInterface.write(`${this.gameString(gameAfter)}\n`);
  }

  /** @inheritdoc */
  renderEnd(_game, results) {
    const finishText = listText(
      Object.entries(results).map(([role, result]) => {
        const status = result > 0 ? boldBlue('wins')
          : result < 0 ? boldRed('loses') : bold('tied');
        return `${role} ${status}`;
      }),
    );
    process.stdout.write(`Match ${bold('finished')}: ${finishText}.\n`);
  }

  /** Helper method for the _main_ function of playtesters that use this player.
   *
   * @param {object} args
   * @param {function} args.game - Game builder.
   * @param {Module} args.module - If null runs a match, else just exports a
   *   function that runs a match.
   * @param {function} args.player - Player builder function, taking game and
   *   role.
  */
  play(args) {
    const ui = this;
    const main = function main(...types) {
      const game = args.game();
      const players = game.roles.map((role, i) => (
        args.player?.(types[i], game, role, ui) ?? this.RandomPlayer()
      ));
      const match = new Match({ game, players });
      ui.bind(match);
      return match.complete();
    };
    if (args.module) { // Behave as imported module.
      args.module.exports = main;
    } else { // Behave as main script.
      main(...process.argv.slice(2)).then(
        () => process.exit(0),
        (err) => {
          console.error(err);
          process.exit(1);
        },
      );
    }
  }
} // class NodeConsoleInterface

export default NodeConsoleInterface;
