import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChildren,
} from '@angular/core';
import { AnimatedNumber } from '../shared/animated-number';
import { ballRow, ballScale } from './dough-ball-math';
import { prefersReducedMotion } from './motion';

const WOBBLE_KEYFRAMES: Keyframe[] = [
  { transform: 'scale(1, 1)' },
  { transform: 'scale(1.14, 0.86)' },
  { transform: 'scale(0.93, 1.07)' },
  { transform: 'scale(1.04, 0.97)' },
  { transform: 'scale(1, 1)' },
];

const WOBBLE_DURATION_MS = 650;
const WOBBLE_STAGGER_MS = 35;

@Component({
  selector: 'app-dough-balls',
  imports: [AnimatedNumber],
  template: `
    <div class="balls" aria-hidden="true">
      @for (index of ballIndices(); track index) {
        <span class="ball-slot">
          <span class="ball" [style.transform]="ballTransform()">
            <span #ballBody class="ball__body" [style.animation-delay.ms]="index * -370"></span>
          </span>
        </span>
      }
      @if (row().hidden > 0) {
        <span class="ball-chip">+{{ row().hidden }}</span>
      }
    </div>
    <p class="summary">
      <span>
        <strong><app-animated-number [value]="ballWeightGrams()" /> g</strong> pro Teigling
      </span>
      <span>
        gesamt <strong><app-animated-number [value]="totalGrams()" /> g</strong>
      </span>
    </p>
  `,
  styleUrl: './dough-balls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoughBalls {
  readonly ballCount = input.required<number>();
  readonly ballWeightGrams = input.required<number>();

  private readonly injector = inject(Injector);
  private readonly ballBodies = viewChildren<ElementRef<HTMLElement>>('ballBody');
  private isFirstRun = true;

  protected readonly row = computed(() => ballRow(this.ballCount()));
  protected readonly ballIndices = computed(() =>
    Array.from({ length: this.row().visible }, (_, index) => index),
  );
  protected readonly ballTransform = computed(
    () => `scale(${ballScale(this.ballWeightGrams()).toFixed(3)})`,
  );
  protected readonly totalGrams = computed(() => this.ballCount() * this.ballWeightGrams());

  constructor() {
    effect(() => {
      this.ballCount();
      this.ballWeightGrams();
      untracked(() => this.scheduleWobble());
    });
  }

  private scheduleWobble(): void {
    if (this.isFirstRun) {
      this.isFirstRun = false;
      return;
    }
    afterNextRender({ write: () => this.wobble() }, { injector: this.injector });
  }

  private wobble(): void {
    if (prefersReducedMotion()) {
      return;
    }
    this.ballBodies().forEach((body, index) => {
      const element = body.nativeElement;
      if (typeof element.animate !== 'function') {
        return;
      }
      element.animate(WOBBLE_KEYFRAMES, {
        duration: WOBBLE_DURATION_MS,
        delay: index * WOBBLE_STAGGER_MS,
        easing: 'ease-out',
      });
    });
  }
}
