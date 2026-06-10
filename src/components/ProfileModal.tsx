import { useState } from 'react';
import { useGame } from '../game/gameStore.ts';
import { ACHIEVEMENTS, TITLES, FRAMES, BACKGROUNDS, XP_EFFECTS, type RewardKind } from '../game/achievements.ts';

const AVATAR_ICONS: Record<string, string> = {
  dev: '👨‍💻', dev_f: '👩‍💻', hacker: '🧑‍💻', scientist: '👨‍🔬',
  sci_f: '👩‍🔬', wizard: '🧙', wizard_f: '🧙‍♀️', ai: '🤖',
};

type Tab = 'profil' | 'succes' | 'perso';

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('profil');
  const name = useGame((s) => s.playerName);
  const avatar = useGame((s) => s.playerAvatar);
  const equipped = useGame((s) => s.equipped);
  const level = useGame((s) => s.levelInfo());
  const pokedex = useGame((s) => s.pokedex);
  const shinyDex = useGame((s) => s.shinyDex);
  const bestStreak = useGame((s) => s.bestStreak);
  const expeditionsDone = useGame((s) => s.expeditionsDone);
  const pokerWins = useGame((s) => s.pokerWins);
  const unlocked = useGame((s) => s.unlockedAchievements);
  const unlockedCosmetics = useGame((s) => s.unlockedCosmetics);
  const equipCosmetic = useGame((s) => s.equipCosmetic);

  const frameCss = FRAMES[equipped.frame]?.css ?? 'frame-default';
  const bgCss = BACKGROUNDS[equipped.background]?.css ?? 'bg-default';
  const xpfxCss = XP_EFFECTS[equipped.xpfx]?.css ?? 'xpfx-default';
  const xpPct = Math.floor((level.current / level.needed) * 100);

  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">Profil</span>
          <button className="dex-close" onClick={onClose}>✕</button>
        </div>

        <div className="profile-tabs">
          <button className={`profile-tab ${tab === 'profil' ? 'active' : ''}`} onClick={() => setTab('profil')}>Profil</button>
          <button className={`profile-tab ${tab === 'succes' ? 'active' : ''}`} onClick={() => setTab('succes')}>Succès ({unlockedCount}/{totalCount})</button>
          <button className={`profile-tab ${tab === 'perso' ? 'active' : ''}`} onClick={() => setTab('perso')}>Personnalisation</button>
        </div>

        {tab === 'profil' && (
          <div className="profile-content">
            <div className={`profile-hero ${bgCss}`}>
              <div className={`profile-hero-avatar ${frameCss}`}>{AVATAR_ICONS[avatar] ?? '👤'}</div>
              <div className="profile-hero-name">{name || 'Archiviste'}</div>
              <div className="profile-hero-title">{TITLES[equipped.title] ?? 'Archiviste'}</div>
              <div className="profile-hero-xp">
                <div className={`profile-hero-xp-track ${xpfxCss}`}>
                  <div className="profile-hero-xp-fill" style={{ width: `${xpPct}%` }} />
                  <span className="profile-hero-xp-text">Nv{level.level} · {level.current}/{level.needed} XP</span>
                </div>
              </div>
            </div>
            <div className="profile-stats">
              <div className="profile-stat"><span>{pokedex.length}/386</span><label>Pokédex</label></div>
              <div className="profile-stat"><span>{shinyDex.length}</span><label>Shiny ✦</label></div>
              <div className="profile-stat"><span>🔥{bestStreak}</span><label>Meilleure streak</label></div>
              <div className="profile-stat"><span>{expeditionsDone}</span><label>Expéditions</label></div>
              <div className="profile-stat"><span>{pokerWins}</span><label>Victoires Poker</label></div>
              <div className="profile-stat"><span>{unlockedCount}</span><label>Succès</label></div>
            </div>
          </div>
        )}

        {tab === 'succes' && (
          <div className="achievements-list">
            {ACHIEVEMENTS.map((a) => {
              const got = unlocked.includes(a.id);
              const showHidden = a.hidden && !got;
              return (
                <div key={a.id} className={`achievement-card ${got ? 'ach-unlocked' : 'ach-locked'}`}>
                  <span className="ach-icon">{showHidden ? '❔' : a.icon}</span>
                  <div className="ach-info">
                    <div className="ach-name">{showHidden ? 'Succès caché' : a.name}</div>
                    <div className="ach-desc">{showHidden ? 'Continue de jouer pour le découvrir…' : a.desc}</div>
                    {got && <div className="ach-reward">Débloqué : {a.reward.name}</div>}
                  </div>
                  {got && <span className="ach-check">✓</span>}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'perso' && (
          <div className="customize-content">
            <CosmeticPicker kind="title" label="Titre" all={TITLES} unlocked={unlockedCosmetics} equipped={equipped.title} onPick={(id) => equipCosmetic('title', id)} />
            <CosmeticPicker kind="frame" label="Cadre" all={mapNames(FRAMES)} unlocked={unlockedCosmetics} equipped={equipped.frame} onPick={(id) => equipCosmetic('frame', id)} />
            <CosmeticPicker kind="background" label="Fond" all={mapNames(BACKGROUNDS)} unlocked={unlockedCosmetics} equipped={equipped.background} onPick={(id) => equipCosmetic('background', id)} />
            <CosmeticPicker kind="xpfx" label="Effet barre XP" all={mapNames(XP_EFFECTS)} unlocked={unlockedCosmetics} equipped={equipped.xpfx} onPick={(id) => equipCosmetic('xpfx', id)} />
          </div>
        )}
      </div>
    </div>
  );
}

function mapNames(obj: Record<string, { name: string }>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = v.name;
  return out;
}

function CosmeticPicker({ label, all, unlocked, equipped, onPick }: {
  kind: RewardKind; label: string; all: Record<string, string>;
  unlocked: string[]; equipped: string; onPick: (id: string) => void;
}) {
  return (
    <div className="cosmetic-group">
      <div className="cosmetic-label">{label}</div>
      <div className="cosmetic-options">
        {Object.entries(all).map(([id, nm]) => {
          const has = unlocked.includes(id);
          const isEq = equipped === id;
          return (
            <button
              key={id}
              className={`cosmetic-chip ${isEq ? 'equipped' : ''} ${!has ? 'locked' : ''}`}
              disabled={!has}
              onClick={() => onPick(id)}
            >
              {has ? nm : '🔒'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
