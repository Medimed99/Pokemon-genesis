import { useExp, assignItem } from '../game/expeditionStore.ts';
import { pokemonSprite, itemSprite } from '../game/sprites.ts';

export function ItemNode() {
  const itemReward = useExp((s) => s.itemReward);
  const team = useExp((s) => s.team);
  const skip = useExp((s) => s.skipItem);

  if (!itemReward) return null;

  return (
    <div className="item-node">
      <div className="in-title">Objet trouvé !</div>
      <div className="in-item">
<<<<<<< HEAD
        <img className="in-icon-spr" src={itemSprite(itemReward.icon)} alt={itemReward.name} />
=======
        <img className="in-icon-spr" src={itemSprite(runItemSprite(itemReward.id))} alt={itemReward.name} />
>>>>>>> 144165047627239bd21da23e25f46140ab9d66d6
        <div>
          <div className="in-name">{itemReward.name}</div>
          <div className="in-desc">{itemReward.description}</div>
        </div>
      </div>
      <div className="in-assign-title">Assigner à :</div>
      <div className="in-team">
        {team.filter((p) => !p.fainted).map((p) => (
          <button key={p.uid} className="btn small in-team-btn" onClick={() => assignItem(p.uid, itemReward)}>
            <img src={pokemonSprite(p.species.id)} alt={p.species.name} />
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
      <div className="hn-title"><img className="hn-potion" src={itemSprite("potion")} alt="" /> Centre Pokémon</div>
      <div className="hn-sub">Toute l'équipe est soignée !</div>
      <div className="hn-team">
        {team.map((p) => (
          <div key={p.uid} className="hn-pokemon">
            <img src={pokemonSprite(p.species.id)} alt={p.species.name} />
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

<<<<<<< HEAD
=======
function runItemSprite(id: string): string {
  const map: Record<string, string> = {
    belt_combat:'black-belt', mystic_water:'mystic-water', miracle_seed:'miracle-seed',
    charcoal:'charcoal', magnet:'magnet', nevermeltice:'never-melt-ice', spell_tag:'spell-tag',
    dragon_fang:'dragon-fang', soft_sand:'soft-sand', sharp_beak:'sharp-beak', poison_barb:'poison-barb',
    hard_stone:'hard-stone', silver_powder:'silver-powder', twisted_spoon:'twisted-spoon',
    black_belt:'metal-coat', black_glasses:'black-glasses', fairy_feather:'fairy-feather',
    quick_claw:'quick-claw', kings_rock:'kings-rock', choice_scarf:'choice-scarf',
    rare_candy:'rare-candy', lucky_egg:'lucky-egg', leftovers:'leftovers', coin_rune:'amulet-coin',
  };
  return map[id] ?? 'rare-candy';
}
>>>>>>> 144165047627239bd21da23e25f46140ab9d66d6
