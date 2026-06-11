import { useEffect, useState } from 'react';
import { useGame } from './game/gameStore.ts';
import { useExp } from './game/expeditionStore.ts';
import { usePoker } from './game/pokerStore.ts';
import { activeRegion } from './game/progression.ts';
import type { SaveAdapter } from './game/save/SaveAdapter.ts';
import { LocalStorageAdapter } from './game/save/LocalStorageAdapter.ts';
import { makeSupabaseAdapter } from './game/save/SupabaseAdapter.ts';
import IntroSequence from './components/IntroSequence.tsx';
import NoyauScene from './components/NoyauScene.tsx';
import PorygonDialogue from './components/PorygonDialogue.tsx';
import Hud from './components/Hud.tsx';
import BlindBoxPanel from './components/BlindBoxPanel.tsx';
import PokeBoxPanel from './components/PokeBoxPanel.tsx';
import HabitatPanel from './components/HabitatPanel.tsx';
import ModuleDoors from './components/ModuleDoors.tsx';
import RunScreen from './components/RunScreen.tsx';
import PokerScreen from './components/PokerScreen.tsx';
import PorygonGuide from './components/PorygonGuide.tsx';
import ShopModal from './components/ShopModal.tsx';
import PokedexScreen from './components/PokedexScreen.tsx';
import QuestsModal from './components/QuestsModal.tsx';
import ProfileBadge from './components/ProfileBadge.tsx';
import ProfileModal from './components/ProfileModal.tsx';
import AchievementToast from './components/AchievementToast.tsx';
import StoneModal from './components/StoneModal.tsx';

export default function App() {
  // ── Tous les hooks en premier, SANS retour anticipé avant eux ───────────
  const colorsReturned  = useGame((s) => s.colorsReturned);
  const introCompleted  = useGame((s) => s.introCompleted);
  const tapNoyau        = useGame((s) => s.tapNoyau);
  const completeIntro   = useGame((s) => s.completeIntro);
  const expActive  = useExp((s) => s.active);
  const expGate    = useExp((s) => s.showGate);
  const pokerPhase = usePoker((s) => s.phase);
  const pokedexForRegion = useGame((s) => s.pokedex);

  const [showShop,    setShowShop]    = useState(false);
  const [showDex,     setShowDex]     = useState(false);
  const [showQuests,  setShowQuests]  = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showStones, setShowStones] = useState(false);
  const [loaded,      setLoaded]      = useState(false);

  const pokerActive = pokerPhase !== 'gate';
  const showExp     = expActive || expGate;
  const showPoker   = !showExp && pokerActive;
  // Le jeu principal est visible si : intro finie ET pas en expédition ET pas en poker
  const showMain    = introCompleted && !showExp && !showPoker;
  // Le Canvas Three.js doit être monté dès le chargement pour éviter le context lost
  const canvasHidden = !showMain;

  useEffect(() => {
    const adapter: SaveAdapter = makeSupabaseAdapter() ?? new LocalStorageAdapter();
    void adapter.load().then((save) => {
      if (save) useGame.getState().hydrate(save);
      setLoaded(true);
    });
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

  // ── Écran de chargement (aucun composant de jeu monté encore) ───────────
  if (!loaded) {
    return (
      <div className="app" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100svh' }}>
        <div style={{ color:'var(--neon)', fontFamily:'monospace' }}>CHARGEMENT_ARCHIVE...</div>
      </div>
    );
  }

  return (
    <>
      {/* ── Intro ─────────────────────────────────────────────────────── */}
      {!introCompleted && (
        <div className="app intro-app">
          <IntroSequence onComplete={completeIntro} />
        </div>
      )}

      {/* ── Vue principale — TOUJOURS montée après chargement ─────────── */}
      {/* display:none quand intro / expédition / poker sont actifs        */}
      {/* => le Canvas Three.js n'est jamais démonté (évite WebGL loss)    */}
      <div
        className={`app ${colorsReturned ? '' : 'pre-colors'}`}
        style={{ display: canvasHidden ? 'none' : undefined }}
      >
        <div className="top-row">
          <ProfileBadge onOpen={() => setShowProfile(true)} />
          <div className="title">
            <span className="title-main">Pokémon Code Genesis</span>
            <span className="title-sub">Acte I · Secteur {activeRegion(pokedexForRegion)}</span>
          </div>
        </div>

        <Hud onPokedex={() => setShowDex(true)} onQuests={() => setShowQuests(true)} />

        <div className="noyau-stage">
          <NoyauScene onTap={tapNoyau} />
        </div>

        <PorygonDialogue />
        <PokeBoxPanel />
        <BlindBoxPanel />
        <HabitatPanel />
        <ModuleDoors onShop={() => setShowShop(true)} onStones={() => setShowStones(true)} />
        <PorygonGuide />

        {showShop    && <ShopModal     onClose={() => setShowShop(false)}    />}
        {showDex     && <PokedexScreen onClose={() => setShowDex(false)}     />}
        {showStones  && <StoneModal    onClose={() => setShowStones(false)}   />}
        {showQuests  && <QuestsModal   onClose={() => setShowQuests(false)}  />}
        {showProfile && <ProfileModal  onClose={() => setShowProfile(false)} />}
        <AchievementToast />
      </div>

      {/* ── Expédition ────────────────────────────────────────────────── */}
      {showExp && (
        <div className="app fullscreen">
          <RunScreen />
        </div>
      )}

      {/* ── Poké-Poker ────────────────────────────────────────────────── */}
      {showPoker && (
        <div className="app fullscreen">
          <PokerScreen />
        </div>
      )}
    </>
  );
}
