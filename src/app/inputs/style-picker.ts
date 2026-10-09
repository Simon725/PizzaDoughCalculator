import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { PizzaStyleId } from '../dough/dough.model';
import { PIZZA_STYLES } from '../dough/pizza-styles';
import { formatNumber } from '../shared/format';

@Component({
  selector: 'app-style-picker',
  template: `
    <fieldset class="style-picker">
      <legend class="visually-hidden">Pizzastil</legend>
      @for (option of options; track option.id) {
        <label class="style-card" [class.style-card--active]="styleId() === option.id">
          <input
            class="visually-hidden"
            type="radio"
            name="pizza-style"
            [value]="option.id"
            [checked]="styleId() === option.id"
            (change)="styleId.set(option.id)"
          />
          <span class="style-card__header">
            <span class="style-card__title">{{ option.name }}</span>
            <span class="style-card__salt">Salz {{ formatPercent(option.saltPercent) }}</span>
          </span>
          <span class="style-card__text">{{ option.description }}</span>
          <span class="style-card__meta">
            {{ option.defaultBallWeightGrams }} g · {{ option.defaultHydrationPercent }} % Hydration
          </span>
        </label>
      }
    </fieldset>
  `,
  styleUrl: './style-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StylePicker {
  readonly styleId = model.required<PizzaStyleId>();

  protected readonly options = Object.values(PIZZA_STYLES);

  protected formatPercent(value: number): string {
    return `${formatNumber(value, 1)} %`;
  }
}
