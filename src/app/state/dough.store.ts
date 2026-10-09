import { Injectable, computed, effect, signal } from '@angular/core';
import { calculateDough } from '../dough/dough-calculator';
import {
  DoughInput,
  DoughMethod,
  FermentationPhase,
  PizzaStyleId,
  YeastType,
} from '../dough/dough.model';
import { PIZZA_STYLES } from '../dough/pizza-styles';
import { createDefaultInput, createPhase, createPreDoughDefaults } from './dough-defaults';
import { DOUGH_LIMITS, clampToLimit } from './dough-limits';
import { loadDoughInput, saveDoughInput } from './dough-storage';
import { PhasePresetId, findPhasePreset } from './phase-presets';

export interface PhasePatch {
  hours?: number;
  temperatureC?: number;
}

export interface PreDoughPatch extends PhasePatch {
  flourPercent?: number;
  hydrationPercent?: number;
}

export type MoveDirection = -1 | 1;

@Injectable({ providedIn: 'root' })
export class DoughStore {
  private readonly state = signal<DoughInput>(loadDoughInput() ?? createDefaultInput());

  readonly input = this.state.asReadonly();
  readonly result = computed(() => calculateDough(this.state()));
  readonly totalPhaseHours = computed(() =>
    this.state().phases.reduce((sum, phase) => sum + phase.hours, 0),
  );

  constructor() {
    effect(() => saveDoughInput(this.state()));
  }

  setMethod(method: DoughMethod): void {
    if (method === this.state().method) {
      return;
    }
    if (method === 'direct') {
      this.patch({ method });
      return;
    }
    this.patch({ method, preDough: createPreDoughDefaults(method) });
  }

  setStyle(styleId: PizzaStyleId): void {
    if (styleId === this.state().style) {
      return;
    }
    const style = PIZZA_STYLES[styleId];
    this.patch({
      style: styleId,
      hydrationPercent: style.defaultHydrationPercent,
      ballWeightGrams: style.defaultBallWeightGrams,
    });
  }

  setBallCount(ballCount: number): void {
    this.patch({ ballCount: clampToLimit(ballCount, DOUGH_LIMITS.ballCount) });
  }

  setBallWeight(ballWeightGrams: number): void {
    this.patch({ ballWeightGrams: clampToLimit(ballWeightGrams, DOUGH_LIMITS.ballWeightGrams) });
  }

  setHydration(hydrationPercent: number): void {
    this.patch({
      hydrationPercent: clampToLimit(hydrationPercent, DOUGH_LIMITS.hydrationPercent),
    });
  }

  setYeastType(yeastType: YeastType): void {
    this.patch({ yeastType });
  }

  updatePreDough(patch: PreDoughPatch): void {
    const preDough = this.state().preDough;
    this.patch({
      preDough: {
        flourPercent: clampToLimit(
          patch.flourPercent ?? preDough.flourPercent,
          DOUGH_LIMITS.preDoughFlourPercent,
        ),
        hydrationPercent: clampToLimit(
          patch.hydrationPercent ?? preDough.hydrationPercent,
          DOUGH_LIMITS.preDoughHydrationPercent,
        ),
        fermentation: applyPhasePatch(preDough.fermentation, patch),
      },
    });
  }

  addPhase(presetId: PhasePresetId): void {
    const preset = findPhasePreset(presetId);
    this.patch({
      phases: [...this.state().phases, createPhase(preset.hours, preset.temperatureC)],
    });
  }

  removePhase(id: string): void {
    this.patch({ phases: this.state().phases.filter((phase) => phase.id !== id) });
  }

  updatePhase(id: string, patch: PhasePatch): void {
    this.patch({
      phases: this.state().phases.map((phase) =>
        phase.id === id ? applyPhasePatch(phase, patch) : phase,
      ),
    });
  }

  movePhase(id: string, direction: MoveDirection): void {
    const phases = [...this.state().phases];
    const fromIndex = phases.findIndex((phase) => phase.id === id);
    const toIndex = fromIndex + direction;
    if (fromIndex < 0 || toIndex < 0 || toIndex >= phases.length) {
      return;
    }
    [phases[fromIndex], phases[toIndex]] = [phases[toIndex], phases[fromIndex]];
    this.patch({ phases });
  }

  reset(): void {
    this.state.set(createDefaultInput());
  }

  private patch(changes: Partial<DoughInput>): void {
    this.state.update((current) => ({ ...current, ...changes }));
  }
}

function applyPhasePatch(phase: FermentationPhase, patch: PhasePatch): FermentationPhase {
  return {
    ...phase,
    hours: clampToLimit(patch.hours ?? phase.hours, DOUGH_LIMITS.hours),
    temperatureC: clampToLimit(patch.temperatureC ?? phase.temperatureC, DOUGH_LIMITS.temperatureC),
  };
}
