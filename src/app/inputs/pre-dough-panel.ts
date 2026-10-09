import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DoughMethod, PreDoughSettings } from '../dough/dough.model';
import { DOUGH_LIMITS } from '../state/dough-limits';
import { PreDoughPatch } from '../state/dough.store';
import { METHOD_LABELS } from '../shared/labels';
import { NumberField } from '../shared/number-field';
import { RangeField } from '../shared/range-field';

@Component({
  selector: 'app-pre-dough-panel',
  imports: [NumberField, RangeField],
  template: `
    <p class="pre-dough__intro">
      {{ methodLabel() }} reift vor dem Hauptteig. Anteil bezogen auf die gesamte Mehlmenge.
    </p>
    <app-range-field
      label="Mehlanteil im Vorteig"
      unit="%"
      [value]="settings().flourPercent"
      [limit]="limits.preDoughFlourPercent"
      (valueChange)="settingsChange.emit({ flourPercent: $event })"
    />
    <app-range-field
      label="Hydration Vorteig"
      unit="%"
      [value]="settings().hydrationPercent"
      [limit]="limits.preDoughHydrationPercent"
      (valueChange)="settingsChange.emit({ hydrationPercent: $event })"
    />
    <div class="pre-dough__fermentation">
      <label class="pre-dough__field" for="pre-dough-hours">
        <span>Reifezeit</span>
        <app-number-field
          inputId="pre-dough-hours"
          label="Reifezeit Vorteig in Stunden"
          unit="h"
          [value]="settings().fermentation.hours"
          [limit]="limits.hours"
          (valueChange)="settingsChange.emit({ hours: $event })"
        />
      </label>
      <label class="pre-dough__field" for="pre-dough-temperature">
        <span>Temperatur</span>
        <app-number-field
          inputId="pre-dough-temperature"
          label="Temperatur Vorteig in Grad Celsius"
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
  protected readonly methodLabel = computed(() => METHOD_LABELS[this.method()]);
}
