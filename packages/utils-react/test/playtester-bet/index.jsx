import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bet, Match, RandomPlayer, UserInterfacePlayer,
} from '@ludorum/core';
import { MatchProvider, useMatch } from '../../src/utils/MatchProvider';

const resultString = (r) => r < 0 ? 'lost' : r > 0 ? 'won' : 'tied';

const BetGame = useMatch(({
  actions, game, match, results, role,
}) => {
  const playedBy = match && Object.entries(match.players)
    .map(([role, player]) => `${player.name} as ${role}`)
    .join(' and ');

  const renderChoices = () => {
    if (game?.isActive(role)) {
      const uiPlayer = match.players[role];
      return <>
        <button onClick={() => uiPlayer.choose(1)}>Bet odd</button>
        <button onClick={() => uiPlayer.choose(2)}>Bet even</button>
        <button onClick={() => uiPlayer.choose(uiPlayer.random.choice([1,2]))}>Bet randomly</button>
      </>;
    }
  };
  
  return <>
    <p>Game of Bet played by {playedBy}.</p>
    {results
    ? <p>Game is finished: {Object.entries(results).map(
        ([role, result]) => `${role} has ${resultString(result)}`
      )}.</p>
    : game && <p>
      {game.activeRole} has {game.points} of {game.goal} points.
      {renderChoices()}
    </p>}
  </>;
});

const BetPlaytesterApp = ({
  game
}) => {
  const [match, setMatch] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  useEffect(() => {
    if (match) {
      setIsFinished(false);
      match.complete().then(() => {
        setIsFinished(true);
      });
    }
  }, [match]);
  
  const uiMatch = () => {
    const newMatch = new Match({
      game: new Bet(),
      players: [new UserInterfacePlayer()],
    });
    setMatch(newMatch);
  };

  return <>
    {match && <MatchProvider match={match}>
      <BetGame role="Gambler"/>
    </MatchProvider>}
    {(!match || isFinished) && (
      <p>Playtest Bet{isFinished && ' again'}: <button onClick={uiMatch}>UI play</button>.</p>
    )}
  </>;
};

(function main() {
  createRoot(
    document.querySelector('#app'),
  ).render(
    <BetPlaytesterApp />,
  );
})();
