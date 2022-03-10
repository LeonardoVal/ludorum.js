import UserInterfacePlayer from './UserInterfacePlayer';
import Match from '../Match';
import RandomPlayer from './RandomPlayer';

const bold = (x) => `\x1b[1m${x}\x1b[0m`;
const boldBlue = (x) => `\x1b[1;94m${x}\x1b[0m`;
const boldRed = (x) => `\x1b[1;91m${x}\x1b[0m`;

const completer = (choices, line) => [
  choices ? [...choices.keys()].filter((key) => key.startsWith(line)) : [],
  line,
];

/** Player that uses the console in the NodeJS environment. Meant mostly for
 * testing.
 *
 * @class
*/
class NodeConsolePlayer extends UserInterfacePlayer {
  /** @inheritdoc */
  static get name() {
    return 'NodeConsolePlayer';
  }

  /** The constructor takes the following arguments.
   *
   * @param {object} args - Argument object.
   * @param {function} [actionString] - A callback that returns a string for a
   *   game's action, with the signature `(action, game, role)`.
   * @param {function} [hapString] - A callback that returns a string for a
   *   game's hap (aleatory value), with the signature `(value, aleatory, game,
   *   role)`.
   * @param {function} [gameString] - A callback that returns a string for a
   *   game, with the signature `(game, role)`.
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
    const { readLineInterface, role } = this;
    const opponents = Object.entries(players)
      .filter(([r]) => r !== role)
      .map(([r, p]) => `${bold(p.name)} (${p.constructor.name}) as ${bold(r)}`);
    process.stdout.write(`You are playing a match of ${bold(game.name)} as ${
      bold(role)} against ${opponents.join(', ')}.\n`);
    readLineInterface.write(`${this.gameString(game, role)}\n`);
  }

  /** @inheritdoc */
  renderChoices(game, chooseCallback) {
    const { random, readLineInterface, role } = this;
    const choices = new Map();
    for (const action of this.actionsFor(game, role)) {
      choices.set(this.actionString(action, game, role), action);
    }
    readLineInterface.question(`${bold(role)}> `, (answer) => {
      const action = answer.trim().length === 0
        ? random.choice([...choices.values()])
        : choices.get(answer);
      if (action === undefined) {
        chooseCallback(new Error(`Unknown action "${answer}"!`));
      } else {
        chooseCallback(action);
      }
    });
  }

  /** @inheritdoc */
  renderMovePerformed(gameBefore, actions, haps, gameAfter) {
    const write = (text) => process.stdout.write(text);
    const { readLineInterface, role } = this;
    if (actions) {
      Object.entries(actions).forEach(([r, a]) => write(
        `- ${bold(r)} played ${this.actionString(a, gameBefore, r)}.\n`,
      ));
    }
    if (haps) {
      Object.entries(haps).forEach(([a, v]) => write(
        `- ${bold(a)} happened as ${this.hapString(v, a, gameBefore, role)}.\n`,
      ));
    }
    readLineInterface.write(`${this.gameString(gameAfter, role)}\n`);
  }

  /** @inheritdoc */
  renderEnd(_game, results) {
    const { role } = this;
    const roleResult = results[role];
    const status = roleResult > 0 ? boldBlue('win')
      : roleResult < 0 ? boldRed('lose') : bold('tied');
    process.stdout.write(`Match ${bold('finished')}. You ${status} (${
      roleResult}).\n`);
  }
} // class NodeConsolePlayer

export default NodeConsolePlayer;
