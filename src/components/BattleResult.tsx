import { useState, useEffect, useRef } from 'react';
import { useExp } from '../game/expeditionStore.ts';
import { pokemonSprite } from '../game/sprites.ts';
import type { BattleLog } from '../game/expedition.ts';

function HpBar({ current, max }: { current: number; max: number; side?: string }) {
  const pct = Math.max(0, Math.floor((current / max) * 100));
  const color = pct > 50 ? '#36e3a6' : pct > 20 ? '#d9a441' : '#e8473f';
  return (
    <div className="battle-hp-bar">
      <div className="battle-hp-fill" style={{ width: `${pct}%`, background: color }} />
      <span className="battle-hp-text">{Math.max(0, current)}/{max}</span>
    </div>
  );
}

export default function BattleResult() {
  const lastBattle = useExp((s) => s.lastBattle);
  const team = useExp((s) => s.team);
  const pendingEvolutions = useExp((s) => s.pendingEvolutions);
  const acknowledge = useExp((s) => s.acknowledgeResult);

  const [step, setStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const timerRef = useRef<number>(0);

  const log = lastBattle?.log ?? [];
  const current = log[step] as BattleLog | undefined;
  const isLast = step >= log.length - 1;

  // Auto-advance through battle steps
  useEffect(() => {
    if (!autoPlay || isLast || !lastBattle) return;
    const delay = current?.event === 'matchup' ? 1200 : current?.event === 'ko' ? 1500 : 900;
    timerRef.current = window.setTimeout(() => setStep((s) => Math.min(s + 1, log.length - 1)), delay);
    return () => clearTimeout(timerRef.current);
  }, [step, autoPlay, isLast, lastBattle, log.length, current?.event]);

  // Reset on new battle
  useEffect(() => { setStep(0); setAutoPlay(true); }, [lastBattle]);

  if (!lastBattle || !current) return null;

  const playerSprId = current.playerId ?? team[0]?.species.id ?? 1;
  const enemySprId  = current.enemyId ?? 1;
  const playerHp    = current.playerHp ?? 0;
  const playerMax   = current.playerMaxHp ?? 1;
  const enemyHp     = current.enemyHp ?? 0;
  const enemyMax    = current.enemyMaxHp ?? 1;
  const isPlayerAtk = current.event === 'attack_player';
  const isEnemyAtk  = current.event === 'attack_enemy';
  const isKo        = current.event === 'ko';
  const isResult    = current.event === 'result';

  return (
    <div className="battle-view">
      {/* Ennemi (haut droite) */}
      <div className="battle-side enemy-side">
        <div className="battle-info-bar">
          <span className="battle-poke-name">{isResult ? '—' : `#${enemySprId}`}</span>
          <HpBar current={enemyHp} max={enemyMax} side="enemy" />
        </div>
        <div className={`battle-sprite-wrap ${isEnemyAtk ? 'battle-shake' : ''} ${isKo && enemyHp <= 0 ? 'battle-faint' : ''}`}>
          <img className="battle-sprite" src={pokemonSprite(enemySprId)} alt="Ennemi" />
        </div>
      </div>

      {/* Zone de texte centrale */}
      <div className={`battle-text-box ${current.color ? `br-${current.color}` : ''}`}>
        <div className="battle-text">{current.text}</div>
        <div className="battle-step-dots">
          {log.map((_, i) => (
            <span key={i} className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
          ))}
        </div>
      </div>

      {/* Joueur (bas gauche) */}
      <div className="battle-side player-side">
        <div className={`battle-sprite-wrap ${isPlayerAtk ? 'battle-lunge' : ''} ${isKo && playerHp <= 0 ? 'battle-faint' : ''}`}>
          <img className="battle-sprite player" src={pokemonSprite(playerSprId)} alt="Allié" />
        </div>
        <div className="battle-info-bar">
          <span className="battle-poke-name">{`#${playerSprId}`}</span>
          <HpBar current={playerHp} max={playerMax} side="player" />
        </div>
      </div>

      {/* Contrôles */}
      <div className="battle-controls">
        {!isLast ? (
          <>
            <button className="btn small" onClick={() => { setAutoPlay(false); setStep((s) => Math.min(s + 1, log.length - 1)); }}>
              Suivant
            </button>
            <button className="btn small" onClick={() => setStep(log.length - 1)}>
              Passer tout
            </button>
          </>
        ) : (
          <>
            {pendingEvolutions.length > 0 && (
              <div className="battle-evos">
                {team.filter((p) => pendingEvolutions.includes(p.uid)).map((p) => (
                  <div key={p.uid} className="battle-evo-line">
                    <img className="battle-evo-spr" src={pokemonSprite(p.species.id)} alt="" />
                    {p.species.name} a évolué !
                  </div>
                ))}
              </div>
            )}
            {/* Résumé équipe */}
            <div className="battle-team-summary">
              {team.map((p) => (
                <div key={p.uid} className={`bts-chip ${p.fainted ? 'bts-fainted' : ''}`}>
                  <img src={pokemonSprite(p.species.id)} alt="" />
                  <HpBar current={p.currentHp} max={p.maxHp} side="player" />
                </div>
              ))}
            </div>
            <button className="btn primary" onClick={acknowledge}>
              {lastBattle.playerWon ? 'Continuer' : 'Voir les résultats'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
