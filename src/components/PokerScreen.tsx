import { usePoker } from '../game/pokerStore.ts';
import { useGame } from '../game/gameStore.ts';
import { HAND_BASE } from '../game/pokerHands.ts';
import PokerHand from './PokerHand.tsx';
import PokerShop from './PokerShop.tsx';

const BLIND_NAMES = ['Small Blind', 'Big Blind', 'Boss Blind'];

function ScoreBar() {
  const score = usePoker((s) => s.score);
  const target = usePoker((s) => s.target);
  const pct = Math.min(100, Math.floor((score / target) * 100));
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="score-bar-labels">
        <span>{score.toLocaleString()}</span>
        <span>{target.toLocaleString()}</span>
      </div>
    </div>
  );
}

function PlayingScreen() {
  const { ante, blindIndex, handsLeft, discardsLeft, jokers,
          lastHand, lastScore, scoreLog, playHand, discard } = usePoker((s) => ({
    ante: s.ante, blindIndex: s.blindIndex,
    handsLeft: s.handsLeft, discardsLeft: s.discardsLeft,
    jokers: s.jokers, lastHand: s.lastHand, lastScore: s.lastScore,
    scoreLog: s.scoreLog, playHand: s.playHand, discard: s.discard,
  }));
  const hand = usePoker((s) => s.hand);
  const selected = hand.filter((c) => c.selected);

  return (
    <div className="poker-playing">
      <div className="poker-top">
        <div className="poker-blind-info">
          <span className="poker-ante">Ante {ante}</span>
          <span className={`poker-blind-name ${blindIndex === 2 ? 'boss' : ''}`}>
            {BLIND_NAMES[blindIndex]}
          </span>
        </div>
        <div className="poker-counters">
          <span className="counter">✋ {handsLeft}</span>
          <span className="counter">🗑 {discardsLeft}</span>
        </div>
      </div>

      <ScoreBar />

      {lastHand && (
        <div className="last-hand-info">
          <span className="last-hand-name">{HAND_BASE[lastHand.rank].label}</span>
          <span className="last-hand-score">+{lastScore.toLocaleString()}</span>
        </div>
      )}

      {scoreLog.length > 0 && (
        <div className="score-log">
          {scoreLog.map((line, i) => <div key={i} className="score-log-line">{line}</div>)}
        </div>
      )}

      {jokers.length > 0 && (
        <div className="joker-row">
          {jokers.map((j) => (
            <div key={j.id} className="joker-chip" title={j.tooltip}>{j.icon}</div>
          ))}
        </div>
      )}

      <div className="poker-actions">
        <button
          className="btn primary"
          disabled={selected.length === 0 || handsLeft === 0}
          onClick={playHand}
        >
          Jouer {selected.length > 0 ? `(${selected.length})` : ''}
        </button>
        <button
          className="btn"
          disabled={selected.length === 0 || discardsLeft === 0}
          onClick={discard}
        >
          Défausser {selected.length > 0 ? `(${selected.length})` : ''}
        </button>
      </div>

      <PokerHand />
    </div>
  );
}

function PokerGate() {
  const balances = useGame((s) => s.balances);
  const startGame = usePoker((s) => s.startGame);
  const hasBandwidth = balances.bandwidth >= 1;

  return (
    <div className="poker-gate">
      <div className="poker-gate-title">Poké-Poker</div>
      <div className="poker-gate-sub">Bande passante : {Math.floor(balances.bandwidth)}/5</div>
      <div className="poker-gate-desc">
        Bats 3 blinds par ante (× 4 antes). Sélectionne jusqu'à 5 cartes pour jouer une main.
        Atteins le score cible avec {MAX_HANDS_DISPLAY} mains. Achète des Jokers entre chaque blind.
        Victoire → Jetons de Luxe.
      </div>
      <button className="btn primary big" disabled={!hasBandwidth} onClick={startGame}>
        {hasBandwidth ? 'Lancer une partie' : 'Bande passante insuffisante'}
      </button>
    </div>
  );
}
const MAX_HANDS_DISPLAY = 4;

function ResultScreen() {
  const { ante, blindIndex, closeGame } = usePoker((s) => ({
    ante: s.ante, blindIndex: s.blindIndex, closeGame: s.closeGame,
  }));
  const won = ante >= 4 && blindIndex >= 2;

  return (
    <div className="run-result">
      <div className={`result-icon ${won ? 'victory' : 'defeat'}`}>{won ? '♠' : '✗'}</div>
      <div className="result-title">{won ? 'Run complète !' : 'Partie terminée'}</div>
      <div className="result-sub">
        {won ? 'Tu as battu les 4 antes. Jetons de Luxe accordés !'
             : `Éliminé à l'Ante ${ante}, ${BLIND_NAMES[blindIndex]}.`}
      </div>
      <button className="btn primary" onClick={closeGame}>Retour à l'Archive</button>
    </div>
  );
}

export default function PokerScreen() {
  const phase = usePoker((s) => s.phase);

  if (phase === 'gate')    return <PokerGate />;
  if (phase === 'playing') return <PlayingScreen />;
  if (phase === 'shop')    return <PokerShop />;
  return <ResultScreen />;
}
