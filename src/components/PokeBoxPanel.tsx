import { useGame } from '../game/gameStore.ts';
import { spriteUrl } from '../game/pokedex.ts';
import { UI_SPRITES } from '../game/sprites.ts';

const MAX_DAILY = 5;
const DAY_MS = 24 * 3600 * 1000;

export default function PokeBoxPanel() {
  const phase         = useGame((s) => s.phase);
  const items         = useGame((s) => s.items);
  const lastResult    = useGame((s) => s.lastResult);
  const openPokeBox   = useGame((s) => s.openPokeBox);
<<<<<<< HEAD
  const claimDaily    = useGame((s) => s.claimDaily);
=======
>>>>>>> 144165047627239bd21da23e25f46140ab9d66d6
  const reveal        = useGame((s) => s.pokeboxReveal);

  const boxUsed: number = (items as Record<string, number>).pokebox_used ?? 0;
  const boxReset: number = (items as Record<string, number>).pokebox_reset ?? 0;

  const now = Date.now();
  const remaining = MAX_DAILY - boxUsed;
  const isReset = now - boxReset >= DAY_MS;
  const effectiveRemaining = isReset ? MAX_DAILY : remaining;
  const canOpen = (phase === 'worker' || phase === 'free') && effectiveRemaining > 0;

  const msToReset = isReset ? 0 : (DAY_MS - (now - boxReset));
  const hToReset = Math.ceil(msToReset / 3600000);

  return (
    <div className="pokebox-panel">
      <div className="pb-panel-head">
        <span className="pb-panel-title">PokéBox</span>
        <span className="pb-panel-count">{effectiveRemaining}/{MAX_DAILY} aujourd'hui</span>
      </div>

      <div className="pb-panel-desc">
        Chaque ouverture garantit un Pokémon que tu n'as pas encore (hors Légendaires).
        Se recharge à minuit.
      </div>

      {reveal && (
        <div className="pb-reveal">
          <img
            src={spriteUrl(reveal.species.id, reveal.shiny)}
            alt={reveal.species.name}
            className="pb-reveal-sprite"
          />
          <div className="pb-reveal-name">
            {reveal.species.name}{reveal.shiny ? ' ✦ SHINY !' : ''}
          </div>
          <div className="pb-reveal-info">
            {reveal.species.types.join('/')} · BST {reveal.species.bst}
          </div>
          {lastResult && <div className="bb-result">{lastResult}</div>}
        </div>
      )}

      {!reveal && (
        <>
          {effectiveRemaining > 0 ? (
            <button className="btn primary big" disabled={!canOpen} onClick={openPokeBox}>
              {canOpen ? `Ouvrir la PokéBox (${effectiveRemaining} restante${effectiveRemaining > 1 ? 's' : ''})` : 'Verrouillé — capture 3 Pokémon d\'abord'}
            </button>
          ) : (
            <div className="pb-empty">
              <img className="pb-empty-spr" src={UI_SPRITES.box} alt="" style={{ filter: 'grayscale(1) opacity(.5)' }} />
              <div>PokéBox épuisée pour aujourd'hui.</div>
              <div className="pb-recharge">Recharge dans {hToReset}h · ou via la Boutique</div>
            </div>
          )}
        </>
      )}

      <button className="btn small daily-btn" onClick={claimDaily}>Récolte quotidienne (+10 Balls, +300 Coins)</button>
    </div>
  );
}
