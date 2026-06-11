import { useState } from 'react';
import { useGame } from '../game/gameStore.ts';
import { spriteUrl } from '../game/pokedex.ts';
import { ALL_SPECIES, REGIONS, type Region, type Species } from '../game/kanto.ts';
import { computeProgress } from '../game/progression.ts';

type Filter = 'all' | 'caught' | 'missing' | 'shiny';

export default function PokedexScreen({ onClose }: { onClose: () => void }) {
  const pokedex = useGame((s) => s.pokedex);
  const shinyDex = useGame((s) => s.shinyDex);
  const [region, setRegion] = useState<Region>('Kanto');
  const [filter, setFilter] = useState<Filter>('all');

  const progress = computeProgress(pokedex, shinyDex);
  const caughtSet = new Set(pokedex);
  const shinySet = new Set(shinyDex);

  const regionProgress = progress.find((p) => p.region === region)!;
  const speciesInRegion = ALL_SPECIES.filter((s) => s.region === region);

  const filtered = speciesInRegion.filter((s) => {
    const caught = caughtSet.has(s.id);
    const shiny = shinySet.has(s.id);
    if (filter === 'caught') return caught;
    if (filter === 'missing') return !caught;
    if (filter === 'shiny') return shiny;
    return true;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box pokedex-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">Pokédex</span>
          <button className="dex-close" onClick={onClose}>✕</button>
        </div>

        {/* Region tabs */}
        <div className="pokedex-regions">
          {REGIONS.map((r) => {
            const p = progress.find((x) => x.region === r)!;
            return (
              <button
                key={r}
                className={`pokedex-region-tab ${region === r ? 'active' : ''} ${!p.unlocked ? 'locked' : ''}`}
                disabled={!p.unlocked}
                onClick={() => setRegion(r)}
              >
                <span className="prt-name">{p.unlocked ? r : `× ${r}`}</span>
                <span className="prt-count">{p.caught}/{p.total}</span>
              </button>
            );
          })}
        </div>

        {/* Region progress bars */}
        <div className="pokedex-progress">
          <div className="pkx-bar-row">
            <span className="pkx-bar-label">Capturés</span>
            <div className="pkx-bar-track">
              <div className="pkx-bar-fill caught" style={{ width: `${regionProgress.pctCaught}%` }} />
            </div>
            <span className="pkx-bar-val">{regionProgress.caught}/{regionProgress.total}</span>
          </div>
          <div className="pkx-bar-row">
            <span className="pkx-bar-label">Shiny ✦</span>
            <div className="pkx-bar-track">
              <div className="pkx-bar-fill shiny" style={{ width: `${Math.floor(regionProgress.shiny / regionProgress.total * 100)}%` }} />
            </div>
            <span className="pkx-bar-val">{regionProgress.shiny}/{regionProgress.total}</span>
          </div>
          {!regionProgress.complete && region !== 'Hoenn' && (
            <div className="pkx-unlock-hint">
              Complète {region} à 100% pour débloquer {region === 'Kanto' ? 'Johto' : 'Hoenn'} —
              il te manque <strong>{regionProgress.total - regionProgress.caught}</strong> Pokémon.
            </div>
          )}
          {regionProgress.complete && (
            <div className="pkx-complete-badge">✓ Région complétée à 100% !</div>
          )}
        </div>

        {/* Filters */}
        <div className="pokedex-filters">
          {(['all','caught','missing','shiny'] as Filter[]).map((f) => (
            <button key={f} className={`pkx-filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Tous' : f === 'caught' ? 'Capturés' : f === 'missing' ? 'Manquants' : 'Shiny'}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="pokedex-grid">
          {filtered.map((s: Species) => {
            const caught = caughtSet.has(s.id);
            const shiny = shinySet.has(s.id);
            return (
              <div key={s.id} className={`pkx-entry ${caught ? 'caught' : 'missing'} ${shiny ? 'shiny' : ''}`}>
                <img
                  src={spriteUrl(s.id, shiny)}
                  alt={caught ? s.name : '???'}
                  className="pkx-sprite"
                  style={{ filter: caught ? 'none' : 'brightness(0)' }}
                  loading="lazy"
                />
                <div className="pkx-num">#{String(s.id).padStart(3, '0')}</div>
                <div className="pkx-name">{caught ? s.name : '???'}</div>
                {shiny && <div className="pkx-shiny-star">✦</div>}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="pkx-empty">Aucun Pokémon dans ce filtre.</div>}
        </div>
      </div>
    </div>
  );
}
