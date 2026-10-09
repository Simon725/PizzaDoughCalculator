import { Injectable, signal } from '@angular/core';

export type UnitSystem = 'metric' | 'imperial';

export const UNIT_SYSTEMS: readonly UnitSystem[] = ['metric', 'imperial'];

export const UNIT_SYSTEM_STORAGE_KEY = 'pizza-dough-calculator:units';

@Injectable({ providedIn: 'root' })
export class UnitSystemService {
  private readonly state = signal<UnitSystem>(loadUnitSystem());

  readonly unitSystem = this.state.asReadonly();

  setUnitSystem(unitSystem: UnitSystem): void {
    this.state.set(unitSystem);
    saveUnitSystem(unitSystem);
  }
}

export function isUnitSystem(value: unknown): value is UnitSystem {
  return typeof value === 'string' && (UNIT_SYSTEMS as readonly string[]).includes(value);
}

function loadUnitSystem(): UnitSystem {
  try {
    const stored = localStorage.getItem(UNIT_SYSTEM_STORAGE_KEY);
    return isUnitSystem(stored) ? stored : 'metric';
  } catch {
    return 'metric';
  }
}

function saveUnitSystem(unitSystem: UnitSystem): void {
  try {
    localStorage.setItem(UNIT_SYSTEM_STORAGE_KEY, unitSystem);
  } catch {
    return;
  }
}
