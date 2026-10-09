import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FermentationPhase } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';
import {
  SCHEDULE_TEMPLATES,
  ScheduleTemplateId,
  matchesScheduleTemplate,
} from '../state/schedule-templates';

@Component({
  selector: 'app-schedule-templates',
  template: `
    <span class="schedule-templates__legend" id="schedule-templates-legend">
      {{ t().scheduleTemplates.legend }}
    </span>
    <div class="schedule-templates__options" role="group" aria-labelledby="schedule-templates-legend">
      @for (template of templates; track template.id) {
        <button
          type="button"
          class="schedule-templates__button"
          [class.schedule-templates__button--active]="activeTemplateId() === template.id"
          [attr.aria-pressed]="activeTemplateId() === template.id"
          (click)="applyTemplate.emit(template.id)"
        >
          {{ t().scheduleTemplates.options[template.id] }}
        </button>
      }
    </div>
  `,
  styleUrl: './schedule-templates.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleTemplates {
  readonly phases = input.required<readonly FermentationPhase[]>();

  readonly applyTemplate = output<ScheduleTemplateId>();

  protected readonly t = inject(LanguageService).t;
  protected readonly templates = SCHEDULE_TEMPLATES;
  protected readonly activeTemplateId = computed(
    () => this.templates.find((template) => matchesScheduleTemplate(this.phases(), template))?.id,
  );
}
