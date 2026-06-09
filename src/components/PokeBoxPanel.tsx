import { useGame } from '../game/gameStore.ts';
import { spriteUrl } from '../game/pokedex.ts';

const MAX_DAILY = 5;
const DAY_MS = 24 * 3600 * 1000;

export default function PokeBoxPanel() {
  const pokedex       = useGame((s) => s.pokedex);
  const phase         = useGame((s) => s.phase);
  const items         = useGame((s) => s.items);
  const lastResult    = useGame((s) => s.lastResult);
  const openPokeBox   = useGame((s) => s.openPokeBox);
  const encounter     = useGame((s) => s.encounter);

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

      {encounter && (
        <div className="pb-reveal">
          <img
            src={spriteUrl(encounter.species.id, encounter.shiny)}
            alt={encounter.species.name}
            className="pb-reveal-sprite"
          />
          <div className="pb-reveal-name">
            {encounter.species.name}{encounter.shiny ? ' ✦ SHINY !' : ''}
          </div>
          <div className="pb-reveal-info">
            {encounter.species.types.join('/')} · BST {encounter.species.bst}
          </div>
          {lastResult && <div className="bb-result">{lastResult}</div>}
        </div>
      )}

      {!encounter && (
        <>
          {effectiveRemaining > 0 ? (
            <button className="btn primary big" disabled={!canOpen} onClick={openPokeBox}>
              {canOpen ? `Ouvrir la PokéBox (${effectiveRemaining} restante${effectiveRemaining > 1 ? 's' : ''})` : 'Verrouillé — capture 3 Pokémon d\'abord'}
            </button>
          ) : (
            <div className="pb-empty">
              <div className="pb-empty-icon">📦</div>
              <div>PokéBox épuisée pour aujourd'hui.</div>
              <div className="pb-recharge">Recharge dans {hToReset}h · ou via la Boutique</div>
            </div>
          )}
        </>
      )}

      <div className="pb-dex-note">Pokédex : {pokedex.length}/151</div>
    </div>
  );
}
