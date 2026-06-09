import { useExp } from '../game/expeditionStore.ts';
import { useGame } from '../game/gameStore.ts';
import { spriteUrl } from '../game/pokedex.ts';
import BattleView from './BattleView.tsx';
import DraftView from './DraftView.tsx';

function TeamHealth() {
  const team = useExp((s) => s.team);
  if (team.length === 0) return null;
  return (
    <div className="team-health">
      {team.map((p, i) => (
        <div key={i} className={`team-dot ${p.fainted ? 'fainted' : ''}`} title={p.species.name} />
      ))}
    </div>
  );
}

function ExpeditionGate() {
  const workers = useGame((s) => s.workers);
  const balances = useGame((s) => s.balances);
  const startRun = useExp((s) => s.startRun);
  const closeGate = useExp((s) => s.closeGate);

  const hasBandwidth = balances.bandwidth >= 1;

  return (
    <div className="run-gate">
      <div className="run-gate-title">Expédition Arcanes</div>
      <div className="run-gate-sub">Bande passante disponible : {Math.floor(balances.bandwidth)}/5</div>
      {!hasBandwidth && <div className="run-gate-warn">Bande passante insuffisante — patiente que la jauge se recharge.</div>}
      <div className="run-gate-desc">
        Choisis ton Buddy. Il commence la run avec toi et applique ses bonus d'objets tenus.
        Construis une équipe en battant 8 secteurs, puis affronte le Lieutenant de la Team Null.
      </div>
      {workers.length === 0 && <div className="run-gate-warn">Capture d'abord un Pokémon via la Blind Box.</div>}
      <div className="buddy-list">
        {workers.map((w, i) => (
          <button key={i} className="buddy-card" disabled={!hasBandwidth} onClick={() => startRun(w)}>
            <img src={spriteUrl(w.species.id, w.shiny)} alt={w.species.name} />
            <div className="buddy-name">{w.species.name}{w.shiny ? ' ✦' : ''}</div>
            <div className="buddy-detail">N{w.level} · {w.species.types.join('/')}</div>
          </button>
        ))}
      </div>
      <button className="btn ghost" onClick={closeGate}>Annuler</button>
    </div>
  );
}

export default function RunScreen() {
  const active = useExp((s) => s.active);
  const result = useExp((s) => s.result);
  const battle = useExp((s) => s.battle);
  const draft = useExp((s) => s.draft);
  const badges = useExp((s) => s.badges);
  const closeRun = useExp((s) => s.closeRun);

  if (!active) return <ExpeditionGate />;

  if (result === 'victory' || result === 'defeat') {
    const won = result === 'victory';
    return (
      <div className="run-result">
        <div className={`result-icon ${won ? 'victory' : 'defeat'}`}>{won ? '✦' : '✗'}</div>
        <div className="result-title">{won ? 'Secteur libéré !' : 'Run terminée'}</div>
        <div className="result-sub">
          {won
            ? `Tu as obtenu 3 Plans + 2 Artefacts. ${badges} clés de secteur récupérées.`
            : `Run interrompue après ${badges} clé(s). Les données partielles ont été récupérées.`}
        </div>
        <button className="btn primary" onClick={closeRun}>Retour à l'Archive</button>
      </div>
    );
  }

  return (
    <div className="run-screen">
      <div className="run-top">
        <span className="run-secteur">Expédition Arcanes</span>
        <TeamHealth />
      </div>
      {battle && !draft && <BattleView />}
      {draft && <DraftView />}
    </div>
  );
}
