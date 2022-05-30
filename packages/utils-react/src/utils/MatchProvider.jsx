/* eslint-disable react/jsx-props-no-spreading */
import React, {
  createContext, useContext, useEffect, useState,
} from 'react';
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
      begin(g, _ps) {
        setGame(g);
      },
      next(_gb, as, hs, ga) {
        setActions(as);
        setHaps(hs);
        setGame(ga);
      },
      end(g, r) {
        setGame(g);
        setResults(r);
      },
    };
    match.spectate(spectator);
  }, [match]);

  const ctx = {
    actions, game, haps, match, results,
  };
  return (
    <MatchContext.Provider value={ctx}>
      {children}
    </MatchContext.Provider>
  );
}; // function MatchProvider

MatchProvider.displayName = 'MatchContext';

MatchProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  match: PropTypes.instanceOf(Match).isRequired,
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
