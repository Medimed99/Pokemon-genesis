import { useGame } from '../game/gameStore.ts';
import { DEFAULT_CONFIG } from '../engine/config.ts';
import { streakShinyBonus, levelFromXp } from '../game/captureEconomy.ts';

function fmt(n: number): string {
  n = Math.floor(n);
  if (n < 1000) return String(n);
  const u = ['K', 'M', 'B', 'T'];
  let i = -1;
  while (n >= 1000 && i < u.length - 1) { n /= 1000; i += 1; }
  return n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0) + u[i];
}

export default function Hud({ onPokedex, onQuests }: { onPokedex: () => void; onQuests: () => void }) {
  const balances  = useGame((s) => s.balances);
  const workers   = useGame((s) => s.workers);
  const pokedex   = useGame((s) => s.pokedex);
  const streak    = useGame((s) => s.streak);
  const totalXp   = useGame((s) => s.totalXp);
  const quests    = useGame((s) => s.quests);
  const cap = DEFAULT_CONFIG.bandwidth.cap;

  // Calculs purs en dehors du store — pas de sélecteurs instables
  const pps = workers.reduce((acc, w) => {
    const rarity = w.shiny ? 10 : 1;
    const type = w.species.types.includes('Plante') ? 1.2 : 1;
    return acc + (w.species.bst / 10) * rarity * type * w.level;
  }, 0);
  const level = levelFromXp(totalXp);
  const xpPct = Math.floor((level.current / level.needed) * 100);
  const shinyBonus = streakShinyBonus(streak);
  const claimable = quests.filter((q) => !q.claimed && q.progress >= q.target).length;

  return (
    <>
      <div className="player-bar">
        <div className="player-level">Nv{level.level}</div>
        <div className="player-xp-track">
          <div className="player-xp-fill" style={{ width: `${xpPct}%` }} />
          <span className="player-xp-text">Archiviste · {level.current}/{level.needed} XP</span>
        </div>
        <button className="player-quests-btn" onClick={onQuests}>
          📋{claimable > 0 && <span className="quest-badge">{claimable}</span>}
        </button>
      </div>

      <div className="hud">
        <div className="metric">
          <span className="metric-label">💰 Coins</span>
          <span className="metric-value">{fmt(balances.coins ?? 0)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">⚡ EO</span>
          <span className="metric-value">{fmt(balances.eo)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">📶 Bande p.</span>
          <span className="metric-value">{Math.floor(balances.bandwidth)}/{cap}</span>
        </div>
      </div>

      <div className="hud-secondary">
        <div className={`streak-chip ${streak >= 10 ? 'streak-hot' : ''}`}>
          🔥 {streak}
          {shinyBonus > 0 && <span className="streak-bonus">+{(shinyBonus * 100).toFixed(1)}% shiny</span>}
        </div>
        <div className="eos-chip">{fmt(pps)} EO/s</div>
      </div>

      <button className="hud-dex-bar" onClick={onPokedex}>
        <span className="hud-dex-region">📍 Kanto</span>
        <span className="hud-dex-label">📕 Pokédex</span>
        <span className="hud-dex-count">{pokedex.length}/386</span>
      </button>
    </>
  );
}
