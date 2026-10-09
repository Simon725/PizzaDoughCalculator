import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BakePlan } from '../dough/bake-schedule';
import { DoughInput, isPreDoughMethod } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';
import { Translations } from '../i18n/translations';
import { formatHours, formatWeekdayTime } from '../shared/format';
import { TimelinePhase, buildTimeline } from './timeline-math';

const COMPACT_SEGMENT_PERCENT = 14;
const PRE_DOUGH_SEGMENT_ID = 'pre-dough';

@Component({
  selector: 'app-fermentation-timeline',
  template: `
    <figure class="timeline">
      @if (segments().length) {
        <div class="bar" aria-hidden="true">
          @for (segment of segments(); track segment.id) {
            <span
              class="segment"
              [class.segment--pre]="segment.isPreDough"
              [class.segment--compact]="segment.widthPercent < compactPercent"
              [style.flex-basis.%]="segment.widthPercent"
              [style.--segment-color]="segment.color"
            >
              @if (segment.isCold) {
                <span class="segment__cold">❄</span>
              }
              <span class="segment__hours">{{ formatHours(segment.hours, t().locale) }} h</span>
            </span>
          }
        </div>
        <ol class="legend">
          @for (segment of segments(); track segment.id) {
            <li class="legend__item">
              <span class="legend__dot" aria-hidden="true" [style.background]="segment.color"></span>
              <span class="legend__name">{{ segment.label }}</span>
              @if (startLabels().get(segment.id); as startLabel) {
                <span class="legend__start">{{ startLabel }}</span>
              }
              <span class="legend__meta">
                {{ t().timeline.hoursAt(formatHours(segment.hours, t().locale), segment.temperatureC) }}
                @if (segment.isCold) {
                  <span class="legend__cold" aria-hidden="true">❄</span>
                  <span class="visually-hidden">{{ t().timeline.fridge }}</span>
                }
              </span>
            </li>
          }
        </ol>
      } @else {
        <p class="empty">{{ t().timeline.empty }}</p>
      }
      <figcaption class="total">
        @if (bakeLabel(); as label) {
          <strong class="total__bake">{{ label }}</strong>
        }
        <span>
          {{ t().timeline.total }} <strong>{{ formatHours(totalHours(), t().locale) }} h</strong>
        </span>
        <span>
          {{ t().timeline.equivalentPrefix }} <strong>{{ equivalentLabel() }} h</strong>
          {{ t().timeline.equivalentSuffix(referenceTemperatureC()) }}
        </span>
      </figcaption>
    </figure>
  `,
  styleUrl: './fermentation-timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FermentationTimeline {
  readonly doughInput = input.required<DoughInput>();
  readonly equivalentHours = input.required<number>();
  readonly referenceTemperatureC = input.required<number>();
  readonly bakePlan = input<BakePlan | null>(null);

  protected readonly t = inject(LanguageService).t;
  protected readonly formatHours = formatHours;
  protected readonly compactPercent = COMPACT_SEGMENT_PERCENT;

  protected readonly segments = computed(() => buildTimeline(toTimelinePhases(this.doughInput(), this.t())));
  protected readonly totalHours = computed(() =>
    this.segments().reduce((total, segment) => total + segment.hours, 0),
  );
  protected readonly startLabels = computed(() =>
    startLabelsFor(this.bakePlan(), this.t().locale),
  );
  protected readonly bakeLabel = computed(() => {
    const plan = this.bakePlan();
    const t = this.t();
    return plan ? t.bakeSchedule.bakesAt(formatWeekdayTime(plan.bakeAt, t.locale)) : '';
  });
  protected readonly equivalentLabel = computed(() =>
    formatHours(Math.round(this.equivalentHours() * 10) / 10, this.t().locale),
  );
}

function startLabelsFor(plan: BakePlan | null, locale: string): Map<string, string> {
  const labels = new Map<string, string>();
  if (!plan) {
    return labels;
  }
  if (plan.preDoughStartsAt) {
    labels.set(PRE_DOUGH_SEGMENT_ID, formatWeekdayTime(plan.preDoughStartsAt, locale));
  }
  for (const phase of plan.phases) {
    labels.set(phase.id, formatWeekdayTime(phase.startsAt, locale));
  }
  return labels;
}

function toTimelinePhases(doughInput: DoughInput, t: Translations): TimelinePhase[] {
  const mainPhases = doughInput.phases.map((phase, index) => ({
    id: phase.id,
    label: t.phases.phase(index + 1),
    hours: phase.hours,
    temperatureC: phase.temperatureC,
    isPreDough: false,
  }));
  if (!isPreDoughMethod(doughInput.method)) {
    return mainPhases;
  }
  const preDough = doughInput.preDough.fermentation;
  return [
    {
      id: PRE_DOUGH_SEGMENT_ID,
      label: t.recipe.preDough,
      hours: preDough.hours,
      temperatureC: preDough.temperatureC,
      isPreDough: true,
    },
    ...mainPhases,
  ];
}
