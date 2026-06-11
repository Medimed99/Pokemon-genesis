import { useExp } from '../game/expeditionStore.ts';
import type { MapNode, NodeType } from '../game/expedition.ts';
import { pokemonSprite, itemSprite, UI_SPRITES } from '../game/sprites.ts';

const VIEW_W = 360;
const ROW_H = 96;
const COL_X = [110, 250];
const CENTER_X = 180;

function nodePos(node: MapNode, maxRow: number): { x: number; y: number } {
  const isCenter = node.type === 'start' || node.type === 'boss';
  const x = isCenter ? CENTER_X : COL_X[node.col];
  const y = (maxRow - node.row) * ROW_H + 70;
  return { x, y };
}

function nodeIconSprite(node: MapNode): string {
  switch (node.type) {
    case 'battle_wild':
    case 'battle_trainer':
    case 'boss':    return pokemonSprite(node.previewId);
    case 'capture': return itemSprite('poke-ball');
    case 'item':    return itemSprite('rare-candy');
    case 'heal':    return itemSprite('potion');
    default:        return itemSprite('poke-ball');
  }
}

const NODE_LABELS: Record<NodeType, string> = {
  start: 'Départ', battle_wild: 'Sauvage', battle_trainer: 'Dresseur',
  capture: 'Capture', item: 'Objet', heal: 'Soin', boss: 'BOSS',
};

const NODE_RING: Record<NodeType, string> = {
  start: '#6f8d83', battle_wild: '#5cb85c', battle_trainer: '#4fa8d0',
  capture: '#d9a441', item: '#b060d8', heal: '#36e3a6', boss: '#ff4444',
};

function itemKey(id: string): string {
  const map: Record<string, string> = {
    belt_combat: 'black-belt', mystic_water: 'mystic-water', miracle_seed: 'miracle-seed',
    charcoal: 'charcoal', magnet: 'magnet', quick_claw: 'quick-claw', kings_rock: 'kings-rock',
    choice_scarf: 'choice-scarf', rare_candy: 'rare-candy', lucky_egg: 'lucky-egg',
    leftovers: 'leftovers', coin_rune: 'amulet-coin',
  };
  return map[id] ?? 'rare-candy';
}

export default function ExpeditionMap() {
  const mapNodes = useExp((s) => s.mapNodes);
  const chooseNode = useExp((s) => s.chooseNode);
  const badges = useExp((s) => s.badges);
  const team = useExp((s) => s.team);
  const currentNodeId = useExp((s) => s.currentNodeId);

  const maxRow = Math.max(...mapNodes.map((n) => n.row));
  const svgH = (maxRow + 1) * ROW_H + 40;
  const posOf = (n: MapNode) => nodePos(n, maxRow);
  const currentNode = mapNodes.find((n) => n.id === currentNodeId);
  const playerPos = currentNode ? posOf(currentNode) : { x: CENTER_X, y: svgH - 60 };

  return (
    <div className="exp-map-wrap">
      <div className="exp-map-header">
        <span className="exp-map-title">Expédition Arcanes</span>
        <span className="exp-map-badges"><img className="ui-ico-sm" src={UI_SPRITES.badge} alt="" /> {badges} Badge{badges !== 1 ? 's' : ''}</span>
      </div>

      <div className="exp-team-row">
        {team.map((p) => (
          <div key={p.uid} className={`exp-team-chip ${p.fainted ? 'fainted' : ''}`}>
            <img src={pokemonSprite(p.species.id)} alt={p.species.name} />
            <div className="exp-chip-info">
              <span className="exp-chip-name">{p.species.name}</span>
              <div className="exp-chip-hp"><div className="exp-chip-hp-fill" style={{ width: `${Math.floor(p.currentHp / p.maxHp * 100)}%` }} /></div>
              <span className="exp-chip-lv">Nv{p.level}</span>
            </div>
            {p.item && <img className="exp-chip-item-spr" src={itemSprite(itemKey(p.item.id))} alt={p.item.name} />}
          </div>
        ))}
      </div>

      <div className="exp-map-canvas">
        <svg viewBox={`0 0 ${VIEW_W} ${svgH}`} width="100%" style={{ display: 'block' }}>
          {mapNodes.map((node) =>
            node.connections.map((cid) => {
              const target = mapNodes.find((n) => n.id === cid);
              if (!target) return null;
              const a = posOf(node), b = posOf(target);
              const reachableNext = node.cleared && target.reachable && !target.cleared;
              return (
                <line key={`${node.id}-${cid}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={reachableNext ? '#36e3a6' : '#ffffff33'} strokeWidth={reachableNext ? 2.5 : 1.5}
                  strokeDasharray="5 5" />
              );
            })
          )}

          {mapNodes.map((node) => {
            const { x, y } = posOf(node);
            const ring = NODE_RING[node.type];
            const clickable = node.reachable && !node.cleared;
            const isBoss = node.type === 'boss';
            const r = isBoss ? 30 : 24;
            return (
              <g key={node.id}
                 onClick={() => clickable && chooseNode(node.id)}
                 style={{ cursor: clickable ? 'pointer' : 'default', opacity: node.cleared ? 0.4 : (node.reachable || node.type === 'start' ? 1 : 0.45) }}>
                <circle cx={x} cy={y} r={r} fill="#0c1a15" stroke={ring} strokeWidth={clickable ? 3 : 1.5}
                  className={clickable ? (isBoss ? 'node-boss-glow' : 'node-reach-glow') : ''} />
                {node.type === 'start' ? (
                  <image href={UI_SPRITES.expedition} x={x - 12} y={y - 12} width="24" height="24" style={{ imageRendering: 'pixelated' }} />
                ) : (
                  <image href={nodeIconSprite(node)} x={x - r * 0.7} y={y - r * 0.7} width={r * 1.4} height={r * 1.4} style={{ imageRendering: 'pixelated' }} />
                )}
                <text x={x} y={y + r + 12} textAnchor="middle" fontSize="10" fill={clickable ? ring : '#88a097'} fontWeight={isBoss ? 700 : 400}>
                  {NODE_LABELS[node.type]}
                </text>
              </g>
            );
          })}

          {team[0] && (
            <g>
              <circle cx={playerPos.x + 36} cy={playerPos.y} r="15" fill="#0c1a15" stroke="#36e3a6" strokeWidth="2" />
              <image href={pokemonSprite(team[0].species.id)} x={playerPos.x + 25} y={playerPos.y - 11} width="22" height="22" style={{ imageRendering: 'pixelated' }} />
            </g>
          )}
        </svg>
      </div>

      <div className="exp-map-hint">Choisis un nœud lumineux pour avancer vers le Boss.</div>
    </div>
  );
}
