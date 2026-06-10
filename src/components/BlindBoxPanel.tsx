import { useState, useEffect, useRef } from 'react';
import { useGame } from '../game/gameStore.ts';
import { spriteUrl } from '../game/pokedex.ts';
import { rarityOf, catchChance, BALLS } from '../game/capture.ts';

type CaptureAnim = 'idle' | 'throwing' | 'shaking' | 'caught' | 'fled';

export default function BlindBoxPanel() {
  const phase       = useGame((s) => s.phase);
  const items       = useGame((s) => s.items);
  const pokedex     = useGame((s) => s.pokedex);
  const encounter   = useGame((s) => s.encounter);
  const lastResult  = useGame((s) => s.lastResult);
  const masterBalls = useGame((s) => s.balances.master_balls);
  const open        = useGame((s) => s.openBlindBox);
  const throwBall   = useGame((s) => s.throwBall);
  const flee        = useGame((s) => s.fleeEncounter);

  const [anim, setAnim] = useState<CaptureAnim>('idle');
  const prevResult = useRef<string | null>(null);
  const unlocked = phase === 'worker' || phase === 'free';
  const pokeballs = items.pokeball ?? 0;
  const superballs = items.superball ?? 0;
  const hyperballs = items.hyperball ?? 0;

  useEffect(() => {
    if (!lastResult || lastResult === prevResult.current) return;
    prevResult.current = lastResult;
    if (!encounter && (lastResult.includes('capturé') || lastResult.includes('fusionné') || lastResult.includes('enfui'))) {
      const caught = lastResult.includes('capturé') || lastResult.includes('fusionné');
      setAnim('throwing');
      setTimeout(() => setAnim('shaking'), 400);
      setTimeout(() => setAnim(caught ? 'caught' : 'fled'), 1200);
      setTimeout(() => setAnim('idle'), 2400);
    }
  }, [lastResult, encounter]);

  return (
    <div className="blindbox">
      <div className="bb-head">
        <span className="bb-title">Rencontre · Capture</span>
        <span className="bb-dex-btn-static">Pokédex {pokedex.length}</span>
      </div>

      <div className="bb-inv">
        <span>⚪ {pokeballs}</span>
        {superballs > 0 && <span>🔵 {superballs}</span>}
        {hyperballs > 0 && <span>🟡 {hyperballs}</span>}
        {masterBalls > 0 && <span>🟣 {masterBalls}</span>}
      </div>

      {encounter ? (
        <div className={`encounter ${encounter.shiny ? 'shiny' : ''}`}>
          <img
            className="enc-sprite"
            src={spriteUrl(encounter.species.id, encounter.shiny)}
            alt={encounter.species.name}
          />
          <div className="enc-name">{encounter.species.name}{encounter.shiny ? ' ✦' : ''}</div>
          <div className="enc-rarity">
            {rarityOf(encounter.species)} · {Math.round(catchChance(encounter.species, BALLS.pokeball) * 100)}% (Poké Ball)
          </div>
          <div className="enc-actions">
            <button className="btn primary" disabled={pokeballs < 1} onClick={() => throwBall('pokeball')}>
              ⚪ Poké Ball
            </button>
            {superballs > 0 && <button className="btn" onClick={() => throwBall('superball')}>🔵 Super Ball</button>}
            {hyperballs > 0 && <button className="btn" onClick={() => throwBall('hyperball')}>🟡 Hyper Ball</button>}
            {masterBalls > 0 && <button className="btn" onClick={() => throwBall('masterball')}>🟣 Master Ball</button>}
            <button className="btn ghost" onClick={flee}>Fuir</button>
          </div>
        </div>
      ) : (
        <button className="btn primary big" disabled={!unlocked} onClick={open}>
          {unlocked ? 'Chercher un Pokémon' : "Verrouillé — réveille d'abord le Noyau"}
        </button>
      )}

      {lastResult && (
        <div className={`bb-result ${anim === 'fled' ? 'result-fail' : ''}`}>{lastResult}</div>
      )}
    </div>
  );
}
