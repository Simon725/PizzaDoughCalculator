import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { createSeededRandom, randomBetween } from './seeded-random';

interface Spark {
  leftPercent: number;
  delaySeconds: number;
  durationSeconds: number;
  driftPx: number;
  sizePx: number;
}

const SPARK_COUNT = 18;
const SPARK_SEED = 450;

@Component({
  selector: 'app-oven-ambience',
  template: `
    <div class="glow"></div>
    @for (spark of sparks; track $index) {
      <span
        class="spark"
        [style.left.%]="spark.leftPercent"
        [style.width.px]="spark.sizePx"
        [style.height.px]="spark.sizePx"
        [style.animation-delay.s]="spark.delaySeconds"
        [style.animation-duration.s]="spark.durationSeconds"
        [style.--drift]="spark.driftPx + 'px'"
      ></span>
    }
  `,
  styleUrl: './oven-ambience.scss',
  host: { 'aria-hidden': 'true', '[class.is-paused]': 'isPaused()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OvenAmbience {
  private readonly document = inject(DOCUMENT);

  protected readonly sparks = createSparks();
  protected readonly isPaused = signal(this.document.hidden);

  constructor() {
    const onVisibilityChange = (): void => this.isPaused.set(this.document.hidden);
    this.document.addEventListener('visibilitychange', onVisibilityChange);
    inject(DestroyRef).onDestroy(() =>
      this.document.removeEventListener('visibilitychange', onVisibilityChange),
    );
  }
}

function createSparks(): Spark[] {
  const random = createSeededRandom(SPARK_SEED);
  return Array.from({ length: SPARK_COUNT }, () => {
    const durationSeconds = randomBetween(random, 9, 18);
    return {
      leftPercent: randomBetween(random, 2, 98),
      delaySeconds: -randomBetween(random, 0, durationSeconds),
      durationSeconds,
      driftPx: randomBetween(random, -80, 80),
      sizePx: randomBetween(random, 2, 4.5),
    };
  });
}
