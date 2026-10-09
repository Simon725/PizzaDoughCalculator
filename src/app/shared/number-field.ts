import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NumberLimit, clampToLimit } from '../state/dough-limits';

let nextFieldId = 0;

@Component({
  selector: 'app-number-field',
  template: `
    <input
      class="number-field__input"
      type="number"
      inputmode="decimal"
      [id]="inputId()"
      [attr.aria-label]="label()"
      [min]="limit().min"
      [max]="limit().max"
      [step]="limit().step"
      [value]="value()"
      (change)="commit($event)"
    />
    @if (unit()) {
      <span class="number-field__unit" aria-hidden="true">{{ unit() }}</span>
    }
  `,
  styleUrl: './number-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberField {
  readonly value = input.required<number>();
  readonly limit = input.required<NumberLimit>();
  readonly label = input.required<string>();
  readonly unit = input('');
  readonly inputId = input(`number-field-${nextFieldId++}`);

  readonly valueChange = output<number>();

  protected commit(event: Event): void {
    const field = event.target as HTMLInputElement;
    if (Number.isNaN(field.valueAsNumber)) {
      field.value = String(this.value());
      return;
    }
    const nextValue = clampToLimit(field.valueAsNumber, this.limit());
    field.value = String(nextValue);
    if (nextValue === this.value()) {
      return;
    }
    this.valueChange.emit(nextValue);
  }
}
