import { useState, useEffect } from 'react';

const AVATARS = [
  { id: 'dev',      icon: '👨‍💻', label: 'Développeur',  color: '#4fa8d0' },
  { id: 'dev_f',    icon: '👩‍💻', label: 'Développeuse', color: '#b060d8' },
  { id: 'hacker',   icon: '🧑‍💻', label: 'Hacker',       color: '#1d9e75' },
  { id: 'scientist',icon: '👨‍🔬', label: 'Scientifique', color: '#d9a441' },
  { id: 'sci_f',    icon: '👩‍🔬', label: 'Chercheuse',   color: '#e8473f' },
  { id: 'wizard',   icon: '🧙',   label: 'Archiviste',   color: '#9060d0' },
  { id: 'wizard_f', icon: '🧙‍♀️', label: 'Archiviste',   color: '#d06090' },
  { id: 'ai',       icon: '🤖',   label: 'IA alliée',    color: '#36e3a6' },
];

type IntroPh = 'boot' | 'chen' | 'glitch' | 'pz' | 'setup';

interface Props {
  onComplete: (name: string, avatar: string) => void;
}

function useTypewriter(text: string, speed = 22): string {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    let i = 0;
    const id = setInterval(() => { i++; setShown(text.slice(0, i)); if (i >= text.length) clearInterval(id); }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return shown;
}

const GLITCH_LOGS = [
  '> CRITICAL: WORLD_RENDERER.exe — NOT FOUND',
  '> ERROR 0x404: ZÉRO-GLITCH — SPREADING [73%]',
  '> WARNING: POKÉMON_DATA — LOCKED',
  '> FATAL: OMNI-ARCHIVE — INTEGRITY 12%',
  '> ALL SYSTEMS CRITICAL',
  '> Recherche d\'un utilisateur administrateur...',
  '> Signal détecté.',
];

const BOOT_STEPS = [
  { text: 'SYSTEM_BOOT_SEQUENCE...', delay: 700 },
  { text: 'LOADING KANTO_DB...  ██████████ 100%', delay: 600 },
  { text: 'LOADING JOHTO_DB...  ████████░░  82%', delay: 500 },
  { text: 'LOADING HOENN_DB...  █████░░░░░  47%', delay: 400 },
  { text: '█ CRITICAL FAILURE. WORLD_RENDERER NOT FOUND.', delay: 0 },
];

const CHEN_STEPS = [
  'Bienvenue dans le monde des Pokémon ! Mon nom est Chen. Les habitants de ce monde les appellent des Pokémon.',
  'Ce monde est peuplé de créatures étonnantes. Nous les étudions, nous nous en occupons, nous viv—',
  'N0US_L3S_ÉTUDI0NS... ERR0R_0x4F3A... MÉMOIRE_CORROMP█████',
];

const PZ_STEPS = [
  'T-Toi... Tu m\'entends ? Ma fréquence est ins-instable.',
  'Je suis Porygon-Z. L\'ancien protocole de sécurité de l\'Omni-Archive. Ce qu\'il en reste.',
  'Le Zéro-Glitch a tout verrouillé. Les formes, les couleurs, les sons. Chaque Pokémon est une donnée brute gelée.',
  'Mais toi... tu peux les compiler. Chaque capture restaure un fragment. Tu es notre seule chance, Archiviste.',
  'Identifie-toi. Quel est ton nom ?',
];

// Boot Screen
function BootScreen({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const add = () => {
      if (i >= BOOT_STEPS.length) { setDone(true); return; }
      const step = BOOT_STEPS[i];
      setLines((l) => [...l, step.text]);
      i++;
      if (step.delay > 0) setTimeout(add, step.delay);
      else setDone(true);
    };
    setTimeout(add, 300);
  }, []);

  return (
    <div className="intro-boot" onClick={done ? onDone : undefined} style={{ cursor: done ? 'pointer' : 'default' }}>
      {lines.map((l, i) => (
        <div key={i} className={`boot-line ${i === lines.length - 1 && done ? 'boot-crit' : ''}`}>{l}</div>
      ))}
      {done && <div className="boot-tap">▸ toucher pour continuer</div>}
    </div>
  );
}

// Chen dialogue box
function ChenScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === CHEN_STEPS.length - 1;
  const text = useTypewriter(CHEN_STEPS[step], isLast ? 18 : 24);
  const full = text.length >= CHEN_STEPS[step].length;
  const isGlitch = step === 2;

  const advance = () => {
    if (!full) return;
    if (isLast) { onDone(); return; }
    setStep((s) => s + 1);
  };

  return (
    <div className={`intro-dialogue ${isGlitch ? 'dlg-glitch' : 'dlg-chen'}`} onClick={advance}>
      <div className="dlg-portrait">
        {isGlitch ? (
          <div className="chen-glitch-portrait">C<br />H<br />E<br />N</div>
        ) : (
          <div className="chen-portrait">🧑‍🔬</div>
        )}
      </div>
      <div className="dlg-body">
        <div className="dlg-speaker">{isGlitch ? 'ERR0R' : 'Professeur Chen'}</div>
        <div className={`dlg-text ${isGlitch ? 'glitch-text' : ''}`}>{text}</div>
        {full && <div className="dlg-next">▸</div>}
      </div>
    </div>
  );
}

// Glitch crash screen
function GlitchScreen({ onDone }: { onDone: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let i = 0;
    const add = () => {
      if (i >= GLITCH_LOGS.length) { setReady(true); return; }
      setLogs((l) => [...l, GLITCH_LOGS[i]]);
      i++;
      setTimeout(add, i < 5 ? 220 : 500);
    };
    setTimeout(add, 200);
  }, []);

  return (
    <div className="intro-glitch-screen" onClick={ready ? onDone : undefined}>
      <div className="glitch-header">
        <div className="glitch-bar" />
        <div className="glitch-title">⚠ SYSTEM FAILURE</div>
        <div className="glitch-bar" />
      </div>
      <div className="glitch-log-wrap">
        {logs.map((l, i) => (
          <div key={i} className={`glitch-log ${i >= 5 ? 'glitch-log-signal' : ''}`}>{l}</div>
        ))}
      </div>
      {ready && <div className="boot-tap">▸ toucher pour continuer</div>}
    </div>
  );
}

// PZ dialogue
function PZScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === PZ_STEPS.length - 1;
  const isGlitch = step === 0 || step === 2;
  const text = useTypewriter(PZ_STEPS[step], 20);
  const full = text.length >= PZ_STEPS[step].length;

  const advance = () => {
    if (!full) return;
    if (isLast) { onDone(); return; }
    setStep((s) => s + 1);
  };

  return (
    <div className={`intro-dialogue dlg-pz ${isGlitch ? 'dlg-glitch' : ''}`} onClick={advance}>
      <div className="dlg-portrait">
        <div className={`pz-portrait ${isGlitch ? 'pz-glitch' : ''}`}>⬡</div>
      </div>
      <div className="dlg-body">
        <div className="dlg-speaker" style={{ color: 'var(--neon)' }}>Porygon-Z · P-Z.exe</div>
        <div className={`dlg-text ${isGlitch ? 'glitch-text' : ''}`}>{text}</div>
        {full && <div className="dlg-next">▸</div>}
      </div>
    </div>
  );
}

// Player setup
function SetupScreen({ onDone }: { onDone: (name: string, avatar: string) => void }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0].id);
  const chosen = AVATARS.find((a) => a.id === avatar)!;

  return (
    <div className="intro-setup">
      <div className="setup-title" style={{ color: 'var(--neon-2)' }}>IDENTIFICATION REQUISE</div>
      <div className="setup-sub" style={{ color: 'var(--muted)' }}>Porygon-Z a besoin de ton identité pour te connecter à l\'Archive.</div>

      <div className="setup-field">
        <label className="setup-label">Nom de l'Archiviste</label>
        <input
          className="setup-input"
          type="text"
          maxLength={16}
          placeholder="Ton pseudo..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="setup-field">
        <label className="setup-label">Avatar</label>
        <div className="avatar-grid">
          {AVATARS.map((a) => (
            <button
              key={a.id}
              className={`avatar-btn ${avatar === a.id ? 'avatar-selected' : ''}`}
              style={avatar === a.id ? { borderColor: a.color, boxShadow: `0 0 8px ${a.color}60` } : {}}
              onClick={() => setAvatar(a.id)}
            >
              <span className="avatar-icon">{a.icon}</span>
              <span className="avatar-label">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn primary big"
        disabled={name.trim().length < 2}
        onClick={() => onDone(name.trim(), chosen.id)}
      >
        Initialiser l'Archive
      </button>
    </div>
  );
}

export default function IntroSequence({ onComplete }: Props) {
  const [phase, setPhase] = useState<IntroPh>('boot');

  return (
    <div className="intro-wrap">
      {phase === 'boot'  && <BootScreen  onDone={() => setPhase('chen')} />}
      {phase === 'chen'  && <ChenScreen  onDone={() => setPhase('glitch')} />}
      {phase === 'glitch'&& <GlitchScreen onDone={() => setPhase('pz')} />}
      {phase === 'pz'    && <PZScreen    onDone={() => setPhase('setup')} />}
      {phase === 'setup' && <SetupScreen onDone={onComplete} />}
    </div>
  );
}
