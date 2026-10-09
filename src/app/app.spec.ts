import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { LANGUAGE_STORAGE_KEY } from './i18n/language.service';
import { DoughStore } from './state/dough.store';
import {
  UNIT_SYSTEM_STORAGE_KEY,
  UnitSystem,
  UnitSystemService,
} from './units/unit-system.service';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'de');
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('should render the title', async () => {
    const compiled = await render();
    expect(compiled.querySelector('h1')?.textContent).toContain('Pizzateig-Rechner');
  });

  it('renders the recipe card and the visuals', async () => {
    const compiled = await render();
    expect(compiled.querySelector('.visual-slot svg[aria-hidden="true"]')).not.toBeNull();
    expect(compiled.querySelector('app-fermentation-timeline')).not.toBeNull();
    expect(compiled.querySelectorAll('app-dough-balls .ball').length).toBe(4);
    expect(compiled.querySelector('app-oven-ambience')?.getAttribute('aria-hidden')).toBe('true');
    expect(compiled.querySelector('app-recipe-card h2')?.textContent).toContain('Neapolitanisch');
    expect(compiled.textContent).toContain('Hauptteig');
  });

  it('describes the pizza size and the timeline as text', async () => {
    const compiled = await render();
    expect(compiled.querySelector('app-pizza-visual figcaption')?.textContent).toContain(
      'Pizza-Durchmesser ca. 30 cm',
    );
    expect(compiled.querySelector('app-fermentation-timeline .legend')?.textContent).toContain(
      '24 h bei 4 °C',
    );
  });

  it('shows the pre-dough panel only for poolish and biga', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-pre-dough-panel')).toBeNull();

    const poolishRadio = compiled.querySelector<HTMLInputElement>('input[value="poolish"]');
    poolishRadio?.click();
    await fixture.whenStable();

    expect(compiled.querySelector('app-pre-dough-panel')).not.toBeNull();
  });

  describe('pre-ferment temperature', () => {
    async function renderWithMethod(method: string) {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const compiled = fixture.nativeElement as HTMLElement;
      compiled.querySelector<HTMLInputElement>(`input[value="${method}"]`)?.click();
      await fixture.whenStable();
      return { fixture, compiled };
    }

    function preFermentLabel(compiled: HTMLElement): string | undefined {
      return compiled
        .querySelector('label[for="water-temperature-pre-ferment"] span')
        ?.textContent?.trim();
    }

    it('hides the field for the direct method', async () => {
      const compiled = await render();

      expect(compiled.querySelector('#water-temperature-pre-ferment')).toBeNull();
    });

    it('labels the field for poolish, biga and sourdough', async () => {
      expect(preFermentLabel((await renderWithMethod('poolish')).compiled)).toBe(
        'Vorteigtemperatur',
      );
      expect(preFermentLabel((await renderWithMethod('biga')).compiled)).toBe('Vorteigtemperatur');
      expect(preFermentLabel((await renderWithMethod('sourdough')).compiled)).toBe(
        'Startertemperatur',
      );
    });

    it('follows the room temperature until it is edited and can be reset', async () => {
      const { fixture, compiled } = await renderWithMethod('poolish');
      const store = TestBed.inject(DoughStore);
      const preFermentField = () =>
        compiled.querySelector<HTMLInputElement>('#water-temperature-pre-ferment');
      const resetButton = () =>
        compiled.querySelector<HTMLButtonElement>('.water-temperature__reset');

      store.updateWaterTemperature({ roomC: 19 });
      await fixture.whenStable();
      expect(preFermentField()?.value).toBe('19');
      expect(resetButton()).toBeNull();

      preFermentField()!.value = '16';
      preFermentField()!.dispatchEvent(new Event('change'));
      await fixture.whenStable();
      store.updateWaterTemperature({ roomC: 25 });
      await fixture.whenStable();
      expect(store.input().waterTemperature.preFermentC).toBe(16);
      expect(preFermentField()?.value).toBe('16');

      resetButton()?.click();
      await fixture.whenStable();
      expect(store.input().waterTemperature.preFermentC).toBeUndefined();
      expect(preFermentField()?.value).toBe('25');
      expect(resetButton()).toBeNull();
    });
  });

  it('switches the whole page to English', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLInputElement>('input[name="language"][value="en"]')?.click();
    await fixture.whenStable();

    expect(compiled.querySelector('h1')?.textContent).toContain('Pizza Dough Calculator');
    expect(compiled.querySelector('app-recipe-card h2')?.textContent).toContain('Neapolitan');
    expect(compiled.textContent).toContain('Main dough');
    expect(compiled.querySelector('app-fermentation-timeline .legend')?.textContent).toContain(
      '24 h at 4 °C',
    );
    expect(document.documentElement.lang).toBe('en');
  });

  describe('unit system', () => {
    async function renderFixture() {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      return { fixture, compiled: fixture.nativeElement as HTMLElement };
    }

    async function selectUnitSystem(
      fixture: ComponentFixture<App>,
      unitSystem: UnitSystem,
    ): Promise<void> {
      const compiled = fixture.nativeElement as HTMLElement;
      const selector = `input[name="unit-system"][value="${unitSystem}"]`;
      compiled.querySelector<HTMLInputElement>(selector)?.click();
      await fixture.whenStable();
    }

    async function commitNumber(
      fixture: ComponentFixture<App>,
      field: HTMLInputElement,
      value: string,
    ): Promise<void> {
      field.value = value;
      field.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    }

    it('switches displays to imperial units without changing the language', async () => {
      const { fixture, compiled } = await renderFixture();

      await selectUnitSystem(fixture, 'imperial');

      expect(compiled.querySelector('h1')?.textContent).toContain('Pizzateig-Rechner');
      expect(compiled.querySelector('app-pizza-visual figcaption')?.textContent).toContain(
        'Pizza-Durchmesser ca. 12 in',
      );
      expect(compiled.querySelector('app-fermentation-timeline .legend')?.textContent).toContain(
        '24 h bei 39 °F',
      );
      expect(compiled.querySelector('app-dough-balls')?.textContent).toContain('8,8');
      expect(compiled.querySelector('app-recipe-card')?.textContent).toContain('oz');
      expect(compiled.querySelector('app-recipe-card')?.textContent).not.toContain('°C');
      expect(localStorage.getItem(UNIT_SYSTEM_STORAGE_KEY)).toBe('imperial');
    });

    it('keeps the units when the language changes', async () => {
      const { fixture, compiled } = await renderFixture();
      await selectUnitSystem(fixture, 'imperial');

      compiled.querySelector<HTMLInputElement>('input[name="language"][value="en"]')?.click();
      await fixture.whenStable();

      expect(compiled.querySelector('app-fermentation-timeline .legend')?.textContent).toContain(
        '24 h at 39 °F',
      );
      expect(TestBed.inject(UnitSystemService).unitSystem()).toBe('imperial');
    });

    it('keeps metric units when switching to English', async () => {
      const { fixture, compiled } = await renderFixture();

      compiled.querySelector<HTMLInputElement>('input[name="language"][value="en"]')?.click();
      await fixture.whenStable();

      expect(compiled.querySelector('app-pizza-visual figcaption')?.textContent).toContain(
        'Pizza diameter approx. 30 cm',
      );
    });

    it('does not change stored values when only the units change', async () => {
      const { fixture, compiled } = await renderFixture();
      const store = TestBed.inject(DoughStore);
      const before = store.input();

      await selectUnitSystem(fixture, 'imperial');
      await selectUnitSystem(fixture, 'metric');

      expect(store.input()).toBe(before);
    });

    it('shows the ball weight in ounces and stores it in grams', async () => {
      const { fixture, compiled } = await renderFixture();
      await selectUnitSystem(fixture, 'imperial');
      const rangeField = compiled.querySelector('app-range-field');
      const field = rangeField?.querySelector<HTMLInputElement>('input[type="number"]');
      const slider = rangeField?.querySelector<HTMLInputElement>('input[type="range"]');

      expect(field?.value).toBe('8.8');
      expect(slider?.min).toBe('4.5');
      expect(slider?.max).toBe('21');
      expect(slider?.step).toBe('0.5');

      await commitNumber(fixture, field!, '12.5');

      expect(TestBed.inject(DoughStore).input().ballWeightGrams).toBe(354);
      expect(field?.value).toBe('12.5');
    });

    it('accepts phase temperatures in Fahrenheit and stores Celsius', async () => {
      const { fixture, compiled } = await renderFixture();
      await selectUnitSystem(fixture, 'imperial');
      const store = TestBed.inject(DoughStore);
      const fields = compiled.querySelectorAll<HTMLInputElement>(
        'app-phase-editor app-number-field input',
      );
      const temperatureField = fields[1];

      expect(temperatureField.value).toBe('72');
      expect(temperatureField.getAttribute('aria-label')).toContain('Grad Fahrenheit');

      await commitNumber(fixture, temperatureField, '71');

      expect(store.input().phases[0].temperatureC).toBe(21.7);
      expect(temperatureField.value).toBe('71');
    });

    it('rounds metric displays after an imperial edit without changing the store', async () => {
      const { fixture, compiled } = await renderFixture();
      const store = TestBed.inject(DoughStore);
      await selectUnitSystem(fixture, 'imperial');
      const phaseTemperature = () =>
        compiled.querySelectorAll<HTMLInputElement>('app-phase-editor app-number-field input')[1];
      const ballWeight = () =>
        compiled.querySelector<HTMLInputElement>('app-range-field input[type="number"]')!;

      await commitNumber(fixture, phaseTemperature(), '70');
      await commitNumber(fixture, ballWeight(), '12.5');
      const storedInput = store.input();

      await selectUnitSystem(fixture, 'metric');

      expect(phaseTemperature().value).toBe('21');
      expect(ballWeight().value).toBe('354');
      expect(compiled.querySelector('app-fermentation-timeline .legend')?.textContent).toContain(
        'bei 21 °C',
      );
      expect(compiled.textContent).not.toContain('21,1');
      expect(store.input()).toBe(storedInput);

      await selectUnitSystem(fixture, 'imperial');

      expect(phaseTemperature().value).toBe('70');
      expect(ballWeight().value).toBe('12.5');
      expect(store.input()).toBe(storedInput);
    });

    it('stores a metric edit after an imperial edit as entered', async () => {
      const { fixture, compiled } = await renderFixture();
      const store = TestBed.inject(DoughStore);
      await selectUnitSystem(fixture, 'imperial');
      const phaseTemperature = () =>
        compiled.querySelectorAll<HTMLInputElement>('app-phase-editor app-number-field input')[1];

      await commitNumber(fixture, phaseTemperature(), '70');
      await selectUnitSystem(fixture, 'metric');
      await commitNumber(fixture, phaseTemperature(), '23');

      expect(store.input().phases[0].temperatureC).toBe(23);
      expect(phaseTemperature().value).toBe('23');
    });

    it('accepts water temperature inputs in Fahrenheit', async () => {
      const { fixture, compiled } = await renderFixture();
      await selectUnitSystem(fixture, 'imperial');
      const roomField = compiled.querySelector<HTMLInputElement>('#water-temperature-room');

      await commitNumber(fixture, roomField!, '68');

      expect(TestBed.inject(DoughStore).input().waterTemperature.roomC).toBe(20);
      expect(compiled.querySelector('.water-temperature__result')?.textContent).toContain('°F');
    });

    it('accepts the pre-ferment temperature in Fahrenheit without drift', async () => {
      const { fixture, compiled } = await renderFixture();
      TestBed.inject(DoughStore).setMethod('biga');
      await selectUnitSystem(fixture, 'imperial');
      const preFermentField = compiled.querySelector<HTMLInputElement>(
        '#water-temperature-pre-ferment',
      );

      expect(preFermentField?.value).toBe('72');

      await commitNumber(fixture, preFermentField!, '61');

      expect(TestBed.inject(DoughStore).input().waterTemperature.preFermentC).toBe(16.1);
      expect(preFermentField?.value).toBe('61');
    });
  });
});
