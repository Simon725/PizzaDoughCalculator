import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DoughInput, DoughResult } from '../dough/dough.model';
import { PIZZA_STYLES } from '../dough/pizza-styles';
import { AnimatedNumber } from '../shared/animated-number';
import { formatHours } from '../shared/format';
import { buildRecipeSections, roundGrams } from './recipe-sections';
import { describeDough, formatRecipeText } from './recipe-text';

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_FEEDBACK_MS = 2500;

const COPY_MESSAGES: Record<CopyState, string> = {
  idle: '',
  copied: 'Rezept in die Zwischenablage kopiert.',
  failed: 'Kopieren nicht möglich. Bitte manuell markieren.',
};

@Component({
  selector: 'app-recipe-card',
  imports: [AnimatedNumber],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeCard {
  readonly doughInput = input.required<DoughInput>();
  readonly result = input.required<DoughResult>();
  readonly totalHours = input.required<number>();

  private readonly document = inject(DOCUMENT);
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly copyState = signal<CopyState>('idle');
  protected readonly copyMessage = computed(() => COPY_MESSAGES[this.copyState()]);
  protected readonly styleName = computed(() => PIZZA_STYLES[this.doughInput().style].name);
  protected readonly summary = computed(() => describeDough(this.doughInput()));
  protected readonly sections = computed(() =>
    buildRecipeSections(this.doughInput(), this.result()),
  );
  protected readonly diameterCm = computed(() => Math.round(this.result().diameterCm));
  protected readonly bowlLossGrams = computed(() => roundGrams(this.result().bowlLossGrams));
  protected readonly fermentationSummary = computed(() => {
    const phaseCount = this.doughInput().phases.length;
    const phaseLabel = phaseCount === 1 ? 'Phase' : 'Phasen';
    return `${formatHours(this.totalHours())} h Gare · ${phaseCount} ${phaseLabel}`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearFeedbackTimer());
  }

  protected async copyRecipe(): Promise<void> {
    const text = formatRecipeText(this.doughInput(), this.result());
    try {
      await navigator.clipboard.writeText(text);
      this.showFeedback('copied');
    } catch {
      this.showFeedback('failed');
    }
  }

  protected printRecipe(): void {
    this.document.defaultView?.print();
  }

  private showFeedback(state: CopyState): void {
    this.clearFeedbackTimer();
    this.copyState.set(state);
    this.feedbackTimer = setTimeout(() => this.copyState.set('idle'), COPY_FEEDBACK_MS);
  }

  private clearFeedbackTimer(): void {
    if (this.feedbackTimer === null) {
      return;
    }
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = null;
  }
}
