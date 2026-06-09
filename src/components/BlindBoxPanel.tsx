import { useGame } from '../game/gameStore.ts';
import { spriteUrl } from '../game/pokedex.ts';
import { rarityOf, catchChance, BALLS } from '../game/capture.ts';

export default function BlindBoxPanel() {
  const phase = useGame((s) => s.phase);
  const items = useGame((s) => s.items);
  const pokedex = useGame((s) => s.pokedex);
  const encounter = useGame((s) => s.encounter);
  const lastResult = useGame((s) => s.lastResult);
  const masterBalls = useGame((s) => s.balances.master_balls);
  const open = useGame((s) => s.openBlindBox);
  const throwBall = useGame((s) => s.throwBall);
  const flee = useGame((s) => s.fleeEncounter);
  const buyBall = useGame((s) => s.buyBall);
  const claimDaily = useGame((s) => s.claimDaily);

  const unlocked = phase === 'worker' || phase === 'free';
  const pokeballs = items.pokeball ?? 0;

  return (
    <div className="blindbox">
      <div className="bb-head">
        <span className="bb-title">Blind Box · Capture</span>
        <span className="bb-dex">Pokédex {pokedex.length}/151</span>
      </div>

      <div className="bb-inv">
        <span>◓ Poké Ball ×{pokeballs}</span>
        {masterBalls > 0 && <span>★ Master Ball ×{masterBalls}</span>}
      </div>

      {encounter ? (
        <div className={`encounter ${encounter.shiny ? 'shiny' : ''}`}>
          <img className="enc-sprite" src={spriteUrl(encounter.species.id, encounter.shiny)} alt={encounter.species.name} />
          <div className="enc-name">{encounter.species.name}{encounter.shiny ? ' ✦' : ''}</div>
          <div className="enc-rarity">
            {rarityOf(encounter.species)} · {Math.round(catchChance(encounter.species, BALLS.pokeball) * 100)}% (Poké Ball)
          </div>
          <div className="enc-actions">
            <button className="btn primary" disabled={pokeballs < 1} onClick={() => throwBall('pokeball')}>
              Lancer une Poké Ball
            </button>
            {masterBalls > 0 && <button className="btn" onClick={() => throwBall('masterball')}>Master Ball</button>}
            <button className="btn ghost" onClick={flee}>Fuir</button>
          </div>
        </div>
      ) : (
        <button className="btn primary big" disabled={!unlocked} onClick={open}>
          {unlocked ? 'Ouvrir une Blind Box' : 'Verrouillé — réveille d’abord le Noyau'}
        </button>
      )}

      <div className="bb-row">
        <button className="btn small" onClick={claimDaily}>Récolte quotidienne (+10)</button>
        <button className="btn small" onClick={buyBall}>Acheter 1 ball (50 EO)</button>
      </div>

      {lastResult && <div className="bb-result">{lastResult}</div>}
    </div>
  );
}
