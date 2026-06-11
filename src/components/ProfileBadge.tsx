import { useGame } from '../game/gameStore.ts';
import { TITLES, FRAMES, BACKGROUNDS } from '../game/achievements.ts';
import { levelFromXp } from '../game/captureEconomy.ts';
import { avatarPokeId } from '../game/avatars.ts';
import { pokemonSprite } from '../game/sprites.ts';

export default function ProfileBadge({ onOpen }: { onOpen: () => void }) {
  const name = useGame((s) => s.playerName);
  const avatar = useGame((s) => s.playerAvatar);
  const equipped = useGame((s) => s.equipped);
  const totalXp = useGame((s) => s.totalXp);
  const level = levelFromXp(totalXp);

  const frameCss = FRAMES[equipped.frame]?.css ?? 'frame-default';
  const bgCss = BACKGROUNDS[equipped.background]?.css ?? 'bg-default';
  const title = TITLES[equipped.title] ?? 'Archiviste';

  return (
    <button className={`profile-badge ${bgCss}`} onClick={onOpen}>
      <div className={`profile-avatar ${frameCss}`}><img className="profile-avatar-spr" src={pokemonSprite(avatarPokeId(avatar))} alt="" /></div>
      <div className="profile-badge-info">
        <div className="profile-badge-name">{name || 'Archiviste'}</div>
        <div className="profile-badge-title">{title}</div>
      </div>
      <div className="profile-badge-lv">Nv{level.level}</div>
    </button>
  );
}
