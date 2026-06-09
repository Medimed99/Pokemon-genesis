import { useEffect, useState } from 'react';
import { useGame } from '../game/gameStore.ts';
import { INTRO, HINTS, type Line } from '../game/narrative.ts';
import { spriteUrl } from '../game/pokedex.ts';

const PORYGON_Z_ID = 474;

export default function PorygonDialogue() {
  const phase = useGame((s) => s.phase);
  const introIndex = useGame((s) => s.introIndex);
  const nextIntro = useGame((s) => s.nextIntro);

  const line: Line = phase === 'intro' ? INTRO[introIndex] : HINTS[phase];
  const [shown, setShown] = useState('');

  useEffect(() => {
    setShown('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(line.text.slice(0, i));
      if (i >= line.text.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [line.text]);

  const isIntro = phase === 'intro';

  return (
    <div
      className={`dialogue ${line.glitch ? 'glitch' : ''} ${isIntro ? 'clickable' : ''}`}
      onClick={() => { if (isIntro) nextIntro(); }}
    >
      <img className="portrait" src={spriteUrl(PORYGON_Z_ID)} alt="Porygon-Z" />
      <div className="dialogue-body">
        <div className="speaker">Porygon-Z · P-Z.exe</div>
        <div className="dialogue-text">{shown}</div>
        {isIntro && <div className="dialogue-next">▸ toucher pour continuer</div>}
      </div>
    </div>
  );
}
