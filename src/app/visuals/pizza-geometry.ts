import { PizzaStyleId } from '../dough/dough.model';
import {
  Point,
  RandomSource,
  createSeededRandom,
  randomBetween,
  scatterInDisc,
} from './seeded-random';

export const SCALE_MAX_CM = 60;
export const PLATE_DIAMETER_CM = 27;
export const PIZZA_MODEL_RADIUS = 10;

export interface RulerTick {
  cm: number;
  length: number;
  labelled: boolean;
}

export interface Disc extends Point {
  r: number;
  opacity: number;
}

export interface Blob {
  points: string;
}

export interface Leaf extends Point {
  rotation: number;
  scale: number;
}

export interface PizzaToppings {
  sauceRadius: number;
  cheeseRadius: number | null;
  charSpots: Disc[];
  mozzarella: Blob[];
  basil: Leaf[];
  pepperoni: Disc[];
}

const STYLE_SEEDS: Record<PizzaStyleId, number> = {
  neapolitan: 1889,
  'new-york': 1905,
  roman: 753,
};

export function clampDiameter(diameterCm: number): number {
  if (!Number.isFinite(diameterCm)) {
    return 0;
  }
  return Math.min(SCALE_MAX_CM, Math.max(0, diameterCm));
}

export function pizzaScale(diameterCm: number): number {
  return clampDiameter(diameterCm) / 2 / PIZZA_MODEL_RADIUS;
}

export function rulerTicks(maxCm = SCALE_MAX_CM): RulerTick[] {
  return Array.from({ length: maxCm + 1 }, (_, cm) => ({
    cm,
    length: tickLength(cm),
    labelled: cm % 10 === 0,
  }));
}

export function buildToppings(styleId: PizzaStyleId): PizzaToppings {
  const random = createSeededRandom(STYLE_SEEDS[styleId]);
  switch (styleId) {
    case 'neapolitan':
      return neapolitanToppings(random);
    case 'new-york':
      return newYorkToppings(random);
    case 'roman':
      return romanToppings(random);
  }
}

function tickLength(cm: number): number {
  if (cm % 10 === 0) {
    return 2.4;
  }
  return cm % 5 === 0 ? 1.6 : 0.9;
}

function neapolitanToppings(random: RandomSource): PizzaToppings {
  const sauceRadius = 7.6;
  return {
    sauceRadius,
    cheeseRadius: null,
    charSpots: rimSpots(random, 30, sauceRadius + 0.5, PIZZA_MODEL_RADIUS - 0.3),
    mozzarella: scatterInDisc(random, 6, 5.6, 3).map((center) => tornBlob(random, center, 1.3)),
    basil: scatterInDisc(random, 4, 5.4, 2.6).map((center) => leaf(random, center, 1)),
    pepperoni: [],
  };
}

function newYorkToppings(random: RandomSource): PizzaToppings {
  return {
    sauceRadius: 9.2,
    cheeseRadius: 8.9,
    charSpots: rimSpots(random, 10, 9.2, 9.9),
    mozzarella: [],
    basil: [],
    pepperoni: scatterInDisc(random, 12, 7.4, 2.5).map((center) => ({
      ...center,
      r: randomBetween(random, 0.95, 1.15),
      opacity: 1,
    })),
  };
}

function romanToppings(random: RandomSource): PizzaToppings {
  return {
    sauceRadius: 9.4,
    cheeseRadius: null,
    charSpots: rimSpots(random, 22, 9.4, 9.95),
    mozzarella: scatterInDisc(random, 4, 7, 4).map((center) => tornBlob(random, center, 0.9)),
    basil: scatterInDisc(random, 2, 6, 5).map((center) => leaf(random, center, 0.8)),
    pepperoni: [],
  };
}

function rimSpots(random: RandomSource, count: number, inner: number, outer: number): Disc[] {
  return Array.from({ length: count }, () => {
    const angle = random() * Math.PI * 2;
    const radius = randomBetween(random, inner, outer);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      r: randomBetween(random, 0.1, 0.38),
      opacity: randomBetween(random, 0.55, 0.9),
    };
  });
}

function tornBlob(random: RandomSource, center: Point, size: number): Blob {
  const corners = 7;
  const points = Array.from({ length: corners }, (_, index) => {
    const angle = (index / corners) * Math.PI * 2;
    const radius = size * randomBetween(random, 0.65, 1.15);
    return `${round(center.x + Math.cos(angle) * radius)},${round(center.y + Math.sin(angle) * radius)}`;
  });
  return { points: points.join(' ') };
}

function leaf(random: RandomSource, center: Point, scale: number): Leaf {
  return { ...center, rotation: round(random() * 360), scale };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
