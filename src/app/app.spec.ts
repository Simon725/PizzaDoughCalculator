import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
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

  it('renders the recipe card and the visual slot', async () => {
    const compiled = await render();
    expect(compiled.querySelector('.visual-slot[aria-hidden="true"]')).not.toBeNull();
    expect(compiled.querySelector('app-recipe-card h2')?.textContent).toContain('Neapolitanisch');
    expect(compiled.textContent).toContain('Hauptteig');
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
});
