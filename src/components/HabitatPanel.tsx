import { useGame, workerPps } from '../game/gameStore.ts';
import { spriteUrl } from '../game/pokedex.ts';

export default function HabitatPanel() {
  const workers = useGame((s) => s.workers);

  return (
    <div className="habitat">
      <div className="habitat-head">
        <span className="habitat-name">Forêt de Jade</span>
        <span className="habitat-type">habitat Plante · bonus ×1.2</span>
      </div>

      <div className="worker-grid">
        {workers.map((w, i) => (
          <div className="worker" key={i}>
            <img src={spriteUrl(w.species.id, w.shiny)} alt={w.species.name} />
            <div className="worker-name">
              {w.species.name}{w.shiny ? ' ✦' : ''} <span className="worker-lvl">N{w.level}</span>
            </div>
            <div className="worker-pps">{workerPps(w).toFixed(1)}/s</div>
          </div>
        ))}
        {workers.length === 0 && (
          <div className="worker empty">Aucun ouvrier — capture-en un via la Blind Box</div>
        )}
      </div>
    </div>
  );
}
