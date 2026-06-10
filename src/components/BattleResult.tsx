import { useExp } from '../game/expeditionStore.ts';

export default function BattleResult() {
  const lastBattle = useExp((s) => s.lastBattle);
  const team = useExp((s) => s.team);
  const pendingEvolutions = useExp((s) => s.pendingEvolutions);
  const acknowledge = useExp((s) => s.acknowledgeResult);

  if (!lastBattle) return null;
  const { playerWon, log } = lastBattle;

  return (
    <div className="battle-result">
      <div className={`br-title ${playerWon ? 'br-win' : 'br-lose'}`}>
        {playerWon ? '✓ Victoire !' : '✗ Défaite'}
      </div>

      {pendingEvolutions.length > 0 && (
        <div className="br-evolutions">
          {team.filter((p) => pendingEvolutions.includes(p.uid)).map((p) => (
            <div key={p.uid} className="br-evo-line">
              ✨ {p.species.name} a évolué !
            </div>
          ))}
        </div>
      )}

      <div className="br-log">
        {log.map((line: {text:string;color?:string}, i: number) => (
          <div key={i} className={`br-log-line ${line.color ? `br-${line.color}` : ''}`}>
            {line.text}
          </div>
        ))}
      </div>

      <div className="br-team">
        {team.map((p) => (
          <div key={p.uid} className={`br-pokemon ${p.fainted ? 'br-fainted' : ''}`}>
            <img src={`PLACEHOLDER`} alt={p.species.name} />
            <div>
              <div className="br-pname">{p.species.name} Nv{p.level}</div>
              <div className="br-hp-track">
                <div className="br-hp-fill" style={{ width: `${Math.floor(p.currentHp / p.maxHp * 100)}%`, background: p.fainted ? 'var(--danger)' : 'var(--neon)' }} />
              </div>
              <div className="br-hp-txt">{p.fainted ? 'K.O.' : `${p.currentHp}/${p.maxHp} PV`}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn primary" onClick={acknowledge}>
        {playerWon ? 'Continuer →' : 'Voir les résultats'}
      </button>
    </div>
  );
}
