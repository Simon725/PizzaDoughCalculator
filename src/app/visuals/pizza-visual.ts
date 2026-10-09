import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PizzaStyleId } from '../dough/dough.model';
import { PIZZA_STYLES } from '../dough/pizza-styles';
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

  protected readonly center = CENTER;
  protected readonly scaleMaxCm = SCALE_MAX_CM;
  protected readonly plateRadius = PLATE_DIAMETER_CM / 2;
  protected readonly plateDiameter = PLATE_DIAMETER_CM;
  protected readonly ticks = rulerTicks();

  protected readonly roundedDiameter = computed(() => Math.round(this.diameterCm()));
  protected readonly styleName = computed(() => PIZZA_STYLES[this.styleId()].name);
  protected readonly toppings = computed(() => buildToppings(this.styleId()));
  protected readonly pizzaTransform = computed(
    () => `translate(${CENTER}px, ${CENTER}px) scale(${pizzaScale(this.diameterCm())})`,
  );
  protected readonly spanTransform = computed(
    () => `translateX(${CENTER}px) scaleX(${clampDiameter(this.diameterCm()) / SCALE_MAX_CM})`,
  );
  protected readonly plateComparison = computed(() => {
    const difference = this.roundedDiameter() - PLATE_DIAMETER_CM;
    if (difference === 0) {
      return 'genau so groß wie ein Essteller';
    }
    const direction = difference > 0 ? 'größer' : 'kleiner';
    return `${Math.abs(difference)} cm ${direction} als ein Essteller (${PLATE_DIAMETER_CM} cm)`;
  });
}
