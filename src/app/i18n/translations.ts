import {
  DoughMethod,
  DoughWarningCode,
  MixingType,
  PizzaStyleId,
  YeastType,
} from '../dough/dough.model';
import { PhasePresetId } from '../state/phase-presets';
import { ScheduleTemplateId } from '../state/schedule-templates';
import { ThemePreference } from '../theme/theme.service';

export type Language = 'de' | 'en';

export const LANGUAGES: readonly Language[] = ['de', 'en'];

export interface StyleText {
  name: string;
  description: string;
}

export interface MethodText {
  label: string;
  description: string;
}

export interface Translations {
  locale: string;
  languageName: string;
  app: {
    title: string;
    eyebrow: string;
    reset: string;
    inputs: string;
    result: string;
    pizzaSize: string;
    languageLegend: string;
  };
  panels: {
    method: string;
    preDough: string;
    sourdough: string;
    style: string;
    balls: string;
    dough: string;
    fermentation: string;
    schedule: string;
    waterTemperature: string;
  };
  fields: {
    count: string;
    ballCount: string;
    ballWeight: string;
    hydration: string;
    oil: string;
    sugar: string;
    yeast: string;
    in: string;
    decrease: (label: string) => string;
    increase: (label: string) => string;
  };
  theme: {
    legend: string;
    options: Record<ThemePreference, string>;
  };
  methods: {
    legend: string;
    options: Record<DoughMethod, MethodText>;
  };
  styles: {
    legend: string;
    salt: string;
    options: Record<PizzaStyleId, StyleText>;
  };
  yeastTypes: Record<YeastType, string>;
  preDough: {
    intro: (method: string) => string;
    flourShare: string;
    hydration: string;
    time: string;
    timeLabel: string;
    temperature: string;
    temperatureLabel: string;
  };
  sourdough: {
    intro: string;
    starterHydration: string;
    inoculation: (percent: string) => string;
  };
  waterTemperature: {
    intro: string;
    targetDough: string;
    room: string;
    flour: string;
    mixing: string;
    mixingTypes: Record<MixingType, string>;
    result: (temperature: string) => string;
  };
  phases: {
    phase: (number: number) => string;
    cold: string;
    warm: string;
    moveUp: (number: number) => string;
    moveDown: (number: number) => string;
    remove: (number: number) => string;
    durationLabel: (number: number) => string;
    temperatureLabel: (number: number) => string;
    at: string;
    empty: string;
    add: string;
    total: string;
    presets: Record<PhasePresetId, string>;
  };
  scheduleTemplates: {
    legend: string;
    options: Record<ScheduleTemplateId, string>;
  };
  timeline: {
    hoursAt: (hours: string, temperatureC: number) => string;
    fridge: string;
    empty: string;
    total: string;
    equivalentPrefix: string;
    equivalentSuffix: (temperatureC: number) => string;
  };
  balls: {
    perBall: string;
    total: string;
  };
  pizza: {
    perPizza: (style: string) => string;
    approx: string;
    description: (diameterCm: number) => string;
  };
  recipe: {
    eyebrow: string;
    diameterPrefix: string;
    diameterSuffix: string;
    fermentationSummary: (hours: string, phaseCount: number) => string;
    preDough: string;
    mainDough: string;
    total: string;
    doughGrams: (grams: string) => string;
    flour: string;
    water: string;
    salt: string;
    oil: string;
    sugar: string;
    yeast: (yeastType: string) => string;
    starter: string;
    starterNote: (inoculationPercent: string, hydrationPercent: number) => string;
    temperature: (temperatureC: string) => string;
    bowlLossPrefix: string;
    bowlLossSuffix: string;
    copy: string;
    copied: string;
    copyFailed: string;
    copiedMessage: string;
    copyFailedMessage: string;
    print: string;
    hydration: (percent: number) => string;
    textTitle: (style: string) => string;
    textBowlLoss: (grams: string) => string;
    textDiameter: (diameterCm: string) => string;
    textFermentation: string;
  };
  warnings: Record<DoughWarningCode, string>;
}

const de: Translations = {
  locale: 'de-DE',
  languageName: 'Deutsch',
  app: {
    title: 'Pizzateig-Rechner',
    eyebrow: 'Teig · Zeit · Feuer',
    reset: 'Zurücksetzen',
    inputs: 'Eingaben',
    result: 'Ergebnis',
    pizzaSize: 'Pizzagröße',
    languageLegend: 'Sprache',
  },
  panels: {
    method: 'Methode',
    preDough: 'Vorteig',
    sourdough: 'Sauerteig',
    style: 'Pizzastil',
    balls: 'Teiglinge',
    dough: 'Teig',
    fermentation: 'Gare',
    schedule: 'Zeitplan',
    waterTemperature: 'Wassertemperatur',
  },
  fields: {
    count: 'Anzahl',
    ballCount: 'Anzahl Teiglinge',
    ballWeight: 'Gewicht pro Teigling',
    hydration: 'Hydration',
    oil: 'Öl',
    sugar: 'Zucker',
    yeast: 'Hefe',
    in: 'in',
    decrease: (label) => `${label} verringern`,
    increase: (label) => `${label} erhöhen`,
  },
  theme: {
    legend: 'Farbschema',
    options: { system: 'System', dark: 'Dunkel', light: 'Hell' },
  },
  methods: {
    legend: 'Teigmethode',
    options: {
      direct: { label: 'Direkt', description: 'Alle Zutaten auf einmal – einfach und planbar.' },
      poolish: { label: 'Poolish', description: 'Flüssiger Vorteig für Aroma und offene Krume.' },
      biga: { label: 'Biga', description: 'Fester Vorteig für Struktur und kräftigen Geschmack.' },
      sourdough: {
        label: 'Sauerteig',
        description: 'Aktiver Starter statt Hefe – mild säuerlich und aromatisch.',
      },
    },
  },
  styles: {
    legend: 'Pizzastil',
    salt: 'Salz',
    options: {
      neapolitan: {
        name: 'Neapolitanisch',
        description: 'Dünne Mitte, luftiger Rand, 60–90 Sekunden bei 450 °C.',
      },
      'new-york': {
        name: 'New York',
        description: 'Groß, dünn und faltbar. Gebacken im Haushaltsofen auf Stein oder Stahl.',
      },
      roman: {
        name: 'Römisch (tonda)',
        description: 'Hauchdünn und knusprig, flach ausgerollt.',
      },
    },
  },
  yeastTypes: { fresh: 'Frischhefe', instant: 'Trockenhefe' },
  preDough: {
    intro: (method) =>
      `${method} reift vor dem Hauptteig. Anteil bezogen auf die gesamte Mehlmenge.`,
    flourShare: 'Mehlanteil im Vorteig',
    hydration: 'Hydration Vorteig',
    time: 'Reifezeit',
    timeLabel: 'Reifezeit Vorteig in Stunden',
    temperature: 'Temperatur',
    temperatureLabel: 'Temperatur Vorteig in Grad Celsius',
  },
  sourdough: {
    intro:
      'Ein aktiver Sauerteig-Starter ersetzt die Hefe. Mehl und Wasser im Starter zählen zur Gesamtmenge.',
    starterHydration: 'Hydration Starter',
    inoculation: (percent) => `Starter: ${percent} % vom Mehl – aus dem Gärplan berechnet.`,
  },
  waterTemperature: {
    intro:
      'Mit der richtigen Wassertemperatur erreicht der Teig nach dem Kneten die Zieltemperatur.',
    targetDough: 'Ziel-Teigtemperatur',
    room: 'Raumtemperatur',
    flour: 'Mehltemperatur',
    mixing: 'Kneten',
    mixingTypes: { hand: 'Von Hand', 'stand-mixer': 'Küchenmaschine' },
    result: (temperature) => `Wasser: ${temperature} °C`,
  },
  phases: {
    phase: (number) => `Phase ${number}`,
    cold: 'kalt',
    warm: 'warm',
    moveUp: (number) => `Phase ${number} nach oben`,
    moveDown: (number) => `Phase ${number} nach unten`,
    remove: (number) => `Phase ${number} entfernen`,
    durationLabel: (number) => `Dauer Phase ${number} in Stunden`,
    temperatureLabel: (number) => `Temperatur Phase ${number} in Grad Celsius`,
    at: 'bei',
    empty: 'Noch keine Gare-Phase. Füge mindestens eine hinzu.',
    add: 'Phase hinzufügen',
    total: 'Gesamt',
    presets: { room: 'Raumtemperatur', fridge: 'Kühlschrank' },
  },
  scheduleTemplates: {
    legend: 'Vorlage',
    options: {
      'same-day': 'Am selben Tag',
      'fridge-24': 'Kühlschrank 24 h',
      'fridge-48': 'Kühlschrank 48 h',
      'fridge-72': 'Kühlschrank 72 h',
    },
  },
  timeline: {
    hoursAt: (hours, temperatureC) => `${hours} h bei ${temperatureC} °C`,
    fridge: '(Kühlschrank)',
    empty: 'Noch keine Gare-Phase geplant.',
    total: 'Gesamt',
    equivalentPrefix: 'entspricht',
    equivalentSuffix: (temperatureC) => `bei ${temperatureC} °C`,
  },
  balls: {
    perBall: 'pro Teigling',
    total: 'gesamt',
  },
  pizza: {
    perPizza: (style) => `Ø pro Pizza · ${style}`,
    approx: 'ca.',
    description: (diameterCm) => `Pizza-Durchmesser ca. ${diameterCm} cm.`,
  },
  recipe: {
    eyebrow: 'Dein Rezept',
    diameterPrefix: 'Ø ca.',
    diameterSuffix: 'cm pro Pizza',
    fermentationSummary: (hours, phaseCount) =>
      `${hours} h Gare · ${phaseCount} ${phaseCount === 1 ? 'Phase' : 'Phasen'}`,
    preDough: 'Vorteig',
    mainDough: 'Hauptteig',
    total: 'Gesamt',
    doughGrams: (grams) => `${grams} g Teig`,
    flour: 'Mehl',
    water: 'Wasser',
    salt: 'Salz',
    oil: 'Öl',
    sugar: 'Zucker',
    yeast: (yeastType) => `Hefe (${yeastType})`,
    starter: 'Sauerteig-Starter',
    starterNote: (inoculationPercent, hydrationPercent) =>
      `${inoculationPercent} % vom Mehl · ${hydrationPercent} % Hydration`,
    temperature: (temperatureC) => `${temperatureC} °C`,
    bowlLossPrefix: 'inkl.',
    bowlLossSuffix: 'g Schüsselverlust (2 %)',
    copy: 'Rezept kopieren',
    copied: '✓ Kopiert',
    copyFailed: 'Fehlgeschlagen',
    copiedMessage: 'Rezept in die Zwischenablage kopiert.',
    copyFailedMessage: 'Kopieren nicht möglich. Bitte manuell markieren.',
    print: 'Drucken',
    hydration: (percent) => `${percent} % Hydration`,
    textTitle: (style) => `Pizzateig – ${style}`,
    textBowlLoss: (grams) => `inkl. ${grams} g Schüsselverlust (2 %)`,
    textDiameter: (diameterCm) => `Durchmesser: ca. ${diameterCm} cm pro Pizza`,
    textFermentation: 'Gare',
  },
  warnings: {
    'main-water-negative':
      'Der Vorteig enthält mehr Wasser als der Gesamtteig erlaubt. Erhöhe die Hydration oder senke den Vorteig-Anteil.',
    'yeast-clamped-low':
      'Die Gärzeit ist sehr lang. Die Hefemenge wurde auf das Minimum begrenzt.',
    'yeast-clamped-high':
      'Die Gärzeit ist sehr kurz. Die Hefemenge wurde auf das Maximum begrenzt.',
    'starter-water-too-high':
      'Der Starter enthält mehr Wasser als der Gesamtteig erlaubt. Erhöhe die Teig-Hydration oder senke die Starter-Hydration.',
    'starter-clamped-low':
      'Die Gärzeit ist sehr lang. Die Startermenge wurde auf das Minimum begrenzt.',
    'starter-clamped-high':
      'Die Gärzeit ist sehr kurz. Die Startermenge wurde auf das Maximum begrenzt.',
    'no-fermentation':
      'Keine Gärzeit angegeben. Es wird die maximale Hefe- bzw. Startermenge verwendet.',
    'water-temperature-low':
      'Das Wasser müsste kälter als Eiswasser sein. Verwende Eiswasser und kühle Mehl oder Raum, oder erhöhe die Ziel-Teigtemperatur.',
    'water-temperature-high':
      'Das Wasser wäre zu heiß für den Teig. Senke die Ziel-Teigtemperatur.',
  },
};

const en: Translations = {
  locale: 'en-US',
  languageName: 'English',
  app: {
    title: 'Pizza Dough Calculator',
    eyebrow: 'Dough · Time · Fire',
    reset: 'Reset',
    inputs: 'Inputs',
    result: 'Result',
    pizzaSize: 'Pizza size',
    languageLegend: 'Language',
  },
  panels: {
    method: 'Method',
    preDough: 'Pre-ferment',
    sourdough: 'Sourdough',
    style: 'Pizza style',
    balls: 'Dough balls',
    dough: 'Dough',
    fermentation: 'Fermentation',
    schedule: 'Schedule',
    waterTemperature: 'Water temperature',
  },
  fields: {
    count: 'Count',
    ballCount: 'Number of dough balls',
    ballWeight: 'Weight per dough ball',
    hydration: 'Hydration',
    oil: 'Oil',
    sugar: 'Sugar',
    yeast: 'Yeast',
    in: 'in',
    decrease: (label) => `Decrease ${label.toLowerCase()}`,
    increase: (label) => `Increase ${label.toLowerCase()}`,
  },
  theme: {
    legend: 'Color scheme',
    options: { system: 'System', dark: 'Dark', light: 'Light' },
  },
  methods: {
    legend: 'Dough method',
    options: {
      direct: { label: 'Direct', description: 'All ingredients at once – simple and predictable.' },
      poolish: { label: 'Poolish', description: 'Liquid pre-ferment for aroma and an open crumb.' },
      biga: { label: 'Biga', description: 'Stiff pre-ferment for structure and bold flavor.' },
      sourdough: {
        label: 'Sourdough',
        description: 'Active starter instead of yeast – mildly tangy and aromatic.',
      },
    },
  },
  styles: {
    legend: 'Pizza style',
    salt: 'Salt',
    options: {
      neapolitan: {
        name: 'Neapolitan',
        description: 'Thin center, airy crust, 60–90 seconds at 450 °C.',
      },
      'new-york': {
        name: 'New York',
        description: 'Large, thin and foldable. Baked in a home oven on stone or steel.',
      },
      roman: {
        name: 'Roman (tonda)',
        description: 'Paper-thin and crispy, rolled out flat.',
      },
    },
  },
  yeastTypes: { fresh: 'Fresh yeast', instant: 'Instant yeast' },
  preDough: {
    intro: (method) =>
      `${method} ferments before the main dough. Share based on the total amount of flour.`,
    flourShare: 'Flour in pre-ferment',
    hydration: 'Pre-ferment hydration',
    time: 'Time',
    timeLabel: 'Pre-ferment time in hours',
    temperature: 'Temperature',
    temperatureLabel: 'Pre-ferment temperature in degrees Celsius',
  },
  sourdough: {
    intro:
      'An active sourdough starter replaces the yeast. Flour and water in the starter count toward the totals.',
    starterHydration: 'Starter hydration',
    inoculation: (percent) => `Starter: ${percent} % of the flour – derived from the schedule.`,
  },
  waterTemperature: {
    intro: 'The right water temperature brings the dough to the target temperature after mixing.',
    targetDough: 'Target dough temperature',
    room: 'Room temperature',
    flour: 'Flour temperature',
    mixing: 'Mixing',
    mixingTypes: { hand: 'By hand', 'stand-mixer': 'Stand mixer' },
    result: (temperature) => `Water: ${temperature} °C`,
  },
  phases: {
    phase: (number) => `Phase ${number}`,
    cold: 'cold',
    warm: 'warm',
    moveUp: (number) => `Move phase ${number} up`,
    moveDown: (number) => `Move phase ${number} down`,
    remove: (number) => `Remove phase ${number}`,
    durationLabel: (number) => `Duration of phase ${number} in hours`,
    temperatureLabel: (number) => `Temperature of phase ${number} in degrees Celsius`,
    at: 'at',
    empty: 'No fermentation phase yet. Add at least one.',
    add: 'Add phase',
    total: 'Total',
    presets: { room: 'Room temperature', fridge: 'Fridge' },
  },
  scheduleTemplates: {
    legend: 'Template',
    options: {
      'same-day': 'Same day',
      'fridge-24': 'Fridge 24 h',
      'fridge-48': 'Fridge 48 h',
      'fridge-72': 'Fridge 72 h',
    },
  },
  timeline: {
    hoursAt: (hours, temperatureC) => `${hours} h at ${temperatureC} °C`,
    fridge: '(fridge)',
    empty: 'No fermentation phase planned yet.',
    total: 'Total',
    equivalentPrefix: 'equals',
    equivalentSuffix: (temperatureC) => `at ${temperatureC} °C`,
  },
  balls: {
    perBall: 'per dough ball',
    total: 'total',
  },
  pizza: {
    perPizza: (style) => `Ø per pizza · ${style}`,
    approx: 'approx.',
    description: (diameterCm) => `Pizza diameter approx. ${diameterCm} cm.`,
  },
  recipe: {
    eyebrow: 'Your recipe',
    diameterPrefix: 'Ø approx.',
    diameterSuffix: 'cm per pizza',
    fermentationSummary: (hours, phaseCount) =>
      `${hours} h fermentation · ${phaseCount} ${phaseCount === 1 ? 'phase' : 'phases'}`,
    preDough: 'Pre-ferment',
    mainDough: 'Main dough',
    total: 'Total',
    doughGrams: (grams) => `${grams} g dough`,
    flour: 'Flour',
    water: 'Water',
    salt: 'Salt',
    oil: 'Oil',
    sugar: 'Sugar',
    yeast: (yeastType) => `Yeast (${yeastType.toLowerCase()})`,
    starter: 'Sourdough starter',
    starterNote: (inoculationPercent, hydrationPercent) =>
      `${inoculationPercent} % of flour · ${hydrationPercent} % hydration`,
    temperature: (temperatureC) => `${temperatureC} °C`,
    bowlLossPrefix: 'incl.',
    bowlLossSuffix: 'g bowl loss (2 %)',
    copy: 'Copy recipe',
    copied: '✓ Copied',
    copyFailed: 'Failed',
    copiedMessage: 'Recipe copied to the clipboard.',
    copyFailedMessage: 'Copying is not possible. Please select the text manually.',
    print: 'Print',
    hydration: (percent) => `${percent} % hydration`,
    textTitle: (style) => `Pizza dough – ${style}`,
    textBowlLoss: (grams) => `incl. ${grams} g bowl loss (2 %)`,
    textDiameter: (diameterCm) => `Diameter: approx. ${diameterCm} cm per pizza`,
    textFermentation: 'Fermentation',
  },
  warnings: {
    'main-water-negative':
      'The pre-ferment holds more water than the total dough allows. Raise the hydration or lower the pre-ferment share.',
    'yeast-clamped-low':
      'The fermentation time is very long. The yeast amount was limited to the minimum.',
    'yeast-clamped-high':
      'The fermentation time is very short. The yeast amount was limited to the maximum.',
    'starter-water-too-high':
      'The starter holds more water than the total dough allows. Raise the dough hydration or lower the starter hydration.',
    'starter-clamped-low':
      'The fermentation time is very long. The starter amount was limited to the minimum.',
    'starter-clamped-high':
      'The fermentation time is very short. The starter amount was limited to the maximum.',
    'no-fermentation': 'No fermentation time given. The maximum yeast or starter amount is used.',
    'water-temperature-low':
      'The water would have to be colder than ice water. Use ice water and cool the flour or room, or raise the target dough temperature.',
    'water-temperature-high':
      'The water would be too hot for the dough. Lower the target dough temperature.',
  },
};

export const TRANSLATIONS: Record<Language, Translations> = { de, en };
