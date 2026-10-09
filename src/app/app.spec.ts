import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { LANGUAGE_STORAGE_KEY } from './i18n/language.service';

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
});
