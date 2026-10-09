import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { PizzaStyleId } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';
import { AnimatedNumber } from '../shared/animated-number';
import { SCALE_MAX_CM, buildToppings, pizzaScale } from './pizza-geometry';

const CENTER = SCALE_MAX_CM / 2;

@Component({
  selector: 'app-pizza-visual',
  imports: [AnimatedNumber],
  templateUrl: './pizza-visual.html',
  styleUrl: './pizza-visual.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PizzaVisual {
  readonly diameterCm = input.required<number>();
  readonly styleId = input.required<PizzaStyleId>();

  protected readonly t = inject(LanguageService).t;
  protected readonly scaleMaxCm = SCALE_MAX_CM;

  protected readonly roundedDiameter = computed(() => Math.round(this.diameterCm()));
  protected readonly styleName = computed(() => this.t().styles.options[this.styleId()].name);
  protected readonly toppings = computed(() => buildToppings(this.styleId()));
  protected readonly pizzaTransform = computed(
    () => `translate(${CENTER}px, ${CENTER}px) scale(${pizzaScale(this.diameterCm())})`,
  );
}
