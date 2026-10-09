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
import { LanguageService } from '../i18n/language.service';
import { AnimatedNumber } from '../shared/animated-number';
import { formatHours } from '../shared/format';
import { buildRecipeSections, roundGrams } from './recipe-sections';
import { describeDough, formatRecipeText } from './recipe-text';

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_FEEDBACK_MS = 2500;

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
  protected readonly t = inject(LanguageService).t;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly copyState = signal<CopyState>('idle');
  protected readonly copyMessage = computed(() => {
    const recipe = this.t().recipe;
    const messages: Record<CopyState, string> = {
      idle: '',
      copied: recipe.copiedMessage,
      failed: recipe.copyFailedMessage,
    };
    return messages[this.copyState()];
  });
  protected readonly styleName = computed(
    () => this.t().styles.options[this.doughInput().style].name,
  );
  protected readonly summary = computed(() => describeDough(this.doughInput(), this.t()));
  protected readonly sections = computed(() =>
    buildRecipeSections(this.doughInput(), this.result(), this.t()),
  );
  protected readonly warningMessages = computed(() =>
    this.result().warnings.map((warning) => this.t().warnings[warning.code]),
  );
  protected readonly diameterCm = computed(() => Math.round(this.result().diameterCm));
  protected readonly bowlLossGrams = computed(() => roundGrams(this.result().bowlLossGrams));
  protected readonly fermentationSummary = computed(() => {
    const t = this.t();
    return t.recipe.fermentationSummary(
      formatHours(this.totalHours(), t.locale),
      this.doughInput().phases.length,
    );
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearFeedbackTimer());
  }

  protected async copyRecipe(): Promise<void> {
    const text = formatRecipeText(this.doughInput(), this.result(), this.t());
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
