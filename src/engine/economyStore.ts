// EconomyStore — le grand livre de comptes. Découplé de toute UI.
// Tous les flux d'argent du jeu passent par grant / spend / canAfford.

import { RESOURCES, type ResourceId, type Amounts } from './resources.ts';
import { type BalanceConfig, DEFAULT_CONFIG } from './config.ts';

export const SAVE_VERSION = 1;

export interface EconomySave {
  version: number;
  balances: Amounts;
  lastTimestamp: number;
}

type Listener = (balances: Readonly<Record<ResourceId, number>>) => void;

export class EconomyStore {
  balances: Record<ResourceId, number>;
  config: BalanceConfig;
  listeners: Set<Listener> = new Set();

  constructor(config: BalanceConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.balances = {} as Record<ResourceId, number>;
    (Object.keys(RESOURCES) as ResourceId[]).forEach((id) => { this.balances[id] = 0; });
  }

  getBalance(id: ResourceId): number { return this.balances[id]; }
  snapshot(): Record<ResourceId, number> { return { ...this.balances }; }

  canAfford(cost: Amounts): boolean {
    return (Object.entries(cost) as [ResourceId, number][])
      .every(([id, amt]) => this.balances[id] >= (amt ?? 0));
  }

  grant(gain: Amounts): void {
    for (const [id, amt] of Object.entries(gain) as [ResourceId, number][]) {
      this.balances[id] += amt ?? 0;
    }
    this.clampBandwidth();
    this.emit();
  }

  // Renvoie false (sans rien dépenser) si le joueur n'a pas de quoi payer.
  spend(cost: Amounts): boolean {
    if (!this.canAfford(cost)) return false;
    for (const [id, amt] of Object.entries(cost) as [ResourceId, number][]) {
      this.balances[id] -= amt ?? 0;
    }
    this.emit();
    return true;
  }

  // Régénération passive de la Bande passante — appelée par la boucle de jeu.
  tick(seconds: number): void {
    this.balances.bandwidth += this.config.bandwidth.regenPerSecond * seconds;
    this.clampBandwidth();
    this.emit();
  }

  // Genesis-Reset : remet à 0 ce qui n'est pas conservé (cf. contrat §7).
  prestigeReset(): void {
    (Object.keys(RESOURCES) as ResourceId[]).forEach((id) => {
      if (!RESOURCES[id].keptOnPrestige) this.balances[id] = 0;
    });
    this.emit();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  serialize(): EconomySave {
    return { version: SAVE_VERSION, balances: { ...this.balances }, lastTimestamp: Date.now() };
  }

  load(save: EconomySave): void {
    const migrated = migrate(save);
    (Object.keys(RESOURCES) as ResourceId[]).forEach((id) => {
      this.balances[id] = migrated.balances[id] ?? 0;
    });
    this.clampBandwidth();
    this.emit();
  }

  clampBandwidth(): void {
    this.balances.bandwidth = Math.min(this.balances.bandwidth, this.config.bandwidth.cap);
  }

  emit(): void {
    const s = this.snapshot();
    this.listeners.forEach((l) => l(s));
  }
}

// Migrations de sauvegarde versionnées (vide en v1, mais le crochet existe dès le départ).
function migrate(save: EconomySave): EconomySave {
  let s = save;
  // if (s.version < 2) { s = { ...s, version: 2, ... }; }
  return s;
}
