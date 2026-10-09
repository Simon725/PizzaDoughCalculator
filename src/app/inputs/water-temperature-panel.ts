import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MixingType, WaterTemperatureSettings } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';
import { NumberField } from '../shared/number-field';
import { DOUGH_LIMITS } from '../state/dough-limits';
import { WaterTemperaturePatch } from '../state/dough.store';
import { formatTemperature } from '../units/unit-format';
import { temperatureField } from '../units/unit-fields';
import { UnitSystemService } from '../units/unit-system.service';

const MIXING_TYPES: readonly MixingType[] = ['hand', 'stand-mixer'];

@Component({
  selector: 'app-water-temperature-panel',
  imports: [NumberField],
  template: `
    <p class="water-temperature__intro">{{ t().waterTemperature.intro }}</p>
    <div class="water-temperature__fields">
      <label class="water-temperature__field" for="water-temperature-target">
        <span>{{ t().waterTemperature.targetDough }}</span>
        <app-number-field
          inputId="water-temperature-target"
          [label]="t().waterTemperature.targetDough"
          [unit]="fields().targetDough.unit"
          [value]="fields().targetDough.toDisplay(settings().targetDoughC)"
          [limit]="fields().targetDough.limit"
          (valueChange)="updateTargetDough($event)"
        />
      </label>
      <label class="water-temperature__field" for="water-temperature-room">
        <span>{{ t().waterTemperature.room }}</span>
        <app-number-field
          inputId="water-temperature-room"
          [label]="t().waterTemperature.room"
          [unit]="fields().room.unit"
          [value]="fields().room.toDisplay(settings().roomC)"
          [limit]="fields().room.limit"
          (valueChange)="settingsChange.emit({ roomC: fields().room.toMetric($event) })"
        />
      </label>
      <label class="water-temperature__field" for="water-temperature-flour">
        <span>{{ t().waterTemperature.flour }}</span>
        <app-number-field
          inputId="water-temperature-flour"
          [label]="t().waterTemperature.flour"
          [unit]="fields().flour.unit"
          [value]="fields().flour.toDisplay(settings().flourC)"
          [limit]="fields().flour.limit"
          (valueChange)="settingsChange.emit({ flourC: fields().flour.toMetric($event) })"
        />
      </label>
    </div>
    <fieldset class="water-temperature__mixing">
      <legend class="water-temperature__legend">{{ t().waterTemperature.mixing }}</legend>
      <span class="pill-toggle">
        @for (id of mixingTypes; track id) {
          <label class="pill-option" [class.pill-option--active]="settings().mixing === id">
            <input
              class="visually-hidden"
              type="radio"
              name="mixing-type"
              [value]="id"
              [checked]="settings().mixing === id"
              (change)="settingsChange.emit({ mixing: id })"
            />
            <span class="pill-option__label">{{ t().waterTemperature.mixingTypes[id] }}</span>
          </label>
        }
      </span>
    </fieldset>
    @if (resultText(); as text) {
      <p class="water-temperature__result">{{ text }}</p>
    }
  `,
  styleUrls: ['../shared/pill-toggle.scss', './water-temperature-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterTemperaturePanel {
  readonly settings = input.required<WaterTemperatureSettings>();
  readonly waterTemperatureC = input.required<number | null>();

  readonly settingsChange = output<WaterTemperaturePatch>();

  protected readonly mixingTypes = MIXING_TYPES;
  protected readonly t = inject(LanguageService).t;
  private readonly unitSystem = inject(UnitSystemService).unitSystem;
  protected readonly fields = computed(() => {
    const unitSystem = this.unitSystem();
    return {
      targetDough: temperatureField(DOUGH_LIMITS.targetDoughTemperatureC, unitSystem),
      room: temperatureField(DOUGH_LIMITS.roomTemperatureC, unitSystem),
      flour: temperatureField(DOUGH_LIMITS.flourTemperatureC, unitSystem),
    };
  });
  protected readonly resultText = computed(() => {
    const temperatureC = this.waterTemperatureC();
    if (temperatureC === null) {
      return '';
    }
    const t = this.t();
    return t.waterTemperature.result(formatTemperature(temperatureC, this.unitSystem(), t.locale));
  });

  protected updateTargetDough(displayValue: number): void {
    this.settingsChange.emit({ targetDoughC: this.fields().targetDough.toMetric(displayValue) });
  }
}
