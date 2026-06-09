import { useGame } from '../game/gameStore.ts';
import { DEFAULT_CONFIG } from '../engine/config.ts';

function fmt(n: number): string {
  n = Math.floor(n);
  if (n < 1000) return String(n);
  const u = ['K', 'M', 'B', 'T'];
  let i = -1;
  while (n >= 1000 && i < u.length - 1) { n /= 1000; i += 1; }
  return n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0) + u[i];
}

export default function Hud() {
  const balances = useGame((s) => s.balances);
  const pps = useGame((s) => s.totalPps());
  const cap = DEFAULT_CONFIG.bandwidth.cap;

  return (
    <div className="hud">
      <div className="metric">
        <span className="metric-label">Énergie Onirique</span>
        <span className="metric-value">{fmt(balances.eo)}</span>
      </div>
      <div className="metric">
        <span className="metric-label">EO / sec</span>
        <span className="metric-value">{fmt(pps)}</span>
      </div>
      <div className="metric">
        <span className="metric-label">Bande passante</span>
        <span className="metric-value">{Math.floor(balances.bandwidth)}/{cap}</span>
      </div>
    </div>
  );
}
