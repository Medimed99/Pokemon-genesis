import { useState } from 'react';
import { useGame } from '../game/gameStore.ts';
import { SHOP_ITEMS, type ShopCategory } from '../game/shopData.ts';

const TABS: { id: ShopCategory; label: string; icon: string }[] = [
  { id: 'balls',   label: 'Balls',    icon: '⚪' },
  { id: 'berries', label: 'Baies',    icon: '🍓' },
  { id: 'special', label: 'Spéciaux', icon: '✨' },
];

export default function ShopModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<ShopCategory>('balls');
  const buyShopItem = useGame((s) => s.buyShopItem);
  const balances    = useGame((s) => s.balances);

  const visible = SHOP_ITEMS.filter((i) => i.category === tab);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">⚙ Boutique Genesis</span>
          <div className="modal-bal">
            <span>💰 {Math.floor(balances.coins)}</span>
            <span>⚡ {Math.floor(balances.eo)}</span>
            <span>🎫 {Math.floor(balances.luxury_tokens)}</span>
          </div>
          <button className="dex-close" onClick={onClose}>✕</button>
        </div>

        <div className="shop-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`shop-tab ${tab === t.id ? 'shop-tab-active' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="shop-grid">
          {visible.map((item) => {
            const bal = item.currency === 'coins' ? balances.coins : item.currency === 'eo' ? balances.eo : balances.luxury_tokens;
            const canBuy = bal >= item.price;
            const currIcon = item.currency === 'coins' ? '💰' : item.currency === 'eo' ? '⚡' : '🎫';
            return (
              <div key={item.id} className="shop-card">
                <div className="shop-card-icon">{item.icon}</div>
                <div className="shop-card-body">
                  <div className="shop-card-name">{item.name}</div>
                  <div className="shop-card-desc">{item.description}</div>
                </div>
                <button
                  className="btn primary small shop-buy-btn"
                  disabled={!canBuy}
                  onClick={() => buyShopItem(item.id)}
                >
                  {currIcon} {item.price}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
