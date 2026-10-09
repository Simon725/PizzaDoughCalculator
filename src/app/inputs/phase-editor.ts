import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { FermentationPhase } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';
import { DOUGH_LIMITS } from '../state/dough-limits';
import { MoveDirection, PhasePatch } from '../state/dough.store';
import { PHASE_PRESETS, PhasePresetId } from '../state/phase-presets';
import { formatHours } from '../shared/format';
import { NumberField } from '../shared/number-field';
import { formatTemperature } from '../units/unit-format';
import { temperatureField } from '../units/unit-fields';
import { UnitSystemService } from '../units/unit-system.service';

export interface PhaseUpdate {
  id: string;
  patch: PhasePatch;
}

export interface PhaseMove {
  id: string;
  direction: MoveDirection;
}

const COLD_THRESHOLD_C = 10;

@Component({
  selector: 'app-phase-editor',
  imports: [NumberField],
  template: `
    @if (phases().length) {
      <ol class="phase-list">
        @for (phase of phases(); track phase.id; let index = $index, first = $first, last = $last) {
          <li class="phase" [class.phase--cold]="isCold(phase)">
            <div class="phase__header">
              <span class="phase__badge" aria-hidden="true">{{ index + 1 }}</span>
              <span class="phase__title">
                {{ t().phases.phase(index + 1) }}
                <small>{{ isCold(phase) ? t().phases.cold : t().phases.warm }}</small>
              </span>
              <span class="phase__actions">
                <button
                  type="button"
                  class="icon-button"
                  [id]="buttonId('up', phase.id)"
                  [attr.aria-label]="t().phases.moveUp(index + 1)"
                  [disabled]="first"
                  (click)="move(phase.id, -1)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  class="icon-button"
                  [id]="buttonId('down', phase.id)"
                  [attr.aria-label]="t().phases.moveDown(index + 1)"
                  [disabled]="last"
                  (click)="move(phase.id, 1)"
                >
                  ↓
                </button>
                <button
                  type="button"
                  class="icon-button icon-button--danger"
                  [attr.aria-label]="t().phases.remove(index + 1)"
                  (click)="removePhase.emit(phase.id)"
                >
                  ×
                </button>
              </span>
            </div>
            <div class="phase__fields">
              <app-number-field
                unit="h"
                [label]="t().phases.durationLabel(index + 1)"
                [value]="phase.hours"
                [limit]="limits.hours"
                (valueChange)="updatePhase.emit({ id: phase.id, patch: { hours: $event } })"
              />
              <span class="phase__at" aria-hidden="true">{{ t().phases.at }}</span>
              <app-number-field
                [unit]="temperature().unit"
                [label]="t().phases.temperatureLabel(index + 1, temperatureName())"
                [value]="temperature().toDisplay(phase.temperatureC)"
                [limit]="temperature().limit"
                (valueChange)="updateTemperature(phase.id, $event)"
              />
            </div>
          </li>
        }
      </ol>
    } @else {
      <p class="phase-empty">{{ t().phases.empty }}</p>
    }

    <div class="phase-footer">
      <div class="phase-add" role="group" [attr.aria-label]="t().phases.add">
        @for (preset of presets; track preset.id) {
          <button type="button" class="phase-add__button" (click)="addPhase.emit(preset.id)">
            + {{ t().phases.presets[preset.id] }}
            <small>{{ presetTemperature(preset.temperatureC) }}</small>
          </button>
        }
      </div>
      <p class="phase-total">
        {{ t().phases.total }} <strong>{{ formatHours(totalHours(), t().locale) }} h</strong>
      </p>
    </div>
  `,
  styleUrl: './phase-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhaseEditor {
  readonly phases = input.required<readonly FermentationPhase[]>();
  readonly totalHours = input.required<number>();

  readonly addPhase = output<PhasePresetId>();
  readonly removePhase = output<string>();
  readonly updatePhase = output<PhaseUpdate>();
  readonly movePhase = output<PhaseMove>();

  protected readonly t = inject(LanguageService).t;
  protected readonly limits = DOUGH_LIMITS;
  protected readonly presets = PHASE_PRESETS;

  private readonly unitSystem = inject(UnitSystemService).unitSystem;
  protected readonly temperature = computed(() =>
    temperatureField(this.limits.temperatureC, this.unitSystem()),
  );
  protected readonly temperatureName = computed(
    () => this.t().units.temperatureNames[this.unitSystem()],
  );

  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  protected isCold(phase: FermentationPhase): boolean {
    return phase.temperatureC < COLD_THRESHOLD_C;
  }

  protected buttonId(direction: 'up' | 'down', phaseId: string): string {
    return `phase-${direction}-${phaseId}`;
  }

  protected readonly formatHours = formatHours;

  protected presetTemperature(temperatureC: number): string {
    return formatTemperature(temperatureC, this.unitSystem(), this.t().locale);
  }

  protected updateTemperature(id: string, displayValue: number): void {
    const temperatureC = this.temperature().toMetric(displayValue);
    this.updatePhase.emit({ id, patch: { temperatureC } });
  }

  protected move(id: string, direction: MoveDirection): void {
    this.movePhase.emit({ id, direction });
    afterNextRender(() => this.restoreFocus(id, direction), { injector: this.injector });
  }

  private restoreFocus(id: string, direction: MoveDirection): void {
    const preferred = this.findButton(direction < 0 ? 'up' : 'down', id);
    const fallback = this.findButton(direction < 0 ? 'down' : 'up', id);
    const target = preferred && !preferred.disabled ? preferred : fallback;
    target?.focus();
  }

  private findButton(direction: 'up' | 'down', phaseId: string): HTMLButtonElement | null {
    return this.document.getElementById(this.buttonId(direction, phaseId)) as HTMLButtonElement | null;
  }
}
