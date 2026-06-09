import { useExp } from '../game/expeditionStore.ts';
import { spriteUrl } from '../game/pokedex.ts';

export default function DraftView() {
  const draft = useExp((s) => s.draft);
  const badges = useExp((s) => s.badges);
  const chooseDraft = useExp((s) => s.chooseDraft);

  if (!draft) return null;

  return (
    <div className="draft">
      <div className="draft-header">
        <div className="draft-title">Clé de secteur obtenue !</div>
        <div className="draft-sub">{badges}/8 secteurs · Choisis un bonus</div>
      </div>

      <div className="draft-options">
        {draft.map((opt, i) => (
          <button key={i} className="draft-card" onClick={() => chooseDraft(i)}>
            {opt.type === 'pokemon' ? (
              <>
                <img className="draft-sprite" src={spriteUrl(opt.pokemon.species.id)} alt={opt.pokemon.species.name} />
                <div className="draft-label">{opt.pokemon.species.name}</div>
                <div className="draft-detail">Nv{opt.pokemon.level} · {opt.pokemon.species.types.join('/')} · {opt.pokemon.maxHp} PV</div>
                <div className="draft-type-tag">Pokémon</div>
              </>
            ) : (
              <>
                <div className="draft-artefact-icon">⬡</div>
                <div className="draft-label">{opt.artefact.name}</div>
                <div className="draft-detail">
                  {opt.artefact.effect === 'dmg_bonus' && `+${Math.round(opt.artefact.value * 100)}% dégâts infligés`}
                  {opt.artefact.effect === 'def_bonus' && `-${Math.round(opt.artefact.value * 100)}% dégâts reçus`}
                  {opt.artefact.effect === 'heal' && `Restaure ${Math.round(opt.artefact.value * 100)}% des PV de l'équipe`}
                </div>
                <div className="draft-type-tag">Artefact</div>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
