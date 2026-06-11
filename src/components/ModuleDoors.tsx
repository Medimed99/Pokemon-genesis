import { useGame } from '../game/gameStore.ts';
import { useExp } from '../game/expeditionStore.ts';
import { usePoker } from '../game/pokerStore.ts';
import { UI_SPRITES } from '../game/sprites.ts';

interface Props { onShop: () => void; onStones: () => void; }

export default function ModuleDoors({ onShop, onStones }: Props) {
  const phase = useGame((s) => s.phase);
  const openGate = useExp((s) => s.openGate);
  const openPoker = usePoker((s) => s.startGame);
  const pokerPhase = usePoker((s) => s.phase);
  const unlocked = phase === 'free';

  return (
    <div className="doors-wrap">
      <div className="doors">
        <div className={`door ${unlocked ? 'unlocked' : 'locked'}`}>
          {unlocked ? (
            <>
              <img className="door-ico" src={UI_SPRITES.expedition} alt="" />
              <div className="door-label">Expédition Arcanes</div>
              <div className="door-sub">Roguelike · Acte II</div>
              <button className="btn primary small" onClick={openGate}>Lancer une run</button>
            </>
          ) : (
            <>
              <div className="door-lock">⌧</div>
              <div className="door-label">Expédition Arcanes</div>
              <div className="door-sub">Roguelike · Acte II</div>
              <div className="door-status">bientôt en ligne</div>
            </>
          )}
        </div>
        <div className={`door ${unlocked ? 'unlocked' : 'locked'}`}>
          {unlocked ? (
            <>
              <img className="door-ico" src={UI_SPRITES.poker} alt="" />
              <div className="door-label">Poké-Poker</div>
              <div className="door-sub">Deckbuilder · Acte III</div>
              <button className="btn primary small" disabled={pokerPhase !== 'gate'} onClick={openPoker}>Jouer</button>
            </>
          ) : (
            <>
              <div className="door-lock">⌧</div>
              <div className="door-label">Poké-Poker</div>
              <div className="door-sub">Deckbuilder · Acte III</div>
              <div className="door-status">bientôt en ligne</div>
            </>
          )}
        </div>
      </div>
      <div className="doors-btns">
        <button className="btn shop-btn" onClick={onShop}><img className="ui-ico-sm" src={UI_SPRITES.shop} alt="" /> Boutique Genesis</button>
        <button className="btn shop-btn stones-btn" onClick={onStones}><img className="ui-ico-sm" src={UI_SPRITES.stones} alt="" /> Pierres d'évolution</button>
      </div>
    </div>
  );
}
