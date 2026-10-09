import {
  DoughMethod,
  DoughWarningCode,
  PizzaStyleId,
  StarterMode,
  YeastType,
} from '../dough/dough.model';
import { PhasePresetId } from '../state/phase-presets';
import { ScheduleTemplateId } from '../state/schedule-templates';
import { ThemePreference } from '../theme/theme.service';
import { UnitSystem } from '../units/unit-system.service';

export type Language = 'de' | 'en';

export const LANGUAGES: readonly Language[] = ['de', 'en'];

export type TemperatureFormatter = (celsius: number) => string;

export interface StyleText {
  name: string;
  description: (formatTemperature: TemperatureFormatter) => string;
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
    bakeTime: string;
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
  units: {
    legend: string;
    options: Record<UnitSystem, string>;
    temperatureNames: Record<UnitSystem, string>;
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
    temperatureLabel: (unitName: string) => string;
  };
  sourdough: {
    intro: string;
    starterHydration: string;
    inoculation: (percent: string) => string;
    starterMode: string;
    starterModes: Record<StarterMode, string>;
    manualStarter: string;
    calculatedHint: (percent: string) => string;
  };
  phases: {
    phase: (number: number) => string;
    cold: string;
    warm: string;
    moveUp: (number: number) => string;
    moveDown: (number: number) => string;
    remove: (number: number) => string;
    durationLabel: (number: number) => string;
    temperatureLabel: (number: number, unitName: string) => string;
    at: string;
    empty: string;
    add: string;
    total: string;
    presets: Record<PhasePresetId, string>;
  };
  bakeSchedule: {
    enabled: string;
    intro: string;
    date: string;
    time: string;
    title: string;
    startPassed: string;
    shortenToFit: string;
    moveBakeTime: (time: string) => string;
    bakesAt: (time: string) => string;
    steps: {
      preDough: (method: string) => string;
      mix: string;
      phase: (number: number, details: string) => string;
      bake: string;
    };
  };
  scheduleTemplates: {
    legend: string;
    options: Record<ScheduleTemplateId, string>;
  };
  timeline: {
    hoursAt: (hours: string, temperature: string) => string;
    fridge: string;
    empty: string;
    total: string;
    equivalentPrefix: string;
    equivalentSuffix: (temperature: string) => string;
  };
  balls: {
    perBall: string;
    total: string;
  };
  pizza: {
    perPizza: (style: string) => string;
    approx: string;
    description: (diameter: string) => string;
  };
  recipe: {
    eyebrow: string;
    diameterPrefix: string;
    diameterSuffix: string;
    fermentationSummary: (hours: string, phaseCount: number) => string;
    preDough: string;
    mainDough: string;
    total: string;
    doughWeight: (weight: string) => string;
    flour: string;
    water: string;
    salt: string;
    oil: string;
    sugar: string;
    yeast: (yeastType: string) => string;
    starter: string;
    starterNote: (inoculationPercent: string, hydrationPercent: number) => string;
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
    textBowlLoss: (weight: string) => string;
    textDiameter: (diameter: string) => string;
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
    bakeTime: 'Backzeit',
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
  units: {
    legend: 'Maßeinheiten',
    options: { metric: 'Metrisch', imperial: 'Imperial' },
    temperatureNames: { metric: 'Grad Celsius', imperial: 'Grad Fahrenheit' },
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
        description: (temperature) =>
          `Dünne Mitte, luftiger Rand, 60–90 Sekunden bei ${temperature(450)}.`,
      },
      'new-york': {
        name: 'New York',
        description: () =>
          'Groß, dünn und faltbar. Gebacken im Haushaltsofen auf Stein oder Stahl.',
      },
      roman: {
        name: 'Römisch (tonda)',
        description: () => 'Hauchdünn und knusprig, flach ausgerollt.',
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
    temperatureLabel: (unitName) => `Temperatur Vorteig in ${unitName}`,
  },
  sourdough: {
    intro:
      'Ein aktiver Sauerteig-Starter ersetzt die Hefe. Mehl und Wasser im Starter zählen zur Gesamtmenge.',
    starterHydration: 'Hydration Starter',
    inoculation: (percent) => `Starter: ${percent} % vom Mehl – aus dem Gärplan berechnet.`,
    starterMode: 'Starter-Menge',
    starterModes: { calculated: 'Berechnet', manual: 'Manuell' },
    manualStarter: 'Starter vom Mehl',
    calculatedHint: (percent) => `Berechnet: ${percent} %`,
  },
  phases: {
    phase: (number) => `Phase ${number}`,
    cold: 'kalt',
    warm: 'warm',
    moveUp: (number) => `Phase ${number} nach oben`,
    moveDown: (number) => `Phase ${number} nach unten`,
    remove: (number) => `Phase ${number} entfernen`,
    durationLabel: (number) => `Dauer Phase ${number} in Stunden`,
    temperatureLabel: (number, unitName) => `Temperatur Phase ${number} in ${unitName}`,
    at: 'bei',
    empty: 'Noch keine Gare-Phase. Füge mindestens eine hinzu.',
    add: 'Phase hinzufügen',
    total: 'Gesamt',
    presets: { room: 'Raumtemperatur', fridge: 'Kühlschrank' },
  },
  bakeSchedule: {
    enabled: 'Zeitplan ab Backzeit berechnen',
    intro:
      'Die letzte Gare-Phase endet zur Backzeit. Alle Schritte werden davon rückwärts geplant.',
    date: 'Backtag',
    time: 'Uhrzeit',
    title: 'Ablauf',
    startPassed:
      'Der erste Schritt liegt bereits in der Vergangenheit. Verkürze die Gärzeit (das Rezept wird angepasst) oder backe später.',
    shortenToFit: 'Gärzeit verkürzen, jetzt starten',
    moveBakeTime: (time) => `Später backen: ${time}`,
    bakesAt: (time) => `Backen: ${time}`,
    steps: {
      preDough: (method) => `${method} ansetzen`,
      mix: 'Teig kneten',
      phase: (number, details) => `Phase ${number} beginnt (${details})`,
      bake: 'Backen',
    },
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
    hoursAt: (hours, temperature) => `${hours} h bei ${temperature}`,
    fridge: '(Kühlschrank)',
    empty: 'Noch keine Gare-Phase geplant.',
    total: 'Gesamt',
    equivalentPrefix: 'entspricht',
    equivalentSuffix: (temperature) => `bei ${temperature}`,
  },
  balls: {
    perBall: 'pro Teigling',
    total: 'gesamt',
  },
  pizza: {
    perPizza: (style) => `Ø pro Pizza · ${style}`,
    approx: 'ca.',
    description: (diameter) => `Pizza-Durchmesser ca. ${diameter}.`,
  },
  recipe: {
    eyebrow: 'Dein Rezept',
    diameterPrefix: 'Ø ca.',
    diameterSuffix: 'pro Pizza',
    fermentationSummary: (hours, phaseCount) =>
      `${hours} h Gare · ${phaseCount} ${phaseCount === 1 ? 'Phase' : 'Phasen'}`,
    preDough: 'Vorteig',
    mainDough: 'Hauptteig',
    total: 'Gesamt',
    doughWeight: (weight) => `${weight} Teig`,
    flour: 'Mehl',
    water: 'Wasser',
    salt: 'Salz',
    oil: 'Öl',
    sugar: 'Zucker',
    yeast: (yeastType) => `Hefe (${yeastType})`,
    starter: 'Sauerteig-Starter',
    starterNote: (inoculationPercent, hydrationPercent) =>
      `${inoculationPercent} % vom Mehl · ${hydrationPercent} % Hydration`,
    bowlLossPrefix: 'inkl.',
    bowlLossSuffix: 'Schüsselverlust (2 %)',
    copy: 'Rezept kopieren',
    copied: '✓ Kopiert',
    copyFailed: 'Fehlgeschlagen',
    copiedMessage: 'Rezept in die Zwischenablage kopiert.',
    copyFailedMessage: 'Kopieren nicht möglich. Bitte manuell markieren.',
    print: 'Drucken',
    hydration: (percent) => `${percent} % Hydration`,
    textTitle: (style) => `Pizzateig – ${style}`,
    textBowlLoss: (weight) => `inkl. ${weight} Schüsselverlust (2 %)`,
    textDiameter: (diameter) => `Durchmesser: ca. ${diameter} pro Pizza`,
    textFermentation: 'Gare',
  },
  warnings: {
    'main-water-negative':
      'Der Vorteig enthält mehr Wasser als der Gesamtteig erlaubt. Erhöhe die Hydration oder senke den Vorteig-Anteil.',
    'yeast-clamped-low': 'Die Gärzeit ist sehr lang. Die Hefemenge wurde auf das Minimum begrenzt.',
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
    bakeTime: 'Bake time',
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
  units: {
    legend: 'Units',
    options: { metric: 'Metric', imperial: 'Imperial' },
    temperatureNames: { metric: 'degrees Celsius', imperial: 'degrees Fahrenheit' },
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
        description: (temperature) =>
          `Thin center, airy crust, 60–90 seconds at ${temperature(450)}.`,
      },
      'new-york': {
        name: 'New York',
        description: () => 'Large, thin and foldable. Baked in a home oven on stone or steel.',
      },
      roman: {
        name: 'Roman (tonda)',
        description: () => 'Paper-thin and crispy, rolled out flat.',
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
    temperatureLabel: (unitName) => `Pre-ferment temperature in ${unitName}`,
  },
  sourdough: {
    intro:
      'An active sourdough starter replaces the yeast. Flour and water in the starter count toward the totals.',
    starterHydration: 'Starter hydration',
    inoculation: (percent) => `Starter: ${percent} % of the flour – derived from the schedule.`,
    starterMode: 'Starter amount',
    starterModes: { calculated: 'Calculated', manual: 'Manual' },
    manualStarter: 'Starter of flour',
    calculatedHint: (percent) => `Calculated: ${percent} %`,
  },
  phases: {
    phase: (number) => `Phase ${number}`,
    cold: 'cold',
    warm: 'warm',
    moveUp: (number) => `Move phase ${number} up`,
    moveDown: (number) => `Move phase ${number} down`,
    remove: (number) => `Remove phase ${number}`,
    durationLabel: (number) => `Duration of phase ${number} in hours`,
    temperatureLabel: (number, unitName) => `Temperature of phase ${number} in ${unitName}`,
    at: 'at',
    empty: 'No fermentation phase yet. Add at least one.',
    add: 'Add phase',
    total: 'Total',
    presets: { room: 'Room temperature', fridge: 'Fridge' },
  },
  bakeSchedule: {
    enabled: 'Plan backwards from bake time',
    intro:
      'The last fermentation phase ends at the bake time. All steps are planned backwards from it.',
    date: 'Bake day',
    time: 'Time',
    title: 'Steps',
    startPassed:
      'The first step is already in the past. Shorten the fermentation (the recipe is adjusted) or bake later.',
    shortenToFit: 'Shorten fermentation, start now',
    moveBakeTime: (time) => `Bake later: ${time}`,
    bakesAt: (time) => `Bake: ${time}`,
    steps: {
      preDough: (method) => `Make ${method.toLowerCase()}`,
      mix: 'Mix dough',
      phase: (number, details) => `Start phase ${number} (${details})`,
      bake: 'Bake',
    },
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
    hoursAt: (hours, temperature) => `${hours} h at ${temperature}`,
    fridge: '(fridge)',
    empty: 'No fermentation phase planned yet.',
    total: 'Total',
    equivalentPrefix: 'equals',
    equivalentSuffix: (temperature) => `at ${temperature}`,
  },
  balls: {
    perBall: 'per dough ball',
    total: 'total',
  },
  pizza: {
    perPizza: (style) => `Ø per pizza · ${style}`,
    approx: 'approx.',
    description: (diameter) => `Pizza diameter approx. ${diameter}.`,
  },
  recipe: {
    eyebrow: 'Your recipe',
    diameterPrefix: 'Ø approx.',
    diameterSuffix: 'per pizza',
    fermentationSummary: (hours, phaseCount) =>
      `${hours} h fermentation · ${phaseCount} ${phaseCount === 1 ? 'phase' : 'phases'}`,
    preDough: 'Pre-ferment',
    mainDough: 'Main dough',
    total: 'Total',
    doughWeight: (weight) => `${weight} dough`,
    flour: 'Flour',
    water: 'Water',
    salt: 'Salt',
    oil: 'Oil',
    sugar: 'Sugar',
    yeast: (yeastType) => `Yeast (${yeastType.toLowerCase()})`,
    starter: 'Sourdough starter',
    starterNote: (inoculationPercent, hydrationPercent) =>
      `${inoculationPercent} % of flour · ${hydrationPercent} % hydration`,
    bowlLossPrefix: 'incl.',
    bowlLossSuffix: 'bowl loss (2 %)',
    copy: 'Copy recipe',
    copied: '✓ Copied',
    copyFailed: 'Failed',
    copiedMessage: 'Recipe copied to the clipboard.',
    copyFailedMessage: 'Copying is not possible. Please select the text manually.',
    print: 'Print',
    hydration: (percent) => `${percent} % hydration`,
    textTitle: (style) => `Pizza dough – ${style}`,
    textBowlLoss: (weight) => `incl. ${weight} bowl loss (2 %)`,
    textDiameter: (diameter) => `Diameter: approx. ${diameter} per pizza`,
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
  },
};

export const TRANSLATIONS: Record<Language, Translations> = { de, en };
