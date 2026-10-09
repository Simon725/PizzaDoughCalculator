import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LanguageToggle } from './i18n/language-toggle';
import { LanguageService } from './i18n/language.service';
import { MethodSwitch } from './inputs/method-switch';
import { PhaseEditor } from './inputs/phase-editor';
import { PreDoughPanel } from './inputs/pre-dough-panel';
import { SourdoughPanel } from './inputs/sourdough-panel';
import { ScheduleTemplates } from './inputs/schedule-templates';
import { StylePicker } from './inputs/style-picker';
import { YeastToggle } from './inputs/yeast-toggle';
import { RecipeCard } from './results/recipe-card';
import { NumberStepper } from './shared/number-stepper';
import { RangeField } from './shared/range-field';
import { isPreDoughMethod } from './dough/dough.model';
import { DOUGH_LIMITS } from './state/dough-limits';
import { DoughStore } from './state/dough.store';
import { ThemeToggle } from './theme/theme-toggle';
import { DoughBalls } from './visuals/dough-balls';
import { FermentationTimeline } from './visuals/fermentation-timeline';
import { OvenAmbience } from './visuals/oven-ambience';
import { PizzaVisual } from './visuals/pizza-visual';

@Component({
  selector: 'app-root',
  imports: [
    DoughBalls,
    FermentationTimeline,
    LanguageToggle,
    MethodSwitch,
    NumberStepper,
    OvenAmbience,
    PhaseEditor,
    PizzaVisual,
    PreDoughPanel,
    RangeField,
    RecipeCard,
    ScheduleTemplates,
    SourdoughPanel,
    StylePicker,
    ThemeToggle,
    YeastToggle,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly store = inject(DoughStore);
  protected readonly t = inject(LanguageService).t;
  protected readonly limits = DOUGH_LIMITS;
  protected readonly doughInput = this.store.input;
  protected readonly preDoughMethod = computed(() => {
    const method = this.doughInput().method;
    return isPreDoughMethod(method) ? method : null;
  });
  protected readonly isSourdough = computed(() => this.doughInput().method === 'sourdough');
  protected readonly showsOilAndSugar = computed(() => this.doughInput().style === 'new-york');
}
