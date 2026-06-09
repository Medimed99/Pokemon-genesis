# Pokémon Code Genesis — app (tranche Acte I)

Jeu mobile-first construit autour du moteur économique (`src/engine`, = contrat v0.2).
Stack : Vite + React + TypeScript, react-three-fiber (Noyau 3D), Zustand, Supabase (optionnel).

## Lancer
```bash
npm install
npm run dev        # serveur de dev
npm run build      # typecheck strict + bundle de prod
```

## Ce que contient la tranche
- Noyau Pokéball en 3D (r3f) — tape pour générer de l'EO.
- Intro narrative Porygon-Z (typewriter + états glitch), termes canon (Zéro-Glitch, Omni-Archive).
- Première compilation d'un ouvrier → la Forêt de Jade reprend ses couleurs (désaturation qui se lève).
- Production passive d'EO, HUD (EO, EO/s, Bande passante).
- Portes verrouillées « Expédition » et « Poké-Poker » (modules à venir, Actes II/III).
- Sauvegarde : localStorage par défaut ; bascule sur Supabase si `.env` est rempli (voir `.env.example`).

## Architecture
- `src/engine/` — moteur économique découplé (le backbone, typé strict, testé).
- `src/game/` — store Zustand, modules, pokédex, narration, adaptateurs de sauvegarde.
- `src/components/` — UI (Noyau 3D, dialogue, HUD, habitat, portes de modules).

Chaque mini-jeu futur = un nouveau `GameModule` qui se branche sur l'économie. Rien d'autre à toucher.
