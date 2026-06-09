import { usePoker, type PokerCard } from '../game/pokerStore.ts';
import { spriteUrl } from '../game/pokedex.ts';

const TYPE_COLOR: Record<string, string> = {
  Feu:'#e8473f', Eau:'#4fa8d0', Plante:'#5cb85c', Psy:'#b060d8',
  Électrik:'#f0c040', Glace:'#6ed8e8', Combat:'#c04020', Poison:'#a060a0',
  Sol:'#d0a050', Roche:'#b09060', Insecte:'#90b030', Spectre:'#6050a0',
  Dragon:'#5050d0', Ténèbres:'#503040', Acier:'#90a0a8', Normal:'#a0a080',
  Vol:'#80a0e0', Fée:'#e080b0',
};

const RANK_LABEL: Record<number, string> = { 1:'A', 11:'J', 12:'Q', 13:'K' };

function Card({ card, onTap }: { card: PokerCard; onTap: () => void }) {
  const suit = card.deck.suit;
  const color = TYPE_COLOR[suit] ?? '#888';
  const rank = RANK_LABEL[card.deck.rank] ?? String(card.deck.rank);

  return (
    <div
      className={`pcard ${card.selected ? 'pcard-sel' : ''}`}
      style={{ borderColor: color, '--suit-color': color } as React.CSSProperties}
      onClick={onTap}
    >
      <div className="pcard-rank" style={{ color }}>{rank}</div>
      <img className="pcard-sprite" src={spriteUrl(card.deck.speciesId)} alt={card.deck.name} />
      <div className="pcard-suit" style={{ background: color }}>{suit.slice(0, 3)}</div>
    </div>
  );
}

export default function PokerHand() {
  const hand = usePoker((s) => s.hand);
  const toggle = usePoker((s) => s.toggleSelect);
  const selectedCount = hand.filter((c) => c.selected).length;

  return (
    <div className="phand-wrap">
      <div className="phand-hint">{selectedCount > 0 ? `${selectedCount} carte(s) sélectionnée(s)` : 'Touche des cartes pour les sélectionner'}</div>
      <div className="phand">
        {hand.map((card) => (
          <Card key={card.uid} card={card} onTap={() => toggle(card.uid)} />
        ))}
      </div>
    </div>
  );
}
