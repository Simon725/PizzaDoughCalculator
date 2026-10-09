import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DoughInput } from '../dough/dough.model';
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
              <span class="segment__hours">{{ formatHours(segment.hours) }} h</span>
            </span>
          }
        </div>
        <ol class="legend">
          @for (segment of segments(); track segment.id) {
            <li class="legend__item">
              <span class="legend__dot" aria-hidden="true" [style.background]="segment.color"></span>
              <span class="legend__name">{{ segment.label }}</span>
              <span class="legend__meta">
                {{ formatHours(segment.hours) }} h bei {{ segment.temperatureC }} °C
                @if (segment.isCold) {
                  <span class="legend__cold" aria-hidden="true">❄</span>
                  <span class="visually-hidden">(Kühlschrank)</span>
                }
              </span>
            </li>
          }
        </ol>
      } @else {
        <p class="empty">Noch keine Gare-Phase geplant.</p>
      }
      <figcaption class="total">
        <span>
          Gesamt <strong>{{ formatHours(totalHours()) }} h</strong>
        </span>
        <span>
          entspricht <strong>{{ equivalentLabel() }} h</strong> bei 20 °C
        </span>
      </figcaption>
    </figure>
  `,
  styleUrl: './fermentation-timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FermentationTimeline {
  readonly doughInput = input.required<DoughInput>();
  readonly equivalentHoursAt20C = input.required<number>();

  protected readonly formatHours = formatHours;
  protected readonly compactPercent = COMPACT_SEGMENT_PERCENT;

  protected readonly segments = computed(() => buildTimeline(toTimelinePhases(this.doughInput())));
  protected readonly totalHours = computed(() =>
    this.segments().reduce((total, segment) => total + segment.hours, 0),
  );
  protected readonly equivalentLabel = computed(() =>
    formatHours(Math.round(this.equivalentHoursAt20C() * 10) / 10),
  );
}

function toTimelinePhases(doughInput: DoughInput): TimelinePhase[] {
  const mainPhases = doughInput.phases.map((phase, index) => ({
    id: phase.id,
    label: `Phase ${index + 1}`,
    hours: phase.hours,
    temperatureC: phase.temperatureC,
    isPreDough: false,
  }));
  if (doughInput.method === 'direct') {
    return mainPhases;
  }
  const preDough = doughInput.preDough.fermentation;
  return [
    {
      id: 'pre-dough',
      label: 'Vorteig',
      hours: preDough.hours,
      temperatureC: preDough.temperatureC,
      isPreDough: true,
    },
    ...mainPhases,
  ];
}
