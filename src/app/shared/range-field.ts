import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NumberLimit, clampToLimit } from '../state/dough-limits';
import { NumberField } from './number-field';

let nextRangeId = 0;

@Component({
  selector: 'app-range-field',
  imports: [NumberField],
  template: `
    <div class="range-field__header">
      <label class="range-field__label" [for]="sliderId">{{ label() }}</label>
      <app-number-field
        [value]="value()"
        [limit]="limit()"
        [unit]="unit()"
        [label]="label() + ' in ' + unit()"
        (valueChange)="valueChange.emit($event)"
      />
    </div>
    <input
      class="range-field__slider"
      type="range"
      [id]="sliderId"
      [min]="limit().min"
      [max]="limit().max"
      [step]="limit().step"
      [value]="value()"
      [attr.aria-valuetext]="value() + ' ' + unit()"
      [style.--fill]="fillPercent()"
      (input)="slide($event)"
    />
    <div class="range-field__scale" aria-hidden="true">
      <span>{{ limit().min }} {{ unit() }}</span>
      <span>{{ limit().max }} {{ unit() }}</span>
    </div>
  `,
  styleUrl: './range-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RangeField {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly limit = input.required<NumberLimit>();
  readonly unit = input.required<string>();

  readonly valueChange = output<number>();

  protected readonly sliderId = `range-field-${nextRangeId++}`;

  protected readonly fillPercent = computed(() => {
    const { min, max } = this.limit();
    const ratio = (this.value() - min) / (max - min);
    return `${Math.min(100, Math.max(0, ratio * 100))}%`;
  });

  protected slide(event: Event): void {
    const slider = event.target as HTMLInputElement;
    this.valueChange.emit(clampToLimit(slider.valueAsNumber, this.limit()));
  }
}
