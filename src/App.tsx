import { useEffect } from 'react';
import { useGame } from './game/gameStore.ts';
import { useExp } from './game/expeditionStore.ts';
import { usePoker } from './game/pokerStore.ts';
import type { SaveAdapter } from './game/save/SaveAdapter.ts';
import { LocalStorageAdapter } from './game/save/LocalStorageAdapter.ts';
import { makeSupabaseAdapter } from './game/save/SupabaseAdapter.ts';
import NoyauScene from './components/NoyauScene.tsx';
import PorygonDialogue from './components/PorygonDialogue.tsx';
import Hud from './components/Hud.tsx';
import BlindBoxPanel from './components/BlindBoxPanel.tsx';
import HabitatPanel from './components/HabitatPanel.tsx';
import ModuleDoors from './components/ModuleDoors.tsx';
import RunScreen from './components/RunScreen.tsx';
import PokerScreen from './components/PokerScreen.tsx';

export default function App() {
  const colorsReturned = useGame((s) => s.colorsReturned);
  const tapNoyau = useGame((s) => s.tapNoyau);
  const expActive = useExp((s) => s.active);
  const expGate = useExp((s) => s.showGate);
  const pokerPhase = usePoker((s) => s.phase);
  const pokerActive = pokerPhase !== 'gate';

  useEffect(() => {
    const adapter: SaveAdapter = makeSupabaseAdapter() ?? new LocalStorageAdapter();
    void adapter.load().then((save) => { if (save) useGame.getState().hydrate(save); });
    const saveTimer = window.setInterval(() => {
      void adapter.save(useGame.getState().toSave());
    }, 5000);
    let last = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (dt > 0 && dt < 5) useGame.getState().tick(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { window.clearInterval(saveTimer); cancelAnimationFrame(raf); };
  }, []);

  if (expActive || expGate) {
    return <div className="app fullscreen"><RunScreen /></div>;
  }
  if (pokerActive) {
    return <div className="app fullscreen"><PokerScreen /></div>;
  }

  return (
    <div className={`app ${colorsReturned ? '' : 'pre-colors'}`}>
      <header className="title">
        <span className="title-main">Pokémon Code Genesis</span>
        <span className="title-sub">Acte I · Secteur Kanto</span>
      </header>
      <Hud />
      <div className="noyau-stage"><NoyauScene onTap={tapNoyau} /></div>
      <PorygonDialogue />
      <BlindBoxPanel />
      <HabitatPanel />
      <ModuleDoors />
    </div>
  );
}
