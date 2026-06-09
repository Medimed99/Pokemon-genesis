import { useExp } from '../game/expeditionStore.ts';
import { useGame } from '../game/gameStore.ts';
import ExpeditionMap from './ExpeditionMap.tsx';
import BattleResult from './BattleResult.tsx';
import CaptureNode from './CaptureNode.tsx';
import { ItemNode, HealNode } from './EventNodes.tsx';

function ExpeditionGate() {
  const workers = useGame((s) => s.workers);
  const balances = useGame((s) => s.balances);
  const startRun = useExp((s) => s.startRun);
  const closeGate = useExp((s) => s.closeGate);
  const hasBW = balances.bandwidth >= 1;

  return (
    <div className="run-gate">
      <div className="run-gate-title">Expédition Arcanes</div>
      <div className="run-gate-sub">Bande passante : {Math.floor(balances.bandwidth)}/5</div>
      <div className="run-gate-desc">
        Choisis un Buddy pour commencer la run. Avance sur la carte en choisissant ton chemin :
        combats, captures, objets, soins. Bats le Boss pour gagner des badges et des récompenses.
        Les combats se résolvent automatiquement selon les types, niveaux et objets.
      </div>
      {!hasBW && <div className="run-gate-warn">Bande passante insuffisante — attends la recharge.</div>}
      {workers.length === 0 && <div className="run-gate-warn">Capture d'abord un Pokémon via la Blind Box.</div>}
      <div className="buddy-list">
        {workers.map((w, i) => (
          <button key={i} className="buddy-card" disabled={!hasBW || workers.length === 0} onClick={() => startRun(w)}>
            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${w.species.id}.png`} alt={w.species.name} />
            <div className="buddy-name">{w.species.name}{w.shiny ? ' ✦' : ''}</div>
            <div className="buddy-detail">N{w.level} · {w.species.types.join('/')}</div>
          </button>
        ))}
      </div>
      <button className="btn ghost" onClick={closeGate}>Annuler</button>
    </div>
  );
}

function VictoryScreen() {
  const badges = useExp((s) => s.badges);
  const closeRun = useExp((s) => s.closeRun);
  return (
    <div className="run-result">
      <div className="result-icon victory">✦</div>
      <div className="result-title">Boss vaincu !</div>
      <div className="result-sub">
        Badge {badges} obtenu. +3 Plans +2 Artefacts récupérés dans l'Archive.
      </div>
      <button className="btn primary" onClick={closeRun}>Retour à l'Archive</button>
    </div>
  );
}

function DefeatScreen() {
  const closeRun = useExp((s) => s.closeRun);
  const lastBattle = useExp((s) => s.lastBattle);
  return (
    <div className="run-result">
      <div className="result-icon defeat">✗</div>
      <div className="result-title">Run terminée</div>
      <div className="result-sub">
        Toute l'équipe est K.O. Les données partielles ont été récupérées.
      </div>
      {lastBattle && (
        <div className="br-log" style={{ maxHeight: 120, overflow: 'auto', marginBottom: 12 }}>
          {lastBattle.log.slice(-8).map((l: {text:string;color?:string}, i: number) => (
            <div key={i} className={`br-log-line br-${l.color ?? 'gray'}`}>{l.text}</div>
          ))}
        </div>
      )}
      <button className="btn primary" onClick={closeRun}>Retour à l'Archive</button>
    </div>
  );
}

export default function RunScreen() {
  const showGate = useExp((s) => s.showGate);
  const phase = useExp((s) => s.phase);

  if (showGate || phase === 'gate') return <ExpeditionGate />;
  if (phase === 'map')            return <ExpeditionMap />;
  if (phase === 'battle_result')  return <BattleResult />;
  if (phase === 'capture' || phase === 'capture_anim') return <CaptureNode />;
  if (phase === 'item')           return <ItemNode />;
  if (phase === 'heal')           return <HealNode />;
  if (phase === 'victory')        return <VictoryScreen />;
  if (phase === 'defeat')         return <DefeatScreen />;
  return <ExpeditionMap />;
}
