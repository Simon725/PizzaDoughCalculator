import {
  PIZZA_MODEL_RADIUS,
  SCALE_MAX_CM,
  buildToppings,
  clampDiameter,
  pizzaScale,
  rulerTicks,
} from './pizza-geometry';

describe('pizza geometry', () => {
  it('maps the diameter to the model scale', () => {
    expect(pizzaScale(2 * PIZZA_MODEL_RADIUS)).toBe(1);
    expect(pizzaScale(30)).toBeCloseTo(1.5);
  });

  it('clamps the diameter to the drawn scale', () => {
    expect(clampDiameter(-5)).toBe(0);
    expect(clampDiameter(Number.NaN)).toBe(0);
    expect(clampDiameter(SCALE_MAX_CM + 10)).toBe(SCALE_MAX_CM);
    expect(pizzaScale(SCALE_MAX_CM + 10)).toBe(SCALE_MAX_CM / 2 / PIZZA_MODEL_RADIUS);
  });

  it('builds ruler ticks with labels every 10 cm', () => {
    const ticks = rulerTicks(20);
    expect(ticks.length).toBe(21);
    expect(ticks.filter((tick) => tick.labelled).map((tick) => tick.cm)).toEqual([0, 10, 20]);
    expect(ticks[5].length).toBeGreaterThan(ticks[4].length);
    expect(ticks[10].length).toBeGreaterThan(ticks[5].length);
  });

  it('places toppings deterministically per style', () => {
    expect(buildToppings('neapolitan')).toEqual(buildToppings('neapolitan'));
    expect(buildToppings('neapolitan')).not.toEqual(buildToppings('roman'));
  });

  it('uses style specific toppings', () => {
    const neapolitan = buildToppings('neapolitan');
    const newYork = buildToppings('new-york');
    const roman = buildToppings('roman');

    expect(neapolitan.basil.length).toBeGreaterThan(0);
    expect(neapolitan.mozzarella.length).toBeGreaterThan(roman.mozzarella.length);
    expect(neapolitan.pepperoni).toEqual([]);
    expect(newYork.pepperoni.length).toBeGreaterThan(0);
    expect(newYork.cheeseRadius).not.toBeNull();
    expect(roman.sauceRadius).toBeGreaterThan(neapolitan.sauceRadius);
  });

  it('keeps all toppings on the pizza', () => {
    const toppings = buildToppings('new-york');
    const inside = toppings.pepperoni.every(
      (slice) => Math.hypot(slice.x, slice.y) + slice.r <= PIZZA_MODEL_RADIUS,
    );
    expect(inside).toBe(true);
  });
});
