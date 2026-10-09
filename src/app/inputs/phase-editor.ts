import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Injector,
  afterNextRender,
  inject,
  input,
  output,
} from '@angular/core';
import { FermentationPhase } from '../dough/dough.model';
import { DOUGH_LIMITS } from '../state/dough-limits';
import { MoveDirection, PhasePatch } from '../state/dough.store';
import { PHASE_PRESETS, PhasePresetId } from '../state/phase-presets';
import { formatHours } from '../shared/format';
import { NumberField } from '../shared/number-field';

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
                Phase {{ index + 1 }}
                <small>{{ isCold(phase) ? 'kalt' : 'warm' }}</small>
              </span>
              <span class="phase__actions">
                <button
                  type="button"
                  class="icon-button"
                  [id]="buttonId('up', phase.id)"
                  [attr.aria-label]="'Phase ' + (index + 1) + ' nach oben'"
                  [disabled]="first"
                  (click)="move(phase.id, -1)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  class="icon-button"
                  [id]="buttonId('down', phase.id)"
                  [attr.aria-label]="'Phase ' + (index + 1) + ' nach unten'"
                  [disabled]="last"
                  (click)="move(phase.id, 1)"
                >
                  ↓
                </button>
                <button
                  type="button"
                  class="icon-button icon-button--danger"
                  [attr.aria-label]="'Phase ' + (index + 1) + ' entfernen'"
                  (click)="removePhase.emit(phase.id)"
                >
                  ×
                </button>
              </span>
            </div>
            <div class="phase__fields">
              <app-number-field
                unit="h"
                [label]="'Dauer Phase ' + (index + 1) + ' in Stunden'"
                [value]="phase.hours"
                [limit]="limits.hours"
                (valueChange)="updatePhase.emit({ id: phase.id, patch: { hours: $event } })"
              />
              <span class="phase__at" aria-hidden="true">bei</span>
              <app-number-field
                unit="°C"
                [label]="'Temperatur Phase ' + (index + 1) + ' in Grad Celsius'"
                [value]="phase.temperatureC"
                [limit]="limits.temperatureC"
                (valueChange)="updatePhase.emit({ id: phase.id, patch: { temperatureC: $event } })"
              />
            </div>
          </li>
        }
      </ol>
    } @else {
      <p class="phase-empty">Noch keine Gare-Phase. Füge mindestens eine hinzu.</p>
    }

    <div class="phase-footer">
      <div class="phase-add" role="group" aria-label="Phase hinzufügen">
        @for (preset of presets; track preset.id) {
          <button type="button" class="phase-add__button" (click)="addPhase.emit(preset.id)">
            + {{ preset.label }}
            <small>{{ preset.temperatureC }} °C</small>
          </button>
        }
      </div>
      <p class="phase-total">
        Gesamt <strong>{{ formatHours(totalHours()) }} h</strong>
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

  protected readonly limits = DOUGH_LIMITS;
  protected readonly presets = PHASE_PRESETS;

  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  protected isCold(phase: FermentationPhase): boolean {
    return phase.temperatureC < COLD_THRESHOLD_C;
  }

  protected buttonId(direction: 'up' | 'down', phaseId: string): string {
    return `phase-${direction}-${phaseId}`;
  }

  protected readonly formatHours = formatHours;

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
