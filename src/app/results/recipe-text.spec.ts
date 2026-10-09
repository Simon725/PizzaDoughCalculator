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
  equivalentHoursAt20C: 12,
  bowlLossGrams: 19.6,
  diameterCm: 29.4,
  warnings: [],
};

describe('formatRecipeText', () => {
  it('renders all sections with rounded amounts', () => {
    const input = { ...createDefaultInput(), method: 'poolish' as const };

    const text = formatRecipeText(input, RESULT, TRANSLATIONS.de);

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

    const text = formatRecipeText(input, RESULT, TRANSLATIONS.en);

    expect(text).toContain('Pizza dough – Neapolitan');
    expect(text).toContain('Pre-ferment (16 h at 18 °C)');
    expect(text).toContain('Main dough');
    expect(text).toContain('Total (1,011 g dough)');
    expect(text).toContain('  Flour: 612 g');
    expect(text).toContain('  Yeast (fresh yeast): 1.2 g');
    expect(text).toContain('incl. 20 g bowl loss (2 %)');
    expect(text).toContain('  2. 24 h at 4 °C');
  });

  it('omits oil and sugar when they are 0', () => {
    const text = formatRecipeText(createDefaultInput(), RESULT, TRANSLATIONS.en);

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

    const text = formatRecipeText(input, result, TRANSLATIONS.de);
    const [preDoughText] = text.split('Hauptteig');

    expect(text.match(/ {2}Öl: 15 g/g)).toHaveLength(2);
    expect(text.match(/ {2}Zucker: 9 g/g)).toHaveLength(2);
    expect(preDoughText).not.toContain('Öl');
  });
});
