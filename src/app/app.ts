import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MethodSwitch } from './inputs/method-switch';
import { PhaseEditor } from './inputs/phase-editor';
import { PreDoughPanel } from './inputs/pre-dough-panel';
import { StylePicker } from './inputs/style-picker';
import { YeastToggle } from './inputs/yeast-toggle';
import { RecipeCard } from './results/recipe-card';
import { NumberStepper } from './shared/number-stepper';
import { RangeField } from './shared/range-field';
import { DOUGH_LIMITS } from './state/dough-limits';
import { DoughStore } from './state/dough.store';

@Component({
  selector: 'app-root',
  imports: [
    MethodSwitch,
    NumberStepper,
    PhaseEditor,
    PreDoughPanel,
    RangeField,
    RecipeCard,
    StylePicker,
    YeastToggle,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly store = inject(DoughStore);
  protected readonly limits = DOUGH_LIMITS;
  protected readonly doughInput = this.store.input;
  protected readonly preDoughMethod = computed(() => {
    const method = this.doughInput().method;
    return method === 'direct' ? null : method;
  });
}
