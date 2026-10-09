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
import { BakePlan } from '../dough/bake-schedule';
import { DoughInput, DoughResult } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';
import { AnimatedNumber } from '../shared/animated-number';
import { formatHours } from '../shared/format';
import { lengthAmount, weightAmount } from '../units/unit-format';
import { UnitSystemService } from '../units/unit-system.service';
import { buildRecipeSections } from './recipe-sections';
import { describeDough, formatRecipeText } from './recipe-text';
import { buildScheduleSteps } from './schedule-steps';

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
  readonly bakePlan = input<BakePlan | null>(null);
  readonly startHasPassed = input(false);

  private readonly document = inject(DOCUMENT);
  protected readonly t = inject(LanguageService).t;
  private readonly unitSystem = inject(UnitSystemService).unitSystem;
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
  protected readonly summary = computed(() =>
    describeDough(this.doughInput(), this.t(), this.unitSystem()),
  );
  protected readonly sections = computed(() =>
    buildRecipeSections(this.doughInput(), this.result(), this.t(), this.unitSystem()),
  );
  protected readonly scheduleSteps = computed(() => {
    const plan = this.bakePlan();
    if (!plan) {
      return [];
    }
    return buildScheduleSteps(this.doughInput().method, plan, this.t(), this.unitSystem());
  });
  protected readonly warningMessages = computed(() =>
    this.result().warnings.map((warning) => this.t().warnings[warning.code]),
  );
  protected readonly diameter = computed(() =>
    lengthAmount(this.result().diameterCm, this.unitSystem()),
  );
  protected readonly bowlLoss = computed(() =>
    weightAmount(this.result().bowlLossGrams, this.unitSystem()),
  );
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
    const text = formatRecipeText(
      this.doughInput(),
      this.result(),
      this.t(),
      this.unitSystem(),
      this.bakePlan(),
    );
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
