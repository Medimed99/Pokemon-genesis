import { useState } from 'react';
import { useGame } from '../game/gameStore.ts';
import { SHOP_ITEMS, type ShopCategory } from '../game/shopData.ts';
import { itemSprite } from '../game/sprites.ts';

const TABS: { id: ShopCategory; label: string }[] = [
  { id: 'balls',     label: '⚾ Balls'     },
  { id: 'berries',   label: '🍓 Baies'     },
  { id: 'items',     label: '✨ Objets'    },
  { id: 'lootboxes', label: '🎁 Lootboxes' },
];

const BADGE_COLORS: Record<string, string> = {
  'RARE': '#4fa8d0', 'EPIC': '#b060d8', 'LÉGENDAIRE': '#d9a441', 'NOUVEAU': '#1d9e75',
};

export default function ShopModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<ShopCategory>('balls');
  const buyShopItem = useGame((s) => s.buyShopItem);
  const balances    = useGame((s) => s.balances);
  const visible = SHOP_ITEMS.filter((i) => i.category === tab);

  function canBuy(price: number, currency: string): boolean {
    if (currency === 'coins')          return (balances.coins ?? 0) >= price;
    if (currency === 'eo')             return balances.eo >= price;
    if (currency === 'luxury_tokens')  return balances.luxury_tokens >= price;
    return false;
  }

  function currIcon(currency: string): string {
    if (currency === 'coins') return '💰';
    if (currency === 'eo')    return '⚡';
    return '🎫';
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box shop-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">⚙ Boutique Genesis</span>
          <div className="modal-bal">
            <span>💰 {Math.floor(balances.coins ?? 0).toLocaleString()}</span>
            <span>🎫 {Math.floor(balances.luxury_tokens ?? 0)}</span>
          </div>
          <button className="dex-close" onClick={onClose}>✕</button>
        </div>

        <div className="shop-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`shop-tab ${tab === t.id ? 'shop-tab-active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="shop-items-list">
          {visible.map((item) => {
            const buyable = canBuy(item.price, item.currency);
            return (
              <div key={item.id} className={`shop-item-row ${!buyable ? 'shop-item-locked' : ''}`}>
                <div className="shop-item-sprite">
                  <img src={itemSprite(item.itemSpriteName ?? 'poke-ball')} alt={item.name} />
                  {item.badge && (
                    <span className="shop-badge" style={{ background: BADGE_COLORS[item.badge] ?? '#888' }}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="shop-item-info">
                  <div className="shop-item-name">{item.name}</div>
                  <div className="shop-item-desc">{item.description}</div>
                </div>
                <button
                  className={`shop-item-btn ${buyable ? 'buyable' : ''}`}
                  disabled={!buyable}
                  onClick={() => buyShopItem(item.id)}
                >
                  <span>{currIcon(item.currency)}</span>
                  <span>{item.price.toLocaleString()}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
