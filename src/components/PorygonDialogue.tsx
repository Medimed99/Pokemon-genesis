import { useEffect, useState } from 'react';
import { useGame } from '../game/gameStore.ts';
import { HINTS } from '../game/narrative.ts';
import { spriteUrl } from '../game/pokedex.ts';

const PORYGON_Z_ID = 474;

export default function PorygonDialogue() {
  const phase = useGame((s) => s.phase);
  const line = HINTS[phase as keyof typeof HINTS] ?? HINTS.tap;
  const [shown, setShown] = useState('');

  useEffect(() => {
    setShown('');
    let i = 0;
    const id = setInterval(() => { i++; setShown(line.text.slice(0, i)); if (i >= line.text.length) clearInterval(id); }, 24);
    return () => clearInterval(id);
  }, [line.text]);

  return (
    <div className={`dialogue ${line.glitch ? 'glitch' : ''}`}>
      <img className="portrait" src={spriteUrl(PORYGON_Z_ID)} alt="Porygon-Z" />
      <div className="dialogue-body">
        <div className="speaker">Porygon-Z · P-Z.exe</div>
        <div className="dialogue-text">{shown}</div>
      </div>
    </div>
  );
}
