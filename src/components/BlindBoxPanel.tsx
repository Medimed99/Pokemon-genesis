import { useState, useEffect, useRef } from 'react';
import { useGame } from '../game/gameStore.ts';
import { spriteUrl } from '../game/pokedex.ts';
import { rarityOf, catchChance, BALLS } from '../game/capture.ts';
import { KANTO } from '../game/kanto.ts';

type CaptureAnim = 'idle' | 'throwing' | 'shaking' | 'caught' | 'fled';

export default function BlindBoxPanel() {
  const phase     = useGame((s) => s.phase);
  const items     = useGame((s) => s.items);
  const pokedex   = useGame((s) => s.pokedex);
  const encounter = useGame((s) => s.encounter);
  const lastResult= useGame((s) => s.lastResult);
  const masterBalls = useGame((s) => s.balances.master_balls);
  const open      = useGame((s) => s.openBlindBox);
  const throwBall = useGame((s) => s.throwBall);
  const flee      = useGame((s) => s.fleeEncounter);

  const [anim, setAnim] = useState<CaptureAnim>('idle');
  const [showDex, setShowDex] = useState(false);
  const prevResult = useRef<string | null>(null);
  const unlocked = phase === 'worker' || phase === 'free';
  const pokeballs = items.pokeball ?? 0;

  // Déclenche l'animation quand lastResult change
  useEffect(() => {
    if (!lastResult || lastResult === prevResult.current) return;
    prevResult.current = lastResult;
    const caught = lastResult.includes('capturé') || lastResult.includes('fusionné');
    setAnim('throwing');
    setTimeout(() => setAnim('shaking'), 400);
    setTimeout(() => setAnim(caught ? 'caught' : 'fled'), 1200);
    setTimeout(() => setAnim('idle'), 2400);
  }, [lastResult]);

  return (
    <>
      <div className="blindbox">
        <div className="bb-head">
          <span className="bb-title">Blind Box · Capture</span>
          <button className="bb-dex-btn" onClick={() => setShowDex(true)}>
            Pokédex {pokedex.length}/151
          </button>
        </div>

        <div className="bb-inv">
          <span>◓ Poké Ball ×{pokeballs}</span>
          {masterBalls > 0 && <span>★ Master Ball ×{masterBalls}</span>}
        </div>

        {encounter ? (
          <div className={`encounter ${encounter.shiny ? 'shiny' : ''}`}>
            {/* Animation de Pokéball */}
            <div className={`capture-anim anim-${anim}`}>
              <div className="pokeball-anim">
                <div className="pb-top" />
                <div className="pb-band" />
                <div className="pb-bot" />
                <div className="pb-btn" />
              </div>
            </div>

            <img
              className={`enc-sprite ${anim === 'caught' ? 'enc-caught' : anim === 'fled' ? 'enc-fled' : ''}`}
              src={spriteUrl(encounter.species.id, encounter.shiny)}
              alt={encounter.species.name}
            />
            <div className="enc-name">
              {encounter.species.name}{encounter.shiny ? ' ✦' : ''}
            </div>
            <div className="enc-rarity">
              {rarityOf(encounter.species)} · {Math.round(catchChance(encounter.species, BALLS.pokeball) * 100)}% (Poké Ball)
            </div>

            {lastResult && anim !== 'idle' && (
              <div className={`enc-result ${anim === 'caught' ? 'result-ok' : 'result-fail'}`}>
                {lastResult}
              </div>
            )}

            {anim === 'idle' && (
              <div className="enc-actions">
                <button className="btn primary" disabled={pokeballs < 1} onClick={() => throwBall('pokeball')}>
                  Lancer une Poké Ball
                </button>
                {masterBalls > 0 && (
                  <button className="btn" onClick={() => throwBall('masterball')}>Master Ball</button>
                )}
                <button className="btn ghost" onClick={flee}>Fuir</button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn primary big" disabled={!unlocked} onClick={open}>
            {unlocked ? 'Ouvrir une Blind Box' : "Verrouillé — réveille d'abord le Noyau"}
          </button>
        )}
        {lastResult && anim === 'idle' && (
          <div className="bb-result">{lastResult}</div>
        )}
      </div>

      {/* Pokédex modal */}
      {showDex && (
        <div className="dex-overlay" onClick={() => setShowDex(false)}>
          <div className="dex-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dex-header">
              <span className="dex-title">Pokédex Kanto</span>
              <span className="dex-count">{pokedex.length}/151</span>
              <button className="dex-close" onClick={() => setShowDex(false)}>✕</button>
            </div>
            <div className="dex-grid">
              {KANTO.map((s) => {
                const seen = pokedex.includes(s.id);
                return (
                  <div key={s.id} className={`dex-entry ${seen ? 'dex-seen' : 'dex-unseen'}`}>
                    <img
                      src={seen ? spriteUrl(s.id) : spriteUrl(s.id)}
                      alt={seen ? s.name : '???'}
                      className="dex-sprite"
                      style={{ filter: seen ? 'none' : 'brightness(0)' }}
                    />
                    <div className="dex-num">#{String(s.id).padStart(3,'0')}</div>
                    <div className="dex-name">{seen ? s.name : '???'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
