import { useGame } from '../game/gameStore.ts';
import { TITLES, FRAMES, BACKGROUNDS } from '../game/achievements.ts';
import { levelFromXp } from '../game/captureEconomy.ts';

const AVATAR_ICONS: Record<string, string> = {
  dev: '👨‍💻', dev_f: '👩‍💻', hacker: '🧑‍💻', scientist: '👨‍🔬',
  sci_f: '👩‍🔬', wizard: '🧙', wizard_f: '🧙‍♀️', ai: '🤖',
};

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
      <div className={`profile-avatar ${frameCss}`}>{AVATAR_ICONS[avatar] ?? '👤'}</div>
      <div className="profile-badge-info">
        <div className="profile-badge-name">{name || 'Archiviste'}</div>
        <div className="profile-badge-title">{title}</div>
      </div>
      <div className="profile-badge-lv">Nv{level.level}</div>
    </button>
  );
}
