import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { parseBakeTime } from '../dough/bake-schedule';
import { BakeScheduleSettings } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';
import {
  fromDateAndTimeInputs,
  toDateInputValue,
  toTimeInputValue,
} from '../shared/date-time-input';

@Component({
  selector: 'app-bake-schedule-panel',
  template: `
    <label class="bake-schedule__toggle">
      <input
        class="bake-schedule__switch"
        type="checkbox"
        role="switch"
        [checked]="settings().enabled"
        (change)="toggle($event)"
      />
      <span>{{ t().bakeSchedule.enabled }}</span>
    </label>
    @if (settings().enabled) {
      <p class="bake-schedule__intro">{{ t().bakeSchedule.intro }}</p>
      <div class="bake-schedule__fields">
        <label class="bake-schedule__field">
          <span>{{ t().bakeSchedule.date }}</span>
          <input
            #dateInput
            class="bake-schedule__input"
            type="date"
            required
            [value]="dateValue()"
            (change)="commit(dateInput, timeInput)"
          />
        </label>
        <label class="bake-schedule__field">
          <span>{{ t().bakeSchedule.time }}</span>
          <input
            #timeInput
            class="bake-schedule__input"
            type="time"
            required
            [value]="timeValue()"
            (change)="commit(dateInput, timeInput)"
          />
        </label>
      </div>
    }
  `,
  styleUrl: './bake-schedule-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BakeSchedulePanel {
  readonly settings = input.required<BakeScheduleSettings>();

  readonly enabledChange = output<boolean>();
  readonly bakeAtChange = output<Date>();

  protected readonly t = inject(LanguageService).t;
  private readonly bakeAt = computed(() => parseBakeTime(this.settings().bakeAt));
  protected readonly dateValue = computed(() => {
    const bakeAt = this.bakeAt();
    return bakeAt ? toDateInputValue(bakeAt) : '';
  });
  protected readonly timeValue = computed(() => {
    const bakeAt = this.bakeAt();
    return bakeAt ? toTimeInputValue(bakeAt) : '';
  });

  protected toggle(event: Event): void {
    this.enabledChange.emit((event.target as HTMLInputElement).checked);
  }

  protected commit(dateInput: HTMLInputElement, timeInput: HTMLInputElement): void {
    const bakeAt = fromDateAndTimeInputs(dateInput.value, timeInput.value);
    if (!bakeAt) {
      dateInput.value = this.dateValue();
      timeInput.value = this.timeValue();
      return;
    }
    this.bakeAtChange.emit(bakeAt);
  }
}
