import { useState } from 'react';
import { useGame } from '../game/gameStore.ts';
import { SHOP_ITEMS, type ShopCategory } from '../game/shopData.ts';
<<<<<<< HEAD
import { itemSprite, UI_SPRITES } from '../game/sprites.ts';

const TABS: { id: ShopCategory; label: string; spr: string }[] = [
  { id: 'balls',     label: 'Balls',     spr: itemSprite('poke-ball')  },
  { id: 'berries',   label: 'Baies',     spr: itemSprite('razz-berry') },
  { id: 'items',     label: 'Objets',    spr: itemSprite('fire-stone') },
  { id: 'lootboxes', label: 'Lootboxes', spr: itemSprite('nugget')     },
=======
import { itemSprite } from '../game/sprites.ts';

const TABS: { id: ShopCategory; label: string }[] = [
  { id: 'balls',     label: '⚾ Balls'     },
  { id: 'berries',   label: '🍓 Baies'     },
  { id: 'items',     label: '✨ Objets'    },
  { id: 'lootboxes', label: '🎁 Lootboxes' },
>>>>>>> 144165047627239bd21da23e25f46140ab9d66d6
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
<<<<<<< HEAD
    if (currency === 'coins') return UI_SPRITES.coins;
    if (currency === 'eo')    return UI_SPRITES.eo;
    return UI_SPRITES.luxury;
=======
    if (currency === 'coins') return '💰';
    if (currency === 'eo')    return '⚡';
    return '🎫';
>>>>>>> 144165047627239bd21da23e25f46140ab9d66d6
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box shop-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">Boutique Genesis</span>
          <div className="modal-bal">
<<<<<<< HEAD
            <span><img className="ui-ico-sm" src={UI_SPRITES.coins} alt="" /> {Math.floor(balances.coins ?? 0).toLocaleString()}</span>
            <span><img className="ui-ico-sm" src={UI_SPRITES.luxury} alt="" /> {Math.floor(balances.luxury_tokens ?? 0)}</span>
=======
            <span>💰 {Math.floor(balances.coins ?? 0).toLocaleString()}</span>
            <span>🎫 {Math.floor(balances.luxury_tokens ?? 0)}</span>
>>>>>>> 144165047627239bd21da23e25f46140ab9d66d6
          </div>
          <button className="dex-close" onClick={onClose}>✕</button>
        </div>

        <div className="shop-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`shop-tab ${tab === t.id ? 'shop-tab-active' : ''}`} onClick={() => setTab(t.id)}>
<<<<<<< HEAD
              <img className="ui-ico-sm" src={t.spr} alt="" /> {t.label}
=======
              {t.label}
>>>>>>> 144165047627239bd21da23e25f46140ab9d66d6
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
<<<<<<< HEAD
                  <img className="ui-ico-sm" src={currIcon(item.currency)} alt="" />
=======
                  <span>{currIcon(item.currency)}</span>
>>>>>>> 144165047627239bd21da23e25f46140ab9d66d6
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
