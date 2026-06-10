import { useGame } from '../game/gameStore.ts';
import { pokemonSprite, ballSprite } from '../game/sprites.ts';
import { rarityOf, catchChance, BALLS } from '../game/capture.ts';

export default function BlindBoxPanel() {
  const phase       = useGame((s) => s.phase);
  const items       = useGame((s) => s.items);
  const pokedex     = useGame((s) => s.pokedex);
  const encounter   = useGame((s) => s.encounter);
  const captureAnim = useGame((s) => s.captureAnim);
  const lastResult  = useGame((s) => s.lastResult);
  const masterBalls = useGame((s) => s.balances.master_balls);
  const open        = useGame((s) => s.openBlindBox);
  const throwBall   = useGame((s) => s.throwBall);
  const flee        = useGame((s) => s.fleeEncounter);

  const unlocked = phase === 'worker' || phase === 'free';
  const pokeballs = items.pokeball ?? 0;
  const superballs = items.superball ?? 0;
  const hyperballs = items.hyperball ?? 0;
  const animating = captureAnim !== 'idle';

  return (
    <div className="blindbox">
      <div className="bb-head">
        <span className="bb-title">Rencontre · Capture</span>
        <span className="bb-dex-btn-static">Pokédex {pokedex.length}</span>
      </div>

      <div className="bb-inv">
        <span><img className="ball-mini" src={ballSprite('pokeball')} alt="" /> {pokeballs}</span>
        {superballs > 0 && <span><img className="ball-mini" src={ballSprite('superball')} alt="" /> {superballs}</span>}
        {hyperballs > 0 && <span><img className="ball-mini" src={ballSprite('hyperball')} alt="" /> {hyperballs}</span>}
        {masterBalls > 0 && <span><img className="ball-mini" src={ballSprite('masterball')} alt="" /> {masterBalls}</span>}
      </div>

      {encounter ? (
        <div className={`encounter ${encounter.shiny ? 'shiny' : ''}`}>
          <div className="enc-stage">
            <img
              className={`enc-sprite ${captureAnim === 'caught' ? 'enc-caught' : captureAnim === 'fled' ? 'enc-fled' : ''}`}
              src={pokemonSprite(encounter.species.id, encounter.shiny)}
              alt={encounter.species.name}
            />
            {animating && (
              <img
                className={`capture-ball-spr anim-${captureAnim}`}
                src={ballSprite('pokeball')}
                alt="Poké Ball"
              />
            )}
          </div>

          <div className="enc-name">{encounter.species.name}{encounter.shiny ? ' ✦' : ''}</div>
          <div className="enc-rarity">
            {rarityOf(encounter.species)} · {Math.round(catchChance(encounter.species, BALLS.pokeball) * 100)}% (Poké Ball)
          </div>

          {!animating && (
            <div className="enc-actions">
              <button className="btn primary ball-btn" disabled={pokeballs < 1} onClick={() => throwBall('pokeball')}>
                <img src={ballSprite('pokeball')} alt="" /> Poké Ball
              </button>
              {superballs > 0 && <button className="btn ball-btn" onClick={() => throwBall('superball')}><img src={ballSprite('superball')} alt="" /> Super Ball</button>}
              {hyperballs > 0 && <button className="btn ball-btn" onClick={() => throwBall('hyperball')}><img src={ballSprite('hyperball')} alt="" /> Hyper Ball</button>}
              {masterBalls > 0 && <button className="btn ball-btn" onClick={() => throwBall('masterball')}><img src={ballSprite('masterball')} alt="" /> Master Ball</button>}
              <button className="btn ghost" onClick={flee}>Fuir</button>
            </div>
          )}
        </div>
      ) : (
        <button className="btn primary big" disabled={!unlocked} onClick={open}>
          {unlocked ? 'Chercher un Pokémon' : "Verrouillé — réveille d'abord le Noyau"}
        </button>
      )}

      {lastResult && !encounter && (
        <div className={`bb-result ${captureAnim === 'fled' ? 'result-fail' : ''}`}>{lastResult}</div>
      )}
    </div>
  );
}
