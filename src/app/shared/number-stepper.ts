import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NumberLimit, clampToLimit } from '../state/dough-limits';
import { NumberField } from './number-field';

@Component({
  selector: 'app-number-stepper',
  imports: [NumberField],
  template: `
    <button
      type="button"
      class="number-stepper__button"
      [attr.aria-label]="label() + ' verringern'"
      [disabled]="value() <= limit().min"
      (click)="stepBy(-1)"
    >
      −
    </button>
    <app-number-field
      [value]="value()"
      [limit]="limit()"
      [unit]="unit()"
      [label]="label()"
      [inputId]="inputId()"
      (valueChange)="valueChange.emit($event)"
    />
    <button
      type="button"
      class="number-stepper__button"
      [attr.aria-label]="label() + ' erhöhen'"
      [disabled]="value() >= limit().max"
      (click)="stepBy(1)"
    >
      +
    </button>
  `,
  styleUrl: './number-stepper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberStepper {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly limit = input.required<NumberLimit>();
  readonly unit = input('');
  readonly inputId = input.required<string>();

  readonly valueChange = output<number>();

  protected stepBy(direction: -1 | 1): void {
    const limit = this.limit();
    this.valueChange.emit(clampToLimit(this.value() + direction * limit.step, limit));
  }
}
