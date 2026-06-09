// Un module = un mini-jeu / système autonome. Il ne parle au reste du jeu QUE
// via l'économie : il déclare ce qu'il consomme et produit, et s'enregistre.
// Ajouter un mini-jeu plus tard = implémenter GameModule + registry.register(...).

import { type ResourceId } from './resources.ts';
import { type EconomyStore } from './economyStore.ts';

export interface ModuleContext {
  economy: EconomyStore;
}

export interface GameModule {
  id: string;
  label: string;
  consumes: ResourceId[]; // ressources que ce module dépense
  produces: ResourceId[]; // ressources que ce module génère
  register?(ctx: ModuleContext): void;
}

export class ModuleRegistry {
  modules: Map<string, GameModule> = new Map();
  ctx: ModuleContext;

  constructor(ctx: ModuleContext) { this.ctx = ctx; }

  register(m: GameModule): void {
    if (this.modules.has(m.id)) throw new Error(`Module déjà enregistré : ${m.id}`);
    this.modules.set(m.id, m);
    m.register?.(this.ctx);
  }

  all(): GameModule[] { return [...this.modules.values()]; }

  // Le graphe économique : qui consomme/produit quoi. Utile pour visualiser et tester.
  contracts(): { id: string; consumes: ResourceId[]; produces: ResourceId[] }[] {
    return this.all().map((m) => ({ id: m.id, consumes: m.consumes, produces: m.produces }));
  }
}
