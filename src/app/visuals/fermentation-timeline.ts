import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DoughInput, isPreDoughMethod } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';
import { Translations } from '../i18n/translations';
import { formatHours } from '../shared/format';
import { TimelinePhase, buildTimeline } from './timeline-math';

const COMPACT_SEGMENT_PERCENT = 14;

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

  protected readonly t = inject(LanguageService).t;
  protected readonly formatHours = formatHours;
  protected readonly compactPercent = COMPACT_SEGMENT_PERCENT;

  protected readonly segments = computed(() => buildTimeline(toTimelinePhases(this.doughInput(), this.t())));
  protected readonly totalHours = computed(() =>
    this.segments().reduce((total, segment) => total + segment.hours, 0),
  );
  protected readonly equivalentLabel = computed(() =>
    formatHours(Math.round(this.equivalentHours() * 10) / 10, this.t().locale),
  );
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
      id: 'pre-dough',
      label: t.recipe.preDough,
      hours: preDough.hours,
      temperatureC: preDough.temperatureC,
      isPreDough: true,
    },
    ...mainPhases,
  ];
}
