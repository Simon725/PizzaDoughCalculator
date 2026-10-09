export type RandomSource = () => number;

export interface Point {
  x: number;
  y: number;
}

export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomBetween(random: RandomSource, min: number, max: number): number {
  return min + random() * (max - min);
}

export function randomPointInDisc(random: RandomSource, maxRadius: number): Point {
  const radius = Math.sqrt(random()) * maxRadius;
  const angle = random() * Math.PI * 2;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

export function scatterInDisc(
  random: RandomSource,
  count: number,
  maxRadius: number,
  minDistance: number,
): Point[] {
  const points: Point[] = [];
  const maxAttempts = count * 40;
  for (let attempt = 0; attempt < maxAttempts && points.length < count; attempt++) {
    const candidate = randomPointInDisc(random, maxRadius);
    if (points.every((point) => distance(point, candidate) >= minDistance)) {
      points.push(candidate);
    }
  }
  return points;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
