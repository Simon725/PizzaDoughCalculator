import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { PizzaStyleId } from '../dough/dough.model';
import { PIZZA_STYLES } from '../dough/pizza-styles';
import { LanguageService } from '../i18n/language.service';
import { formatNumber } from '../shared/format';
import { formatTemperature, formatWeight } from '../units/unit-format';
import { UnitSystemService } from '../units/unit-system.service';

@Component({
  selector: 'app-style-picker',
  template: `
    <fieldset class="style-picker">
      <legend class="visually-hidden">{{ t().styles.legend }}</legend>
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
            <span class="style-card__title">{{ t().styles.options[option.id].name }}</span>
            <span class="style-card__salt">{{ t().styles.salt }} {{ formatPercent(option.saltPercent) }}</span>
          </span>
          <span class="style-card__text">{{ styleDescription(option.id) }}</span>
          <span class="style-card__meta">
            {{ formatBallWeight(option.defaultBallWeightGrams) }} ·
            {{ t().recipe.hydration(option.defaultHydrationPercent) }}
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

  protected readonly t = inject(LanguageService).t;
  protected readonly options = Object.values(PIZZA_STYLES);
  private readonly unitSystem = inject(UnitSystemService).unitSystem;

  protected styleDescription(styleId: PizzaStyleId): string {
    return this.t().styles.options[styleId].description((celsius) =>
      formatTemperature(celsius, this.unitSystem(), this.t().locale),
    );
  }

  protected formatBallWeight(grams: number): string {
    return formatWeight(grams, this.unitSystem(), this.t().locale);
  }

  protected formatPercent(value: number): string {
    return `${formatNumber(value, this.t().locale, 1)} %`;
  }
}
