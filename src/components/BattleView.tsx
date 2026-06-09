import { useExp } from '../game/expeditionStore.ts';
import { spriteUrl } from '../game/pokedex.ts';

function HpBar({ current, max }: { current: number; max: number }) {
  const pct = Math.max(0, Math.floor((current / max) * 100));
  const cls = pct > 50 ? 'hp-high' : pct > 20 ? 'hp-mid' : 'hp-low';
  return (
    <div className="hp-track">
      <div className={`hp-fill ${cls}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function BattleView() {
  const battle = useExp((s) => s.battle);
  const artefacts = useExp((s) => s.artefacts);
  const badges = useExp((s) => s.badges);
  const playerAttack = useExp((s) => s.playerAttack);
  const retreat = useExp((s) => s.retreatRun);
  const secteur = useExp((s) => s.secteur);

  if (!battle) return null;

  const enemy = battle.enemyTeam[battle.enemyActive];
  const player = battle.playerTeam[battle.playerActive];
  const isBoss = secteur === 8;

  return (
    <div className="battle">
      <div className="battle-header">
        <span className={`battle-sector ${isBoss ? 'boss' : ''}`}>
          {isBoss ? '⚠ Lieutenant Team Null' : `Clé de secteur ${badges + 1}/8`}
        </span>
      </div>

      <div className="battle-field">
        <div className="combatant enemy">
          <img className="battle-sprite enemy-sprite" src={spriteUrl(enemy.species.id)} alt={enemy.species.name} />
          <div className="combatant-info">
            <div className="combatant-name">{enemy.species.name} <span className="combatant-lv">Nv{enemy.level}</span></div>
            <HpBar current={enemy.currentHp} max={enemy.maxHp} />
            <div className="combatant-hp-text">{enemy.currentHp}/{enemy.maxHp} PV</div>
          </div>
        </div>

        <div className="combatant player">
          <div className="combatant-info">
            <div className="combatant-name">{player.species.name} <span className="combatant-lv">Nv{player.level}</span></div>
            <HpBar current={player.currentHp} max={player.maxHp} />
            <div className="combatant-hp-text">{player.currentHp}/{player.maxHp} PV</div>
          </div>
          <img className="battle-sprite player-sprite" src={spriteUrl(player.species.id)} alt={player.species.name} />
        </div>
      </div>

      <div className="battle-log">
        {battle.log.map((line, i) => <div key={i} className="log-line">{line}</div>)}
      </div>

      <div className="move-grid">
        {player.moves.map((move, i) => (
          <button key={i} className={`btn move-btn type-${move.type}`} onClick={() => playerAttack(i)}>
            <span className="move-name">{move.name}</span>
            <span className="move-type">{move.type}</span>
          </button>
        ))}
      </div>

      {artefacts.length > 0 && (
        <div className="artefact-row">
          {artefacts.map((a) => <span key={a.id} className="artefact-badge">{a.name}</span>)}
        </div>
      )}

      <button className="btn ghost small retreat" onClick={retreat}>Abandonner la run</button>
    </div>
  );
}
