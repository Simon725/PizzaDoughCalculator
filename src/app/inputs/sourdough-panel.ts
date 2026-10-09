import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { SourdoughSettings, StarterMode } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';
import { formatNumber } from '../shared/format';
import { RangeField } from '../shared/range-field';
import { DOUGH_LIMITS } from '../state/dough-limits';
import { SourdoughPatch } from '../state/dough.store';

const STARTER_MODES: readonly StarterMode[] = ['calculated', 'manual'];

@Component({
  selector: 'app-sourdough-panel',
  imports: [RangeField],
  template: `
    <p class="sourdough__intro">{{ t().sourdough.intro }}</p>
    <app-range-field
      [label]="t().sourdough.starterHydration"
      unit="%"
      [value]="settings().starterHydrationPercent"
      [limit]="limits.starterHydrationPercent"
      (valueChange)="settingsChange.emit({ starterHydrationPercent: $event })"
    />
    <fieldset class="sourdough__mode">
      <legend class="sourdough__legend">{{ t().sourdough.starterMode }}</legend>
      <span class="pill-toggle">
        @for (mode of starterModes; track mode) {
          <label class="pill-option" [class.pill-option--active]="settings().starterMode === mode">
            <input
              class="visually-hidden"
              type="radio"
              name="starter-mode"
              [value]="mode"
              [checked]="settings().starterMode === mode"
              (change)="settingsChange.emit({ starterMode: mode })"
            />
            <span class="pill-option__label">{{ t().sourdough.starterModes[mode] }}</span>
          </label>
        }
      </span>
    </fieldset>
    @if (isManual()) {
      <app-range-field
        [label]="t().sourdough.manualStarter"
        unit="%"
        [value]="settings().manualStarterPercent"
        [limit]="limits.starterPercent"
        (valueChange)="settingsChange.emit({ manualStarterPercent: $event })"
      />
      <p class="sourdough__hint">{{ calculatedHint() }}</p>
    } @else {
      <p class="sourdough__inoculation">{{ inoculationText() }}</p>
    }
  `,
  styleUrls: ['../shared/pill-toggle.scss', './sourdough-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourdoughPanel {
  readonly settings = input.required<SourdoughSettings>();
  readonly calculatedPercent = input.required<number>();

  readonly settingsChange = output<SourdoughPatch>();

  protected readonly limits = DOUGH_LIMITS;
  protected readonly starterModes = STARTER_MODES;
  protected readonly t = inject(LanguageService).t;
  protected readonly isManual = computed(() => this.settings().starterMode === 'manual');
  private readonly formattedCalculatedPercent = computed(() =>
    formatNumber(this.calculatedPercent(), this.t().locale, 1),
  );
  protected readonly inoculationText = computed(() =>
    this.t().sourdough.inoculation(this.formattedCalculatedPercent()),
  );
  protected readonly calculatedHint = computed(() =>
    this.t().sourdough.calculatedHint(this.formattedCalculatedPercent()),
  );
}
