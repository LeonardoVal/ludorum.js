import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Match } from '@ludorum/core';

const MatchContext = createContext({});

/** TODO */
export const MatchProvider = ({
  children,
  match,
}) => {
  const [game, setGame] = useState(null);
  const [actions, setActions] = useState(null);
  const [haps, setHaps] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const spectator = {
      begin(game, _players) {
        setGame(game);
      },
      next(_gameBefore, actions, haps, gameAfter) {
        setActions(actions);
        setHaps(haps);
        setGame(gameAfter);
      },
      end(game, results) {
        setGame(game);
        setResults(results);
      },
    };
    match.spectate(spectator);
  }, [match]);

  const ctx = { actions, game, haps, match, results };
  return (
    <MatchContext.Provider value={ctx}>
      {children}
    </MatchContext.Provider>
  );
} // function MatchProvider

MatchProvider.displayName = 'MatchContext';

MatchProvider.propTypes = {
  match: (props, propName, compName) => {
    if (!(props[propName] instanceof Match)) {
      return new Error(`Expected property '${propName}' of ${compName
        } to be an instance of Match!`);
    }
  },
  render: PropTypes.func,
};

/** TODO */
export const useMatch = (WrappedComponent) => (props) => {
  const {
    actions, game, haps, match, results,
  } = useContext(MatchContext);
  return (
    <WrappedComponent
      actions={actions}
      game={game}
      haps={haps}
      match={match}
      results={results}
      {...props}
    />
  );
};
