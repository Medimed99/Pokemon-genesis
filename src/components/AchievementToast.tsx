import { useEffect } from 'react';
import { useGame } from '../game/gameStore.ts';
import { ACHIEVEMENTS } from '../game/achievements.ts';
import { itemSprite, UI_SPRITES } from '../game/sprites.ts';

export default function AchievementToast() {
  const newlyUnlocked = useGame((s) => s.newlyUnlocked);
  const dismissUnlock = useGame((s) => s.dismissUnlock);
  const current = newlyUnlocked[0];

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => dismissUnlock(current), 4000);
    return () => clearTimeout(t);
  }, [current, dismissUnlock]);

  if (!current) return null;
  const a = ACHIEVEMENTS.find((x) => x.id === current);
  if (!a) return null;

  return (
    <div className="ach-toast" onClick={() => dismissUnlock(current)}>
      <img className="ach-toast-icon-spr" src={itemSprite(a.icon)} alt="" />
      <div className="ach-toast-body">
        <div className="ach-toast-label"><img className="ui-ico-xs" src={UI_SPRITES.trophy} alt="" /> Succès débloqué !</div>
        <div className="ach-toast-name">{a.name}</div>
        <div className="ach-toast-reward">Récompense : {a.reward.name}</div>
      </div>
    </div>
  );
}
