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
            {/* Le sprite est masqué dès que le Pokémon est aspiré (shaking/caught) */}
            <img
              className={`enc-sprite ${captureAnim === 'throwing' ? 'enc-absorbing' : ''} ${(captureAnim === 'shaking' || captureAnim === 'caught') ? 'enc-hidden' : ''} ${captureAnim === 'fled' ? 'enc-released' : ''}`}
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
            {captureAnim === 'caught' && <div className="capture-flash" />}
            {captureAnim === 'caught' && (
              <div className="capture-stars">
                <span></span><span></span><span></span>
              </div>
            )}
          </div>

          <div className="enc-name">{encounter.species.name}{encounter.shiny ? ' ✦' : ''}</div>
          <div className="enc-rarity">
            {rarityOf(encounter.species)} · {Math.round(catchChance(encounter.species, BALLS.pokeball) * 100)}% (Poké Ball)
          </div>

          {!animating && (
            <div className="enc-actions">
              {pokeballs > 0 && (
                <button className="ball-throw-btn" disabled={pokeballs < 1} onClick={() => throwBall('pokeball')}>
                  <img src={ballSprite('pokeball')} alt="" />
                  <span className="ball-throw-name">Poké Ball</span>
                  <span className="ball-throw-count">×{pokeballs}</span>
                  <span className="ball-throw-pct">{Math.round(catchChance(encounter.species, BALLS.pokeball)*100)}%</span>
                </button>
              )}
              {superballs > 0 && (
                <button className="ball-throw-btn" onClick={() => throwBall('superball')}>
                  <img src={ballSprite('superball')} alt="" />
                  <span className="ball-throw-name">Super Ball</span>
                  <span className="ball-throw-count">×{superballs}</span>
                  <span className="ball-throw-pct">{Math.round(catchChance(encounter.species, BALLS.superball)*100)}%</span>
                </button>
              )}
              {hyperballs > 0 && (
                <button className="ball-throw-btn" onClick={() => throwBall('hyperball')}>
                  <img src={ballSprite('hyperball')} alt="" />
                  <span className="ball-throw-name">Hyper Ball</span>
                  <span className="ball-throw-count">×{hyperballs}</span>
                  <span className="ball-throw-pct">{Math.round(catchChance(encounter.species, BALLS.hyperball)*100)}%</span>
                </button>
              )}
              {masterBalls > 0 && (
                <button className="ball-throw-btn gold" onClick={() => throwBall('masterball')}>
                  <img src={ballSprite('masterball')} alt="" />
                  <span className="ball-throw-name">Master Ball</span>
                  <span className="ball-throw-count">×{masterBalls}</span>
                  <span className="ball-throw-pct">100%</span>
                </button>
              )}
              {pokeballs === 0 && superballs === 0 && hyperballs === 0 && masterBalls === 0 && (
                <div className="enc-no-balls">Aucune Ball — achète-en en boutique.</div>
              )}
              <button className="btn ghost enc-flee-btn" onClick={flee}>Fuir</button>
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
