import { useState } from 'react';
import { useGame } from '../game/gameStore.ts';
import { pokemonSprite, itemSprite } from '../game/sprites.ts';
import { applicableStones, getStoneEvolution } from '../game/stoneEvolutions.ts';
import { ALL_SPECIES } from '../game/kanto.ts';

const STONE_SPRITES: Record<string, string> = {
  fire_stone: 'fire-stone', water_stone: 'water-stone',
  thunder_stone: 'thunder-stone', moon_stone: 'moon-stone', leaf_stone: 'leaf-stone',
};
const STONE_NAMES: Record<string, string> = {
  fire_stone: 'Pierre Feu', water_stone: 'Pierre Eau',
  thunder_stone: 'Pierre Foudre', moon_stone: 'Pierre Lune', leaf_stone: 'Pierre Plante',
};

export default function StoneModal({ onClose }: { onClose: () => void }) {
  const workers  = useGame((s) => s.workers);
  const items    = useGame((s) => s.items);
  const useStone = useGame((s) => s.useStone);
  const lastResult = useGame((s) => s.lastResult);
  const [selected, setSelected] = useState<string | null>(null);

  const ownedStones = Object.entries(STONE_SPRITES)
    .filter(([id]) => (items[id] as number ?? 0) > 0);

  const eligibleWorkers = selected
    ? workers.map((w, i) => ({ w, i })).filter(({ w }) => applicableStones(w.species.id).includes(selected))
    : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box stone-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">Pierres d'Évolution</span>
          <button className="dex-close" onClick={onClose}>✕</button>
        </div>

        {ownedStones.length === 0 ? (
          <div className="stone-empty">Tu ne possèdes aucune pierre. Achète-en en boutique.</div>
        ) : (
          <>
            <div className="stone-pick-label">Choisis une pierre :</div>
            <div className="stone-grid">
              {ownedStones.map(([id, spr]) => (
                <button key={id} className={`stone-btn ${selected === id ? 'stone-sel' : ''}`} onClick={() => setSelected(selected === id ? null : id)}>
                  <img src={itemSprite(spr)} alt={STONE_NAMES[id]} />
                  <span>{STONE_NAMES[id]}</span>
                  <span className="stone-count">×{items[id] as number}</span>
                </button>
              ))}
            </div>

            {selected && (
              <>
                <div className="stone-pick-label">Pokémon éligibles :</div>
                {eligibleWorkers.length === 0 ? (
                  <div className="stone-empty">Aucun Pokémon de ta collection ne peut évoluer avec cette pierre.</div>
                ) : (
                  <div className="stone-evo-list">
                    {eligibleWorkers.map(({ w, i }) => {
                      const newId = getStoneEvolution(selected, w.species.id);
                      const newSpecies = newId ? ALL_SPECIES.find((s) => s.id === newId) : null;
                      return (
                        <div key={i} className="stone-evo-row">
                          <img className="stone-evo-spr" src={pokemonSprite(w.species.id)} alt={w.species.name} />
                          <div className="stone-evo-info">
                            <span>{w.species.name}</span>
                            <span className="stone-arrow">→</span>
                            {newSpecies && <img className="stone-evo-spr" src={pokemonSprite(newSpecies.id)} alt={newSpecies.name} />}
                            {newSpecies && <span className="stone-evo-new">{newSpecies.name}</span>}
                          </div>
                          <button className="btn primary small" onClick={() => { useStone(selected, i); }}>
                            Utiliser
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {lastResult && <div className="bb-result">{lastResult}</div>}
          </>
        )}
      </div>
    </div>
  );
}
