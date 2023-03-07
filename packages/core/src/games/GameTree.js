/** Data structure that holds a tree of game states.
 */
export class GameTree {
  constructor(args) {
    this.parent = args.parent ?? null;
    this.state = args.state;
    this.actions = args.actions ?? null;
    this.haps = args.haps ?? null;
    this.probability = args.probability ?? 1;
    this.nexts = args.nexts ?? null;
  }

  /** Generates all possible combinations of actions and haps with a
   * probability. Probability is calculated only with haps. Without haps, all
   * combinations have a probability of 1.
   *
   * @param {Record<string, unknown>} actions
   * @param {Record<string, [unknown, number][]>} haps
   * @yields {object} - An object with actions, haps and probability.
   */
  static* transitions(actions, haps = null) {
    const role = actions && Object.keys(actions)[0];
    if (role) { // Iterate by roles
      const { [role]: roleActions, ...otherActions } = actions;
      if (roleActions && roleActions.length > 0) {
        for (const roleAction of roleActions) {
          for (const transition of this.transitions(otherActions, haps)) {
            yield {
              ...transition,
              actions: { ...transition.actions, [role]: roleAction },
            };
          }
        }
      } else {
        yield* this.transitions(otherActions, haps);
      }
    } else { // Iterate by aleatories
      const aleatory = haps && Object.keys(haps)[0];
      if (aleatory) {
        const { [aleatory]: aleatoryHaps, ...otherHaps } = haps;
        for (const [hapValue, hapProbability] of aleatoryHaps) {
          for (const transition of this.transitions(null, otherHaps)) {
            yield {
              ...transition,
              haps: { ...transition.haps, [aleatory]: hapValue },
              probability: transition.probability * hapProbability,
            };
          }
        }
      } else {
        yield { actions: null, haps: null, probability: 1 };
      }
    }
  } // static transitions

  /** Generates all possible transitions for this game tree's root state.
   *
   * @yield {object}
  */
  * transitions() {
    const { actions, haps } = this.state;
    yield* this.constructor.transitions(actions, haps);
  }

  /** Creates all possible children for this game tree's root.
   *
   * @returns {GameTree[]}
  */
  expand() {
    this.nexts = [];
    for (const { actions, haps, probability } of this.transitions()) {
      const state = this.state.next(actions, haps);
      this.nexts.push(new GameTree({
        actions,
        haps,
        parent: this,
        probability,
        state,
      }));
    }
    return this.nexts;
  }
} // class GameTree
