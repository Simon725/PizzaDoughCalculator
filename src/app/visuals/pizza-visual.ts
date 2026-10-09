import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { PizzaStyleId } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';
import { AnimatedNumber } from '../shared/animated-number';
import {
  PLATE_DIAMETER_CM,
  SCALE_MAX_CM,
  buildToppings,
  clampDiameter,
  pizzaScale,
  rulerTicks,
} from './pizza-geometry';

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
  protected readonly center = CENTER;
  protected readonly scaleMaxCm = SCALE_MAX_CM;
  protected readonly plateRadius = PLATE_DIAMETER_CM / 2;
  protected readonly plateDiameter = PLATE_DIAMETER_CM;
  protected readonly ticks = rulerTicks();

  protected readonly roundedDiameter = computed(() => Math.round(this.diameterCm()));
  protected readonly styleName = computed(() => this.t().styles.options[this.styleId()].name);
  protected readonly toppings = computed(() => buildToppings(this.styleId()));
  protected readonly pizzaTransform = computed(
    () => `translate(${CENTER}px, ${CENTER}px) scale(${pizzaScale(this.diameterCm())})`,
  );
  protected readonly spanTransform = computed(
    () => `translateX(${CENTER}px) scaleX(${clampDiameter(this.diameterCm()) / SCALE_MAX_CM})`,
  );
  protected readonly plateComparison = computed(() => {
    const pizza = this.t().pizza;
    const difference = this.roundedDiameter() - PLATE_DIAMETER_CM;
    if (difference === 0) {
      return pizza.samePlate;
    }
    if (difference > 0) {
      return pizza.largerThanPlate(difference, PLATE_DIAMETER_CM);
    }
    return pizza.smallerThanPlate(-difference, PLATE_DIAMETER_CM);
  });
}
