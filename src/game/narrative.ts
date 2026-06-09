// ── Termes canon ────────────────────────────────────────────────────────────
// Zéro-Glitch | Omni-Archive | Porygon-Z | Archiviste | Noyau Genesis

export type Phase = 'intro' | 'tap' | 'worker' | 'free';

export interface Line {
  text: string;
  speaker?: 'chen' | 'pz' | 'system';
  glitch?: boolean;
  delay?: number; // ms before auto-advancing (0 = wait for tap)
}

// ── Séquence boot / glitch / PZ (intro complète) ───────────────────────────
export const BOOT_LINES: Line[] = [
  { text: 'SYSTEM_BOOT_SEQUENCE...', speaker: 'system', delay: 600 },
  { text: 'LOADING KANTO_DB...  ██████████ 100%', speaker: 'system', delay: 500 },
  { text: 'LOADING JOHTO_DB...  ████████░░  82%', speaker: 'system', delay: 400 },
  { text: 'LOADING HOENN_DB...  █████░░░░░  47%', speaker: 'system', delay: 300 },
  { text: 'CRITICAL FAILURE. WORLD_RENDERER NOT FOUND.', speaker: 'system', glitch: true, delay: 0 },
];

export const CHEN_LINES: Line[] = [
  { text: 'Bienvenue dans le monde des Pokémon ! Mon nom est Chen. Les habitants de ce monde les appellent des Pokémon.', speaker: 'chen' },
  { text: 'Ce monde est peuplé de créatures étonnantes nommées Pokémon. Nous les étudions, nous nous en occupons—', speaker: 'chen' },
  { text: 'N0US_L3S_ÉTUDI0NS... ERR0R_0x4F3A... MÉMOIRE_CORROMP██████', speaker: 'chen', glitch: true },
];

export const GLITCH_LOGS: string[] = [
  '> CRITICAL: WORLD_RENDERER.exe — NOT FOUND',
  '> ERROR 0x404: ZÉRO-GLITCH — SPREADING [73%]',
  '> WARNING: POKÉMON_DATA — LOCKED',
  '> FATAL: OMNI-ARCHIVE — INTEGRITY 12%',
  '> ALL SYSTEMS CRITICAL',
  '> Recherche d\'un utilisateur administrateur...',
  '> Signal détecté.',
];

export const PZ_INTRO: Line[] = [
  { text: 'T-Toi... Tu m\'entends ? Ma fréquence est ins-instable.', speaker: 'pz', glitch: true },
  { text: 'Je suis Porygon-Z. L\'ancien protocole de sécurité de l\'Archive. Ce qu\'il en reste.', speaker: 'pz' },
  { text: 'Le Zéro-Glitch a tout verrouillé. Les formes, les couleurs, les sons. Chaque Pokémon est une donnée brute gelée.', speaker: 'pz', glitch: true },
  { text: 'Mais toi... tu peux les compiler. Chaque capture restaure un fragment. Tu es notre seule chance.', speaker: 'pz' },
  { text: 'J\'ai besoin que tu t\'identifies, Archiviste. Quel est ton nom ?', speaker: 'pz' },
];

// ── Guide flottant contextuel ────────────────────────────────────────────────
export const GUIDE_MESSAGES: Record<string, string> = {
  tap_noyau:       'Appuie sur le Noyau pour générer de l\'Énergie Onirique. Chaque impulsion réveille l\'Archive.',
  open_pokebox:    'La PokéBox te donne 5 Pokémon par jour, garantis nouveaux. Elle se recharge à minuit.',
  first_capture:   'Signal acquis ! Encore 2 captures pour réveiller le Noyau Genesis.',
  second_capture:  'Presque... 1 dernière capture pour stabiliser l\'Archive.',
  third_capture:   'Le Noyau s\'éveille ! Les données se recompilent — les couleurs reviennent.',
  shiny_found:     '⚠ ANOMALIE DORÉE. Ce code couleur n\'est pas standard ! NE LE LAISSE PAS PARTIR.',
  expedition_open: 'L\'Expédition Arcanes te permet de plonger dans les failles logiques. Plus risqué, bien plus de récompenses.',
  poker_open:      'Le Poké-Poker te permet de décrypter des données en jouant des mains. Commence petit.',
  idle_hint:       'Tes Pokémon ouvriers produisent de l\'EO même quand tu n\'es pas là. Reviens demain !',
  legendary_hint:  'Les légendaires ne peuvent pas être obtenus via la PokéBox. Il faut les mériter : Expédition ou items spéciaux.',
};

// ── Évènements narratifs ─────────────────────────────────────────────────────
export const EVENT_MESSAGES: Record<string, string[]> = {
  capture_success: [
    'Signal acquis ! Intégrité sauvegardée.',
    'Données archivées dans le Pokédex.',
    'Code source extrait avec succès.',
  ],
  capture_fail: [
    'CONNEXION PERDUE. Le signal s\'est désynchronisé.',
    'Échec du confinement. Le Pokémon a glissé dans le Néant.',
    'Erreur de compression. Réessaie.',
  ],
  shiny_detected: [
    '⚠ ALERTE : ANOMALIE DORÉE DÉTECTÉE. Ce code couleur n\'est pas standard !',
    'Un Shiny ! Signature de données exceptionnelle — ne le laisse pas fuir.',
  ],
  pokebox_open: [
    'Décompression de l\'archive ZIP...',
    'Analyse du contenu aléatoire...',
    'Extraction terminée !',
  ],
  noyau_awakens: [
    'Le Noyau Genesis bat. Les données se recompilent. Les couleurs... reviennent.',
    'Trois signaux archivés. L\'Archive respire à nouveau. Bien joué, Archiviste.',
  ],
};

export const HINTS: Record<Exclude<Phase, 'intro'>, Line> = {
  tap:    { text: 'Appuie sur le Noyau. Chaque impulsion réveille l\'Archive.', speaker: 'pz' },
  worker: { text: 'Bien. Maintenant ouvre une PokéBox — capture 3 Pokémon pour réveiller le Noyau.', speaker: 'pz' },
  free:   { text: 'Les couleurs reviennent. Continue à remplir le Pokédex, Archiviste.', speaker: 'pz', glitch: false },
};
