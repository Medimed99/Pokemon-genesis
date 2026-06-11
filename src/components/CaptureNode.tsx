import { useExp } from '../game/expeditionStore.ts';
import { pokemonSprite } from '../game/sprites.ts';

export default function CaptureNode() {
  const captureTarget = useExp((s) => s.captureTarget);
  const captureSuccess = useExp((s) => s.captureSuccess);
  const phase = useExp((s) => s.phase);
  const attempt = useExp((s) => s.attemptCapture);
  const skip = useExp((s) => s.skipCapture);
  const team = useExp((s) => s.team);

  if (!captureTarget) return null;
  const isFull = team.length >= 6;
  const isAnimating = phase === 'capture_anim';

  return (
    <div className="capture-node">
      <div className="cn-title">Pokémon Sauvage !</div>

      <div className={`cn-pokemon ${isAnimating ? (captureSuccess ? 'cn-caught' : 'cn-fled') : ''}`}>
        <img
          src={pokemonSprite(captureTarget.species.id)}
          alt={captureTarget.species.name}
          className="cn-sprite"
        />
        <div className="cn-name">{captureTarget.species.name}</div>
        <div className="cn-info">
          Nv{captureTarget.level} · {captureTarget.species.types.join('/')} · BST {captureTarget.species.bst}
        </div>
        <div className="cn-hp-bar">
          <div className="cn-hp-fill" style={{ width: '100%' }} />
        </div>
      </div>

      {isAnimating && (
        <div className={`cn-anim-ball ${captureSuccess ? 'cn-ball-caught' : 'cn-ball-fled'}`}>
          <div className="pokeball-anim">
            <div className="pb-top" /><div className="pb-band" /><div className="pb-bot" /><div className="pb-btn" />
          </div>
          <div className="cn-result-text">
            {captureSuccess ? '✓ Capturé !' : '✗ Le Pokémon s\'est enfui !'}
          </div>
        </div>
      )}

      {!isAnimating && (
        <div className="cn-actions">
          {isFull ? (
            <div className="cn-warn">Équipe complète (6/6) — libère un Pokémon d'abord.</div>
          ) : (
            <button className="btn primary" onClick={attempt}>
              Lancer une Poké Ball
            </button>
          )}
          <button className="btn ghost" onClick={skip}>Passer</button>
        </div>
      )}
    </div>
  );
}
