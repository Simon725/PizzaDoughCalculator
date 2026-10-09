import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { SourdoughSettings } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';
import { formatNumber } from '../shared/format';
import { RangeField } from '../shared/range-field';
import { DOUGH_LIMITS } from '../state/dough-limits';
import { SourdoughPatch } from '../state/dough.store';

@Component({
  selector: 'app-sourdough-panel',
  imports: [RangeField],
  template: `
    <p class="sourdough__intro">{{ t().sourdough.intro }}</p>
    <app-range-field
      [label]="t().sourdough.starterHydration"
      unit="%"
      [value]="settings().starterHydrationPercent"
      [limit]="limits.starterHydrationPercent"
      (valueChange)="settingsChange.emit({ starterHydrationPercent: $event })"
    />
    <p class="sourdough__inoculation">{{ inoculationText() }}</p>
  `,
  styleUrl: './sourdough-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourdoughPanel {
  readonly settings = input.required<SourdoughSettings>();
  readonly inoculationPercent = input.required<number>();

  readonly settingsChange = output<SourdoughPatch>();

  protected readonly limits = DOUGH_LIMITS;
  protected readonly t = inject(LanguageService).t;
  protected readonly inoculationText = computed(() => {
    const t = this.t();
    return t.sourdough.inoculation(formatNumber(this.inoculationPercent(), t.locale, 1));
  });
}
