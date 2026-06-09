import { useExp } from '../game/expeditionStore.ts';
import type { MapNode, NodeType } from '../game/expedition.ts';

const NODE_ICONS: Record<NodeType, string> = {
  start:          '🏠',
  battle_wild:    '🌿',
  battle_trainer: '🧢',
  capture:        '⚽',
  item:           '🎁',
  heal:           '💊',
  boss:           '💀',
};
const NODE_LABELS: Record<NodeType, string> = {
  start:          'Départ',
  battle_wild:    'Sauvage',
  battle_trainer: 'Dresseur',
  capture:        'Capture',
  item:           'Objet',
  heal:           'Soin',
  boss:           'Boss',
};
const NODE_COLORS: Record<NodeType, string> = {
  start:          '#6f8d83',
  battle_wild:    '#5cb85c',
  battle_trainer: '#4fa8d0',
  capture:        '#d9a441',
  item:           '#b060d8',
  heal:           '#e8473f',
  boss:           '#ff4444',
};

function Node({ node, onTap }: { node: MapNode; onTap: () => void }) {
  const color = NODE_COLORS[node.type];
  const isBoss = node.type === 'boss';
  return (
    <button
      className={`map-node ${node.cleared ? 'node-cleared' : ''} ${node.reachable && !node.cleared ? 'node-reachable' : ''} ${!node.reachable && !node.cleared ? 'node-locked' : ''} ${isBoss ? 'node-boss' : ''}`}
      style={{ '--node-color': color } as React.CSSProperties}
      onClick={onTap}
      disabled={!node.reachable || node.cleared}
    >
      <span className="node-icon">{NODE_ICONS[node.type]}</span>
      <span className="node-label">{NODE_LABELS[node.type]}</span>
    </button>
  );
}

export default function ExpeditionMap() {
  const mapNodes = useExp((s) => s.mapNodes);
  const chooseNode = useExp((s) => s.chooseNode);
  const badges = useExp((s) => s.badges);
  const team = useExp((s) => s.team);

  // Group nodes by row
  const rows = new Map<number, MapNode[]>();
  for (const n of mapNodes) {
    if (!rows.has(n.row)) rows.set(n.row, []);
    rows.get(n.row)!.push(n);
  }
  const sortedRows = [...rows.entries()].sort((a, b) => b[0] - a[0]); // boss at top

  return (
    <div className="exp-map-wrap">
      <div className="exp-map-header">
        <span className="exp-map-title">Expédition Arcanes</span>
        <span className="exp-map-badges">🏅 {badges} Badge{badges !== 1 ? 's' : ''}</span>
      </div>

      {/* Team preview */}
      <div className="exp-team-row">
        {team.map((p) => (
          <div key={p.uid} className={`exp-team-chip ${p.fainted ? 'fainted' : ''}`}>
            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.species.id}.png`} alt={p.species.name} />
            <div className="exp-chip-info">
              <span className="exp-chip-name">{p.species.name}</span>
              <div className="exp-chip-hp">
                <div className="exp-chip-hp-fill" style={{ width: `${Math.floor(p.currentHp / p.maxHp * 100)}%` }} />
              </div>
              <span className="exp-chip-lv">Nv{p.level}</span>
            </div>
            {p.item && <span className="exp-chip-item" title={p.item.name}>{p.item.icon}</span>}
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="exp-map">
        {sortedRows.map(([row, nodes]) => (
          <div key={row} className="map-row">
            {nodes.map((node) => (
              <Node key={node.id} node={node} onTap={() => chooseNode(node.id)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
