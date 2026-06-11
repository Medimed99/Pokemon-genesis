import { useGame } from '../game/gameStore.ts';
import { itemSprite, UI_SPRITES } from '../game/sprites.ts';

export default function QuestsModal({ onClose }: { onClose: () => void }) {
  const quests = useGame((s) => s.quests);
  const claimQuest = useGame((s) => s.claimQuest);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">Quêtes du jour</span>
          <button className="dex-close" onClick={onClose}>✕</button>
        </div>

        <div className="quests-list">
          {quests.map((q) => {
            const pct = Math.min(100, Math.floor((q.progress / q.target) * 100));
            const done = q.progress >= q.target;
            const r = q.reward;
            return (
              <div key={q.id} className={`quest-card ${q.claimed ? 'quest-claimed' : ''}`}>
                <div className="quest-top">
                  <img className="quest-icon-spr" src={itemSprite(q.icon)} alt="" />
                  <div className="quest-info">
                    <div className="quest-name">{q.name}</div>
                    <div className="quest-desc">{q.desc}</div>
                  </div>
                </div>
                <div className="quest-progress">
                  <div className="quest-bar-track">
                    <div className="quest-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="quest-progress-text">{Math.min(q.progress, q.target)}/{q.target}</span>
                </div>
                <div className="quest-bottom">
                  <div className="quest-rewards">
                    {r.coins ? <span><img className="ui-ico-xs" src={UI_SPRITES.coins} alt="" /> {r.coins}</span> : null}
                    {r.xp ? <span><img className="ui-ico-xs" src={UI_SPRITES.xp} alt="" /> {r.xp} XP</span> : null}
                    {r.luxury_tokens ? <span><img className="ui-ico-xs" src={UI_SPRITES.luxury} alt="" /> {r.luxury_tokens}</span> : null}
                    {r.items ? Object.entries(r.items).map(([k, v]) => <span key={k}>{k} ×{v}</span>) : null}
                  </div>
                  {q.claimed ? (
                    <span className="quest-done-tag">✓ Réclamé</span>
                  ) : (
                    <button className="btn primary small" disabled={!done} onClick={() => claimQuest(q.id)}>
                      {done ? 'Réclamer' : 'En cours'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="quests-footer">Les quêtes se renouvellent chaque jour à minuit.</div>
      </div>
    </div>
  );
}
