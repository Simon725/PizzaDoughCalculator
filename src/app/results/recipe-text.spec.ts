import { planBakeSchedule } from '../dough/bake-schedule';
import { DoughResult } from '../dough/dough.model';
import { TRANSLATIONS } from '../i18n/translations';
import { createDefaultInput } from '../state/dough-defaults';
import { formatRecipeText } from './recipe-text';

const RESULT: DoughResult = {
  totals: {
    flour: 612.4,
    water: 379.7,
    salt: 17.15,
    yeast: 1.234,
    oil: 0,
    sugar: 0,
    total: 1010.5,
  },
  starter: null,
  preDough: { flour: 183.7, water: 183.7, salt: 0, yeast: 0.42, oil: 0, sugar: 0, total: 367.8 },
  mainDough: {
    flour: 428.7,
    water: 196,
    salt: 17.15,
    yeast: 0.814,
    oil: 0,
    sugar: 0,
    total: 642.7,
  },
  yeastType: 'fresh',
  freshYeastPercent: 0.2,
  saltPercent: 2.8,
  equivalentHours: 12,
  referenceTemperatureC: 20,
  bowlLossGrams: 19.6,
  diameterCm: 29.4,
  waterTemperatureC: 21.4,
  warnings: [],
};

describe('formatRecipeText', () => {
  it('renders all sections with rounded amounts', () => {
    const input = { ...createDefaultInput(), method: 'poolish' as const };

    const text = formatRecipeText(input, RESULT, TRANSLATIONS.de, 'metric');

    expect(text).toContain('Pizzateig – Neapolitanisch');
    expect(text).toContain('Vorteig (16 h bei 18 °C)');
    expect(text).toContain('Hauptteig');
    expect(text).toContain('Gesamt (1.011 g Teig)');
    expect(text).toContain('  Mehl: 612 g');
    expect(text).toContain('  Hefe (Frischhefe): 1,2 g');
    expect(text).toContain('inkl. 20 g Schüsselverlust (2 %)');
    expect(text).toContain('ca. 29 cm');
    expect(text).toContain('  2. 24 h bei 4 °C');
  });

  it('renders English text with English number format', () => {
    const input = { ...createDefaultInput(), method: 'poolish' as const };

    const text = formatRecipeText(input, RESULT, TRANSLATIONS.en, 'metric');

    expect(text).toContain('Pizza dough – Neapolitan');
    expect(text).toContain('Pre-ferment (16 h at 18 °C)');
    expect(text).toContain('Main dough');
    expect(text).toContain('Total (1,011 g dough)');
    expect(text).toContain('  Flour: 612 g');
    expect(text).toContain('  Yeast (fresh yeast): 1.2 g');
    expect(text).toContain('incl. 20 g bowl loss (2 %)');
    expect(text).toContain('  2. 24 h at 4 °C');
  });

  it('shows the water temperature only in the main dough', () => {
    const input = { ...createDefaultInput(), method: 'poolish' as const };

    const text = formatRecipeText(input, RESULT, TRANSLATIONS.de, 'metric');
    const [preDoughText, mainText] = text.split('Hauptteig');
    const [mainDoughText, totalText] = mainText.split('Gesamt (');

    expect(mainDoughText).toContain('  Wasser: 196 g (21 °C)');
    expect(preDoughText).toContain('  Wasser: 184 g\n');
    expect(totalText).toContain('  Wasser: 380 g\n');
  });

  it('omits the water temperature when there is none', () => {
    const text = formatRecipeText(
      createDefaultInput(),
      { ...RESULT, waterTemperatureC: null },
      TRANSLATIONS.en,
      'metric',
    );

    expect(text).toContain('  Water: 196 g\n');
  });

  it('omits oil and sugar when they are 0', () => {
    const text = formatRecipeText(createDefaultInput(), RESULT, TRANSLATIONS.en, 'metric');

    expect(text).not.toContain('Oil');
    expect(text).not.toContain('Sugar');
  });

  it('lists oil and sugar in the main dough and totals when present', () => {
    const enrichment = { oil: 15.3, sugar: 9.2 };
    const result: DoughResult = {
      ...RESULT,
      totals: { ...RESULT.totals, ...enrichment },
      mainDough: { ...RESULT.mainDough, ...enrichment },
    };
    const input = { ...createDefaultInput(), method: 'poolish' as const };

    const text = formatRecipeText(input, result, TRANSLATIONS.de, 'metric');
    const [preDoughText] = text.split('Hauptteig');

    expect(text.match(/ {2}Öl: 15 g/g)).toHaveLength(2);
    expect(text.match(/ {2}Zucker: 9 g/g)).toHaveLength(2);
    expect(preDoughText).not.toContain('Öl');
  });

  it('renders imperial units and keeps small amounts in grams', () => {
    const input = { ...createDefaultInput(), method: 'poolish' as const };

    const text = formatRecipeText(input, RESULT, TRANSLATIONS.en, 'imperial');
    const [, mainText] = text.split('Main dough');

    expect(text).toContain('4 × 8.8 oz · 62 % hydration');
    expect(text).toContain('Pre-ferment (16 h at 64 °F)');
    expect(text).toContain('Total (35.6 oz dough)');
    expect(text).toContain('  Flour: 21.6 oz');
    expect(mainText).toContain('  Water: 6.9 oz (71 °F)');
    expect(text).toContain('  Salt: 17 g');
    expect(text).toContain('  Yeast (fresh yeast): 1.2 g');
    expect(text).toContain('incl. 0.7 oz bowl loss (2 %)');
    expect(text).toContain('Diameter: approx. 12 in per pizza');
    expect(text).toContain('  2. 24 h at 39 °F');
    expect(text).not.toContain('°C');
    expect(text).not.toContain('cm');
  });

  it('renders imperial units with German number format', () => {
    const text = formatRecipeText(createDefaultInput(), RESULT, TRANSLATIONS.de, 'imperial');

    expect(text).toContain('Gesamt (35,6 oz Teig)');
    expect(text).toContain('Durchmesser: ca. 12 in pro Pizza');
    expect(text).toContain('  Hefe (Frischhefe): 1,2 g');
  });

  it('keeps oil and sugar in grams with imperial units', () => {
    const enrichment = { oil: 15.3, sugar: 9.2 };
    const result: DoughResult = {
      ...RESULT,
      totals: { ...RESULT.totals, ...enrichment },
      mainDough: { ...RESULT.mainDough, ...enrichment },
    };

    const text = formatRecipeText(createDefaultInput(), result, TRANSLATIONS.en, 'imperial');

    expect(text).toContain('  Oil: 15 g');
    expect(text).toContain('  Sugar: 9 g');
  });

  it('omits the step list without a bake plan', () => {
    const text = formatRecipeText(createDefaultInput(), RESULT, TRANSLATIONS.en, 'metric');

    expect(text).not.toContain('Steps');
    expect(text).not.toContain('Bake');
  });

  it('appends the step list when a bake plan is given', () => {
    const input = createDefaultInput();
    const plan = planBakeSchedule(input, new Date(2026, 9, 10, 19, 0));

    const expectedSteps = [
      '',
      'Steps',
      '  Fri 10/09 13:00 – Mix dough',
      '  Fri 10/09 15:00 – Start phase 2 (24 h at 4 °C)',
      '  Sat 10/10 15:00 – Start phase 3 (4 h at 22 °C)',
      '  Sat 10/10 19:00 – Bake',
    ].join('\n');

    const text = formatRecipeText(input, RESULT, TRANSLATIONS.en, 'metric', plan);

    expect(text.endsWith(expectedSteps)).toBe(true);
  });

  describe('sourdough', () => {
    const starterAmounts = {
      flour: 61.9,
      water: 61.9,
      salt: 0,
      yeast: 0,
      oil: 0,
      sugar: 0,
      total: 123.8,
    };
    const sourdoughResult: DoughResult = {
      ...RESULT,
      preDough: null,
      starter: {
        amounts: starterAmounts,
        inoculationPercent: 20,
        calculatedInoculationPercent: 20,
        hydrationPercent: 100,
      },
      totals: { ...RESULT.totals, yeast: 0 },
      mainDough: { ...RESULT.mainDough, flour: 557, water: 321.9, yeast: 0 },
      equivalentHours: 8,
      referenceTemperatureC: 22,
    };
    const input = { ...createDefaultInput(), method: 'sourdough' as const };

    it('shows the starter section and a starter line instead of yeast', () => {
      const text = formatRecipeText(input, sourdoughResult, TRANSLATIONS.de, 'metric');
      const [starterText, mainText] = text.split('Hauptteig');

      expect(text).toContain('Sauerteig-Starter (20,0 % vom Mehl · 100 % Hydration)');
      expect(starterText).toContain('  Mehl: 62 g');
      expect(starterText).toContain('  Wasser: 62 g');
      expect(mainText).toContain('  Sauerteig-Starter: 124 g');
      expect(mainText).toContain('  Wasser: 322 g (21 °C)');
      expect(text).not.toContain('Hefe');
      expect(text).not.toContain('Vorteig');
    });

    it('renders the starter in English', () => {
      const text = formatRecipeText(input, sourdoughResult, TRANSLATIONS.en, 'metric');

      expect(text).toContain('Sourdough starter (20.0 % of flour · 100 % hydration)');
      expect(text).toContain('  Sourdough starter: 124 g');
      expect(text).toContain('Sourdough');
      expect(text).not.toContain('Yeast');
    });

    it('does not list the starter again in the totals', () => {
      const text = formatRecipeText(input, sourdoughResult, TRANSLATIONS.en, 'metric');
      const totalText = text.split('Total (')[1];

      expect(totalText).not.toContain('starter');
      expect(totalText).toContain('  Flour: 612 g');
    });
  });
});
