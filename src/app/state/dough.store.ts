import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { hasStartPassed, parseBakeTime, planBakeSchedule } from '../dough/bake-schedule';
import { calculateDough } from '../dough/dough-calculator';
import {
  DoughInput,
  DoughMethod,
  FermentationPhase,
  MixingType,
  PizzaStyleId,
  SourdoughSettings,
  StarterMode,
  WaterTemperatureSettings,
  YeastType,
  isPreDoughMethod,
} from '../dough/dough.model';
import { PIZZA_STYLES } from '../dough/pizza-styles';
import { equivalentHoursAt22C, starterPercentFor } from '../dough/sourdough-model';
import { createDefaultInput, createPhase, createPreDoughDefaults } from './dough-defaults';
import { DOUGH_LIMITS, STORED_LIMITS, clampToLimit } from './dough-limits';
import { loadDoughInput, saveDoughInput } from './dough-storage';
import { PhasePresetId, findPhasePreset } from './phase-presets';
import { ScheduleTemplateId, findScheduleTemplate } from './schedule-templates';

export interface PhasePatch {
  hours?: number;
  temperatureC?: number;
}

export interface PreDoughPatch extends PhasePatch {
  flourPercent?: number;
  hydrationPercent?: number;
}

export interface SourdoughPatch {
  starterHydrationPercent?: number;
  starterMode?: StarterMode;
  manualStarterPercent?: number;
}

export interface WaterTemperaturePatch {
  targetDoughC?: number;
  roomC?: number;
  flourC?: number;
  preFermentC?: number;
  mixing?: MixingType;
}

export type MoveDirection = -1 | 1;

const CLOCK_INTERVAL_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class DoughStore {
  private readonly state = signal<DoughInput>(loadDoughInput() ?? createDefaultInput());

  readonly input = this.state.asReadonly();
  readonly result = computed(() => calculateDough(this.state()));
  readonly totalPhaseHours = computed(() =>
    this.state().phases.reduce((sum, phase) => sum + phase.hours, 0),
  );

  private readonly now = signal(new Date());

  readonly bakePlan = computed(() => {
    const input = this.state();
    if (!input.bakeSchedule.enabled) {
      return null;
    }
    const bakeAt = parseBakeTime(input.bakeSchedule.bakeAt);
    return bakeAt ? planBakeSchedule(input, bakeAt) : null;
  });
  readonly bakeStartHasPassed = computed(() => {
    const plan = this.bakePlan();
    return plan !== null && hasStartPassed(plan, this.now());
  });

  constructor() {
    effect(() => saveDoughInput(this.state()));
    const clock = setInterval(() => this.now.set(new Date()), CLOCK_INTERVAL_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(clock));
  }

  setMethod(method: DoughMethod): void {
    if (method === this.state().method) {
      return;
    }
    if (!isPreDoughMethod(method)) {
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
      oilPercent: style.defaultOilPercent,
      sugarPercent: style.defaultSugarPercent,
      ballWeightGrams: style.defaultBallWeightGrams,
    });
  }

  setBallCount(ballCount: number): void {
    this.patch({ ballCount: clampToLimit(ballCount, DOUGH_LIMITS.ballCount) });
  }

  setBallWeight(ballWeightGrams: number): void {
    this.patch({ ballWeightGrams: clampToLimit(ballWeightGrams, STORED_LIMITS.ballWeightGrams) });
  }

  setHydration(hydrationPercent: number): void {
    this.patch({
      hydrationPercent: clampToLimit(hydrationPercent, DOUGH_LIMITS.hydrationPercent),
    });
  }

  setOil(oilPercent: number): void {
    this.patch({ oilPercent: clampToLimit(oilPercent, DOUGH_LIMITS.oilPercent) });
  }

  setSugar(sugarPercent: number): void {
    this.patch({ sugarPercent: clampToLimit(sugarPercent, DOUGH_LIMITS.sugarPercent) });
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

  updateSourdough(patch: SourdoughPatch): void {
    const { phases, sourdough } = this.state();
    const starterMode = patch.starterMode ?? sourdough.starterMode;
    this.patch({
      sourdough: {
        starterHydrationPercent: clampToLimit(
          patch.starterHydrationPercent ?? sourdough.starterHydrationPercent,
          DOUGH_LIMITS.starterHydrationPercent,
        ),
        starterMode,
        manualStarterPercent: clampToLimit(
          patch.manualStarterPercent ?? manualStarterSeed(sourdough, starterMode, phases),
          DOUGH_LIMITS.starterPercent,
        ),
      },
    });
  }

  updateWaterTemperature(patch: WaterTemperaturePatch): void {
    const waterTemperature = this.state().waterTemperature;
    this.patch({
      waterTemperature: {
        targetDoughC: clampToLimit(
          patch.targetDoughC ?? waterTemperature.targetDoughC,
          STORED_LIMITS.targetDoughTemperatureC,
        ),
        roomC: clampToLimit(patch.roomC ?? waterTemperature.roomC, STORED_LIMITS.roomTemperatureC),
        flourC: clampToLimit(
          patch.flourC ?? waterTemperature.flourC,
          STORED_LIMITS.flourTemperatureC,
        ),
        mixing: patch.mixing ?? waterTemperature.mixing,
        ...preFermentTemperaturePart(patch.preFermentC ?? waterTemperature.preFermentC),
      },
    });
  }

  resetPreFermentTemperature(): void {
    const { preFermentC: _preFermentC, ...waterTemperature } = this.state().waterTemperature;
    this.patch({ waterTemperature });
  }

  setBakeScheduleEnabled(enabled: boolean): void {
    this.patch({ bakeSchedule: { ...this.state().bakeSchedule, enabled } });
  }

  setBakeTime(bakeAt: Date): void {
    if (Number.isNaN(bakeAt.getTime())) {
      return;
    }
    this.patch({ bakeSchedule: { ...this.state().bakeSchedule, bakeAt: bakeAt.toISOString() } });
  }

  addPhase(presetId: PhasePresetId): void {
    const preset = findPhasePreset(presetId);
    this.patch({
      phases: [...this.state().phases, createPhase(preset.hours, preset.temperatureC)],
    });
  }

  applyScheduleTemplate(templateId: ScheduleTemplateId): void {
    const template = findScheduleTemplate(templateId);
    this.patch({
      phases: template.phases.map((phase) => createPhase(phase.hours, phase.temperatureC)),
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
    temperatureC: clampToLimit(
      patch.temperatureC ?? phase.temperatureC,
      STORED_LIMITS.temperatureC,
    ),
  };
}

function manualStarterSeed(
  sourdough: SourdoughSettings,
  nextMode: StarterMode,
  phases: readonly FermentationPhase[],
): number {
  const switchesToManual = nextMode === 'manual' && sourdough.starterMode !== 'manual';
  if (!switchesToManual) {
    return sourdough.manualStarterPercent;
  }
  return starterPercentFor(equivalentHoursAt22C(phases)).percent;
}

function preFermentTemperaturePart(
  preFermentC: number | undefined,
): Pick<WaterTemperatureSettings, 'preFermentC'> {
  if (preFermentC === undefined) {
    return {};
  }
  return { preFermentC: clampToLimit(preFermentC, STORED_LIMITS.preFermentTemperatureC) };
}
