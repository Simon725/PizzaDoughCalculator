import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageService } from '../i18n/language.service';
import { UNIT_SYSTEMS, UnitSystemService } from './unit-system.service';

@Component({
  selector: 'app-unit-system-toggle',
  template: `
    <fieldset class="pill-toggle">
      <legend class="visually-hidden">{{ t().units.legend }}</legend>
      @for (unitSystem of unitSystems; track unitSystem) {
        <label class="pill-option" [class.pill-option--active]="units.unitSystem() === unitSystem">
          <input
            class="visually-hidden"
            type="radio"
            name="unit-system"
            [value]="unitSystem"
            [checked]="units.unitSystem() === unitSystem"
            (change)="units.setUnitSystem(unitSystem)"
          />
          <span class="pill-option__label">{{ t().units.options[unitSystem] }}</span>
        </label>
      }
    </fieldset>
  `,
  styleUrl: '../shared/pill-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitSystemToggle {
  protected readonly units = inject(UnitSystemService);
  protected readonly t = inject(LanguageService).t;
  protected readonly unitSystems = UNIT_SYSTEMS;
}
