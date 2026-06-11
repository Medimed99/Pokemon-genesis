import { useState, useEffect } from 'react';
import { useGame } from '../game/gameStore.ts';
import { GUIDE_MESSAGES } from '../game/narrative.ts';
import { pokemonSprite } from '../game/sprites.ts';

export default function PorygonGuide() {
  const phase      = useGame((s) => s.phase);
  const pokedex    = useGame((s) => s.pokedex);
  const lastResult = useGame((s) => s.lastResult);
  const [open, setOpen]       = useState(false);
  const [message, setMessage] = useState('');
  const [flash, setFlash]     = useState(false);

  // Contextual message based on state
  useEffect(() => {
    if (lastResult?.includes('SHINY') || lastResult?.includes('✦')) {
      setMessage(GUIDE_MESSAGES.shiny_found);
      setFlash(true);
      setOpen(true);
      setTimeout(() => setFlash(false), 2000);
      return;
    }
    if (pokedex.length === 1) { setMessage(GUIDE_MESSAGES.first_capture); setOpen(true); return; }
    if (pokedex.length === 2) { setMessage(GUIDE_MESSAGES.second_capture); setOpen(true); return; }
    if (pokedex.length === 3 && phase !== 'free') { setMessage(GUIDE_MESSAGES.third_capture); setOpen(true); return; }
  }, [lastResult, pokedex.length, phase]);

  // Default message by phase
  const defaultMsg = (): string => {
    if (phase === 'tap')    return GUIDE_MESSAGES.tap_noyau;
    if (phase === 'worker') return GUIDE_MESSAGES.open_pokebox;
    if (phase === 'free') {
      if (pokedex.length < 20) return GUIDE_MESSAGES.open_pokebox;
      return GUIDE_MESSAGES.idle_hint;
    }
    return GUIDE_MESSAGES.tap_noyau;
  };

  const handleTap = () => {
    if (!open) { setMessage(defaultMsg()); setOpen(true); }
    else setOpen(false);
  };

  return (
    <div className="pz-guide-wrap">
      {open && (
        <div className={`pz-guide-bubble ${flash ? 'pz-flash' : ''}`}>
          <div className="pz-bubble-speaker">P-Z.exe</div>
          <div className="pz-bubble-text">{message}</div>
        </div>
      )}
      <button className={`pz-guide-btn ${flash ? 'pz-flash' : ''}`} onClick={handleTap} aria-label="Aide Porygon-Z">
        <img className="pz-guide-spr" src={pokemonSprite(474)} alt="Porygon-Z" />
      </button>
    </div>
  );
}
