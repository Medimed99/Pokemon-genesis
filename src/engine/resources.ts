// Ressources canoniques — source de vérité unique (cf. CONTRAT_ECONOMIQUE_v0.2 §3).
// Ajouter une ressource = l'ajouter ici, et nulle part ailleurs.

export type ResourceId =
  | 'eo'            // Énergie Onirique — monnaie douce, reset au prestige
  | 'bandwidth'     // Bande passante — jauge d'accès aux runs, régénère avec le temps
  | 'luxury_tokens' // Jetons de Luxe (shiny_tokens) — monnaie premium
  | 'plans'         // Plans / blueprints — débloquent les habitats
  | 'artifacts'     // Artefacts — bonus passifs permanents
  | 'master_balls'  // Master Balls — capture garantie
  | 'overclocks';   // Overclocks — buff Frenzy consommable

export interface ResourceDef {
  id: ResourceId;
  label: string;          // nom canon affiché
  keptOnPrestige: boolean; // conservé lors du Genesis-Reset ? (cf. §7)
}

export const RESOURCES: Record<ResourceId, ResourceDef> = {
  eo:            { id: 'eo',            label: 'Énergie Onirique', keptOnPrestige: false },
  bandwidth:     { id: 'bandwidth',     label: 'Bande passante',   keptOnPrestige: true  },
  luxury_tokens: { id: 'luxury_tokens', label: 'Jetons de Luxe',   keptOnPrestige: true  },
  plans:         { id: 'plans',         label: 'Plans',            keptOnPrestige: true  },
  artifacts:     { id: 'artifacts',     label: 'Artefacts',        keptOnPrestige: true  },
  master_balls:  { id: 'master_balls',  label: 'Master Balls',     keptOnPrestige: true  },
  overclocks:    { id: 'overclocks',    label: 'Overclocks',       keptOnPrestige: true  },
};

// Un paquet de montants, ex. { eo: 100, plans: 1 }.
export type Amounts = Partial<Record<ResourceId, number>>;
