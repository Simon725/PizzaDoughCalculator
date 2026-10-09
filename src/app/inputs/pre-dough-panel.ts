import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { DoughMethod, PreDoughSettings } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';
import { DOUGH_LIMITS } from '../state/dough-limits';
import { PreDoughPatch } from '../state/dough.store';
import { NumberField } from '../shared/number-field';
import { RangeField } from '../shared/range-field';

@Component({
  selector: 'app-pre-dough-panel',
  imports: [NumberField, RangeField],
  template: `
    <p class="pre-dough__intro">
      {{ intro() }}
    </p>
    <app-range-field
      [label]="t().preDough.flourShare"
      unit="%"
      [value]="settings().flourPercent"
      [limit]="limits.preDoughFlourPercent"
      (valueChange)="settingsChange.emit({ flourPercent: $event })"
    />
    <app-range-field
      [label]="t().preDough.hydration"
      unit="%"
      [value]="settings().hydrationPercent"
      [limit]="limits.preDoughHydrationPercent"
      (valueChange)="settingsChange.emit({ hydrationPercent: $event })"
    />
    <div class="pre-dough__fermentation">
      <label class="pre-dough__field" for="pre-dough-hours">
        <span>{{ t().preDough.time }}</span>
        <app-number-field
          inputId="pre-dough-hours"
          [label]="t().preDough.timeLabel"
          unit="h"
          [value]="settings().fermentation.hours"
          [limit]="limits.hours"
          (valueChange)="settingsChange.emit({ hours: $event })"
        />
      </label>
      <label class="pre-dough__field" for="pre-dough-temperature">
        <span>{{ t().preDough.temperature }}</span>
        <app-number-field
          inputId="pre-dough-temperature"
          [label]="t().preDough.temperatureLabel"
          unit="°C"
          [value]="settings().fermentation.temperatureC"
          [limit]="limits.temperatureC"
          (valueChange)="settingsChange.emit({ temperatureC: $event })"
        />
      </label>
    </div>
  `,
  styleUrl: './pre-dough-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreDoughPanel {
  readonly method = input.required<Exclude<DoughMethod, 'direct'>>();
  readonly settings = input.required<PreDoughSettings>();

  readonly settingsChange = output<PreDoughPatch>();

  protected readonly limits = DOUGH_LIMITS;
  protected readonly t = inject(LanguageService).t;
  protected readonly intro = computed(() =>
    this.t().preDough.intro(this.t().methods.options[this.method()].label),
  );
}
