import { TestBed } from '@angular/core/testing';
import { PIZZA_STYLES, PRE_DOUGH_DEFAULTS, SOURDOUGH_DEFAULTS } from '../dough/pizza-styles';
import { DOUGH_STORAGE_KEY } from './dough-storage';
import { DoughStore } from './dough.store';

function createStore(): DoughStore {
  return TestBed.inject(DoughStore);
}

function recreateStore(): DoughStore {
  TestBed.resetTestingModule();
  return TestBed.inject(DoughStore);
}

function phaseSummary(store: DoughStore): [number, number][] {
  return store.input().phases.map((phase) => [phase.hours, phase.temperatureC]);
}

describe('DoughStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('defaults', () => {
    it('starts with a direct neapolitan dough', () => {
      const input = createStore().input();

      expect(input.method).toBe('direct');
      expect(input.style).toBe('neapolitan');
      expect(input.ballCount).toBe(4);
      expect(input.ballWeightGrams).toBe(PIZZA_STYLES.neapolitan.defaultBallWeightGrams);
      expect(input.hydrationPercent).toBe(PIZZA_STYLES.neapolitan.defaultHydrationPercent);
      expect(input.oilPercent).toBe(0);
      expect(input.sugarPercent).toBe(0);
      expect(input.yeastType).toBe('fresh');
      expect(input.preDough).toEqual(PRE_DOUGH_DEFAULTS.poolish);
      expect(input.sourdough).toEqual(SOURDOUGH_DEFAULTS);
    });

    it('starts with three fermentation phases with unique ids', () => {
      const store = createStore();
      const ids = new Set(store.input().phases.map((phase) => phase.id));

      expect(phaseSummary(store)).toEqual([
        [2, 22],
        [24, 4],
        [4, 22],
      ]);
      expect(ids.size).toBe(3);
      expect(store.totalPhaseHours()).toBe(30);
    });

    it('exposes a computed result', () => {
      const store = createStore();

      expect(store.result().yeastType).toBe('fresh');
      store.setYeastType('instant');
      expect(store.result().yeastType).toBe('instant');
    });
  });

  describe('style change', () => {
    it('applies the default hydration and ball weight of the new style', () => {
      const store = createStore();
      store.setHydration(70);
      store.setBallWeight(300);

      store.setStyle('new-york');

      expect(store.input().style).toBe('new-york');
      expect(store.input().hydrationPercent).toBe(PIZZA_STYLES['new-york'].defaultHydrationPercent);
      expect(store.input().ballWeightGrams).toBe(PIZZA_STYLES['new-york'].defaultBallWeightGrams);
    });

    it('applies the default oil and sugar of the new style', () => {
      const store = createStore();

      store.setStyle('new-york');
      expect(store.input().oilPercent).toBe(2.5);
      expect(store.input().sugarPercent).toBe(1.5);

      store.setOil(4);
      store.setSugar(3);
      store.setStyle('roman');
      expect(store.input().oilPercent).toBe(0);
      expect(store.input().sugarPercent).toBe(0);
    });

    it('keeps custom values when the same style is selected again', () => {
      const store = createStore();
      store.setHydration(70);

      store.setStyle('neapolitan');

      expect(store.input().hydrationPercent).toBe(70);
    });
  });

  describe('method change', () => {
    it('loads the biga pre-dough defaults', () => {
      const store = createStore();

      store.setMethod('biga');

      expect(store.input().method).toBe('biga');
      expect(store.input().preDough).toEqual(PRE_DOUGH_DEFAULTS.biga);
    });

    it('loads the poolish defaults after the pre-dough was edited', () => {
      const store = createStore();
      store.setMethod('biga');
      store.updatePreDough({ flourPercent: 80, hours: 30 });

      store.setMethod('poolish');

      expect(store.input().preDough).toEqual(PRE_DOUGH_DEFAULTS.poolish);
    });

    it('does not share the default objects', () => {
      const store = createStore();
      store.setMethod('poolish');

      expect(store.input().preDough).not.toBe(PRE_DOUGH_DEFAULTS.poolish);
      expect(store.input().preDough.fermentation).not.toBe(PRE_DOUGH_DEFAULTS.poolish.fermentation);
    });
  });

  describe('sourdough', () => {
    it('switches to sourdough and computes a starter instead of yeast', () => {
      const store = createStore();

      store.setMethod('sourdough');

      expect(store.input().method).toBe('sourdough');
      expect(store.result().starter).not.toBeNull();
      expect(store.result().preDough).toBeNull();
      expect(store.result().totals.yeast).toBe(0);
    });

    it('keeps the pre-dough settings when switching to sourdough', () => {
      const store = createStore();
      store.setMethod('biga');
      store.updatePreDough({ flourPercent: 80 });

      store.setMethod('sourdough');

      expect(store.input().preDough.flourPercent).toBe(80);
    });

    it('updates and clamps the starter hydration', () => {
      const store = createStore();
      store.setMethod('sourdough');

      store.updateSourdough({ starterHydrationPercent: 72 });
      expect(store.input().sourdough.starterHydrationPercent).toBe(70);
      expect(store.result().starter?.hydrationPercent).toBe(70);

      store.updateSourdough({ starterHydrationPercent: 500 });
      expect(store.input().sourdough.starterHydrationPercent).toBe(200);

      store.updateSourdough({ starterHydrationPercent: 10 });
      expect(store.input().sourdough.starterHydrationPercent).toBe(50);
    });

    it('keeps the starter hydration across method changes', () => {
      const store = createStore();
      store.setMethod('sourdough');
      store.updateSourdough({ starterHydrationPercent: 60 });

      store.setMethod('poolish');
      store.setMethod('sourdough');

      expect(store.input().sourdough.starterHydrationPercent).toBe(60);
    });

    it('restores the starter hydration on reset', () => {
      const store = createStore();
      store.updateSourdough({ starterHydrationPercent: 60 });

      store.reset();

      expect(store.input().sourdough).toEqual(SOURDOUGH_DEFAULTS);
    });
  });

  describe('input clamping', () => {
    it('clamps values to their limits', () => {
      const store = createStore();

      store.setBallCount(80);
      store.setBallWeight(50);
      store.setHydration(Number.NaN);

      expect(store.input().ballCount).toBe(50);
      expect(store.input().ballWeightGrams).toBe(120);
      expect(store.input().hydrationPercent).toBe(50);
    });

    it('clamps oil and sugar and snaps them to steps of 0.5 %', () => {
      const store = createStore();

      store.setOil(9);
      store.setSugar(-1);
      expect(store.input().oilPercent).toBe(6);
      expect(store.input().sugarPercent).toBe(0);

      store.setOil(2.7);
      store.setSugar(1.2);
      expect(store.input().oilPercent).toBe(2.5);
      expect(store.input().sugarPercent).toBe(1);
    });

    it('snaps the ball weight to steps of 5 g', () => {
      const store = createStore();

      store.setBallWeight(263);

      expect(store.input().ballWeightGrams).toBe(265);
    });
  });

  describe('phases', () => {
    it('adds phases from presets', () => {
      const store = createStore();

      store.addPhase('fridge');
      store.addPhase('room');

      expect(phaseSummary(store).slice(-2)).toEqual([
        [24, 4],
        [2, 22],
      ]);
    });

    it('removes a phase by id', () => {
      const store = createStore();
      const [first] = store.input().phases;

      store.removePhase(first.id);

      expect(store.input().phases).toHaveLength(2);
      expect(store.input().phases.some((phase) => phase.id === first.id)).toBe(false);
    });

    it('updates hours and temperature of a phase', () => {
      const store = createStore();
      const [first] = store.input().phases;

      store.updatePhase(first.id, { hours: 3.5 });
      store.updatePhase(first.id, { temperatureC: 18 });

      expect(phaseSummary(store)[0]).toEqual([3.5, 18]);
    });

    it('moves phases up and down', () => {
      const store = createStore();
      const [first, second, third] = store.input().phases;

      store.movePhase(third.id, -1);
      expect(store.input().phases.map((phase) => phase.id)).toEqual([first.id, third.id, second.id]);

      store.movePhase(first.id, 1);
      expect(store.input().phases.map((phase) => phase.id)).toEqual([third.id, first.id, second.id]);
    });

    it('ignores moves beyond the list bounds', () => {
      const store = createStore();
      const before = store.input().phases;

      store.movePhase(before[0].id, -1);
      store.movePhase(before[2].id, 1);
      store.movePhase('unknown', 1);

      expect(store.input().phases.map((phase) => phase.id)).toEqual(before.map((phase) => phase.id));
    });
  });

  describe('schedule templates', () => {
    it('replaces all phases with the same day schedule', () => {
      const store = createStore();

      store.applyScheduleTemplate('same-day');

      expect(phaseSummary(store)).toEqual([[8, 22]]);
      expect(store.totalPhaseHours()).toBe(8);
    });

    it.each([
      ['fridge-24', 24],
      ['fridge-48', 48],
      ['fridge-72', 72],
    ] as const)('applies the %s schedule', (templateId, fridgeHours) => {
      const store = createStore();
      store.addPhase('room');

      store.applyScheduleTemplate(templateId);

      expect(phaseSummary(store)).toEqual([
        [2, 22],
        [fridgeHours, 4],
        [4, 22],
      ]);
      expect(store.totalPhaseHours()).toBe(fridgeHours + 6);
    });

    it('creates new unique phase ids', () => {
      const store = createStore();
      const previousIds = store.input().phases.map((phase) => phase.id);

      store.applyScheduleTemplate('fridge-48');

      const ids = store.input().phases.map((phase) => phase.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.some((id) => previousIds.includes(id))).toBe(false);
    });

    it('keeps the pre-ferment settings', () => {
      const store = createStore();
      store.setMethod('poolish');
      const preDough = store.input().preDough;

      store.applyScheduleTemplate('same-day');

      expect(store.input().preDough).toEqual(preDough);
    });
  });

  describe('persistence', () => {
    it('restores the saved input in a new store', () => {
      const store = createStore();
      store.setMethod('biga');
      store.setStyle('roman');
      store.setBallCount(7);
      store.addPhase('fridge');
      TestBed.tick();

      const saved = store.input();
      const restored = recreateStore();

      expect(localStorage.getItem(DOUGH_STORAGE_KEY)).not.toBeNull();
      expect(restored.input()).toEqual(saved);
    });

    it('falls back to defaults when the stored JSON is corrupted', () => {
      localStorage.setItem(DOUGH_STORAGE_KEY, '{not json');

      const store = createStore();

      expect(store.input().method).toBe('direct');
      expect(store.input().phases).toHaveLength(3);
    });

    it('falls back to defaults when the stored shape is invalid', () => {
      localStorage.setItem(
        DOUGH_STORAGE_KEY,
        JSON.stringify({ method: 'pan', style: 'neapolitan', ballCount: 4, phases: [] }),
      );

      expect(createStore().input().method).toBe('direct');
    });

    it('falls back to defaults when a stored value is out of range', () => {
      const store = createStore();
      TestBed.tick();
      const stored = JSON.parse(localStorage.getItem(DOUGH_STORAGE_KEY) ?? '{}');
      localStorage.setItem(DOUGH_STORAGE_KEY, JSON.stringify({ ...stored, ballCount: 0 }));

      expect(recreateStore().input().ballCount).toBe(4);
    });

    it('fills missing oil and sugar of older saved input with the style defaults', () => {
      const store = createStore();
      store.setStyle('new-york');
      store.setOil(4);
      store.setBallCount(3);
      TestBed.tick();
      const stored = JSON.parse(localStorage.getItem(DOUGH_STORAGE_KEY) ?? '{}');
      delete stored.oilPercent;
      delete stored.sugarPercent;
      localStorage.setItem(DOUGH_STORAGE_KEY, JSON.stringify(stored));

      const restored = recreateStore().input();

      expect(restored.ballCount).toBe(3);
      expect(restored.oilPercent).toBe(PIZZA_STYLES['new-york'].defaultOilPercent);
      expect(restored.sugarPercent).toBe(PIZZA_STYLES['new-york'].defaultSugarPercent);
    });

    it('restores custom oil and sugar', () => {
      const store = createStore();
      store.setStyle('new-york');
      store.setOil(4);
      store.setSugar(0.5);
      TestBed.tick();

      const restored = recreateStore().input();

      expect(restored.oilPercent).toBe(4);
      expect(restored.sugarPercent).toBe(0.5);
    });

    it('falls back to defaults when stored oil is out of range', () => {
      const store = createStore();
      store.setBallCount(9);
      TestBed.tick();
      const stored = JSON.parse(localStorage.getItem(DOUGH_STORAGE_KEY) ?? '{}');
      localStorage.setItem(DOUGH_STORAGE_KEY, JSON.stringify({ ...stored, oilPercent: 20 }));

      expect(recreateStore().input().ballCount).toBe(4);
    });

    it('restores a saved sourdough input', () => {
      const store = createStore();
      store.setMethod('sourdough');
      store.updateSourdough({ starterHydrationPercent: 80 });
      TestBed.tick();

      const restored = recreateStore().input();

      expect(restored.method).toBe('sourdough');
      expect(restored.sourdough.starterHydrationPercent).toBe(80);
    });

    it('fills missing sourdough settings of older saved input with the defaults', () => {
      const store = createStore();
      store.setMethod('biga');
      store.setBallCount(5);
      TestBed.tick();
      const stored = JSON.parse(localStorage.getItem(DOUGH_STORAGE_KEY) ?? '{}');
      delete stored.sourdough;
      localStorage.setItem(DOUGH_STORAGE_KEY, JSON.stringify(stored));

      const restored = recreateStore().input();

      expect(restored.method).toBe('biga');
      expect(restored.ballCount).toBe(5);
      expect(restored.sourdough).toEqual(SOURDOUGH_DEFAULTS);
    });

    it('falls back to defaults when the stored starter hydration is out of range', () => {
      const store = createStore();
      store.setBallCount(9);
      TestBed.tick();
      const stored = JSON.parse(localStorage.getItem(DOUGH_STORAGE_KEY) ?? '{}');
      localStorage.setItem(
        DOUGH_STORAGE_KEY,
        JSON.stringify({ ...stored, sourdough: { starterHydrationPercent: 400 } }),
      );

      expect(recreateStore().input().ballCount).toBe(4);
    });

    it('keeps working when storage throws', () => {
      const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });

      const store = createStore();
      store.setBallCount(6);
      TestBed.tick();

      expect(store.input().ballCount).toBe(6);
      getItem.mockRestore();
      setItem.mockRestore();
    });

    it('resets to defaults and persists them', () => {
      const store = createStore();
      store.setMethod('poolish');
      store.setBallCount(12);

      store.reset();
      TestBed.tick();

      expect(store.input().method).toBe('direct');
      expect(store.input().ballCount).toBe(4);
      expect(recreateStore().input().ballCount).toBe(4);
    });
  });
});
