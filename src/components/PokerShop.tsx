import { usePoker } from '../game/pokerStore.ts';
import { HAND_BASE, type HandRank } from '../game/pokerHands.ts';

const RARITY_COLOR: Record<string, string> = {
  common:'var(--text)', uncommon:'#4fa8d0', rare:'#d9a441',
  legendary:'#e8473f', planet:'#5cb85c', arcana:'#b060d8', spectral:'#e080b0',
};

export default function PokerShop() {
  const { gold, shopItems, jokers, handLevels, ante, buyShopItem, nextBlind } = usePoker((s) => ({
    gold: s.gold, shopItems: s.shopItems, jokers: s.jokers,
    handLevels: s.handLevels, ante: s.ante,
    buyShopItem: s.buyShopItem, nextBlind: s.nextBlind,
  }));

  return (
    <div className="shop">
      <div className="shop-header">
        <div className="shop-title">Boutique Genesis</div>
        <div className="shop-gold">💰 {gold} Jetons</div>
      </div>

      <div className="shop-items">
        {shopItems.map((item, i) => (
          <div key={item.card.id} className="shop-item">
            <div className="shop-item-top">
              <span className="shop-icon">{item.card.icon}</span>
              <div>
                <div className="shop-name" style={{ color: RARITY_COLOR[item.card.rarity] }}>
                  {item.card.name_fr}
                </div>
                <div className="shop-rarity">{item.card.rarity} · {item.card.category}</div>
              </div>
            </div>
            <div className="shop-tooltip">{item.card.tooltip}</div>
            <button
              className="btn primary small"
              disabled={gold < item.price || (item.card.category === 'joker' && jokers.length >= 5)}
              onClick={() => buyShopItem(i)}
            >
              Acheter — {item.price} 💰
            </button>
          </div>
        ))}
        {shopItems.length === 0 && <div className="shop-empty">Boutique vide.</div>}
      </div>

      <div className="shop-levels">
        <div className="shop-levels-title">Niveaux de mains</div>
        <div className="shop-levels-grid">
          {(Object.keys(HAND_BASE) as HandRank[]).map((rank) => (
            <div key={rank} className="shop-level-row">
              <span>{HAND_BASE[rank].label}</span>
              <span className="shop-level-lv">Nv{handLevels[rank] ?? 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="shop-jokers">
        <div className="shop-levels-title">Jokers actifs ({jokers.length}/5)</div>
        <div className="joker-row">
          {jokers.map((j) => (
            <div key={j.id} className="joker-chip" title={j.tooltip}>{j.icon} {j.name_fr}</div>
          ))}
          {jokers.length === 0 && <span style={{ color: 'var(--muted)', fontSize: 12 }}>Aucun joker actif.</span>}
        </div>
      </div>

      <button className="btn primary" onClick={nextBlind}>
        {ante < 4 ? 'Blind suivant →' : 'Terminer la run →'}
      </button>
    </div>
  );
}
