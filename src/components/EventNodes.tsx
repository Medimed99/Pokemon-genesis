import { useExp, assignItem } from '../game/expeditionStore.ts';

export function ItemNode() {
  const itemReward = useExp((s) => s.itemReward);
  const team = useExp((s) => s.team);
  const skip = useExp((s) => s.skipItem);

  if (!itemReward) return null;

  return (
    <div className="item-node">
      <div className="in-title">Objet trouvé !</div>
      <div className="in-item">
        <span className="in-icon">{itemReward.icon}</span>
        <div>
          <div className="in-name">{itemReward.name}</div>
          <div className="in-desc">{itemReward.description}</div>
        </div>
      </div>
      <div className="in-assign-title">Assigner à :</div>
      <div className="in-team">
        {team.filter((p) => !p.fainted).map((p) => (
          <button key={p.uid} className="btn small in-team-btn" onClick={() => assignItem(p.uid, itemReward)}>
            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.species.id}.png`} alt={p.species.name} />
            <span>{p.species.name}</span>
            {p.item && <span className="in-current-item" title={p.item.name}>{p.item.icon} →</span>}
          </button>
        ))}
      </div>
      <button className="btn ghost" onClick={skip}>Ignorer</button>
    </div>
  );
}

export function HealNode() {
  const team = useExp((s) => s.team);
  const acknowledge = useExp((s) => s.acknowledgeResult);

  return (
    <div className="heal-node">
      <div className="hn-title">💊 Centre Pokémon</div>
      <div className="hn-sub">Toute l'équipe est soignée !</div>
      <div className="hn-team">
        {team.map((p) => (
          <div key={p.uid} className="hn-pokemon">
            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.species.id}.png`} alt={p.species.name} />
            <div>
              <div className="hn-pname">{p.species.name} Nv{p.level}</div>
              <div className="br-hp-track">
                <div className="br-hp-fill" style={{ width: '100%', background: 'var(--neon)' }} />
              </div>
              <div className="br-hp-txt">{p.currentHp}/{p.maxHp} PV</div>
            </div>
          </div>
        ))}
      </div>
      <button className="btn primary" onClick={acknowledge}>Continuer →</button>
    </div>
  );
}
