import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot } from 'react-dom/client';
import {
  Bet, Match, UserInterfacePlayer,
} from '@ludorum/core';
import { MatchProvider, useMatch } from '../../src';

const BetGame = useMatch(({
  actions, game, gameRole, match, results,
}) => {
  const renderHeader = () => {
    const text = `Game of Bet played by ${match.players.Gambler.name} as Gambler.`;
    return <p>{text}</p>;
  };
  const renderResults = () => {
    // eslint-disable-next-line no-confusing-arrow
    const text = `Game is finished: Gambler has ${results.Gambler < 0 ? 'lost'
      : results.Gambler > 0 ? 'won' : 'tied'}.`;
    return <p>{text}</p>;
  };
  const renderChoices = () => {
    if (game?.isActive(gameRole)) {
      const uiPlayer = match.players[gameRole];
      const btn = (caption, onClick) => (
        <button onClick={onClick} type="button">{caption}</button>
      );
      return (
        <>
          {btn('Bet odd', () => uiPlayer.choose(1))}
          {btn('Bet even', () => uiPlayer.choose(2))}
          {btn('Bet randomly', () => uiPlayer.choose(uiPlayer.random.choice([1, 2])))}
        </>
      );
    }
    return null;
  };
  const renderState = () => {
    const text = `Gambler has ${game.points} of ${game.goal} points. `;
    return (
      <p>
        {text}
        {renderChoices()}
      </p>
    );
  };
  return match && (
    <>
      {renderHeader()}
      {results ? renderResults() : game && renderState()}
    </>
  );
});

const BetPlaytesterApp = () => {
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

  return (
    <>
      {match && (
        <MatchProvider match={match}>
          <BetGame gameRole="Gambler" />
        </MatchProvider>
      )}
      {(!match || isFinished) && (
        <p>
          {`Playtest Bet ${isFinished ? ' again' : ''}: `}
          <button onClick={uiMatch} type="button">UI play</button>
        </p>
      )}
    </>
  );
};

(function main() {
  createRoot(
    document.querySelector('#app'),
  ).render(
    <BetPlaytesterApp />,
  );
}());
