import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { formatNumber } from './format';

const TWEEN_DURATION_MS = 400;

@Component({
  selector: 'app-animated-number',
  template: '{{ formattedValue() }}',
  host: { class: 'animated-number' },
  styles: ':host { font-variant-numeric: tabular-nums; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedNumber {
  readonly value = input.required<number>();
  readonly decimals = input(0);

  private readonly displayedValue = signal<number | null>(null);
  private frameId: number | null = null;

  protected readonly formattedValue = computed(() =>
    formatNumber(this.displayedValue() ?? this.value(), this.decimals()),
  );

  constructor() {
    effect(() => {
      const target = this.value();
      untracked(() => this.animateTo(target));
    });
    inject(DestroyRef).onDestroy(() => this.cancelFrame());
  }

  private animateTo(target: number): void {
    this.cancelFrame();
    const start = this.displayedValue();
    if (start === null || start === target || !canAnimate()) {
      this.displayedValue.set(target);
      return;
    }
    const startTime = performance.now();
    const step = (now: number): void => {
      const progress = Math.min(1, (now - startTime) / TWEEN_DURATION_MS);
      this.displayedValue.set(start + (target - start) * easeOutCubic(progress));
      this.frameId = progress < 1 ? requestAnimationFrame(step) : null;
    };
    this.frameId = requestAnimationFrame(step);
  }

  private cancelFrame(): void {
    if (this.frameId === null) {
      return;
    }
    cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }
}

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

function canAnimate(): boolean {
  if (typeof requestAnimationFrame !== 'function' || typeof matchMedia !== 'function') {
    return false;
  }
  return !matchMedia('(prefers-reduced-motion: reduce)').matches;
}
