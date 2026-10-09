import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageService } from '../i18n/language.service';
import { ThemePreference, ThemeService } from './theme.service';

interface ThemeOption {
  id: ThemePreference;
  icon: string;
}

@Component({
  selector: 'app-theme-toggle',
  template: `
    <fieldset class="pill-toggle">
      <legend class="visually-hidden">{{ t().theme.legend }}</legend>
      @for (option of options; track option.id) {
        <label class="pill-option" [class.pill-option--active]="theme.preference() === option.id">
          <input
            class="visually-hidden"
            type="radio"
            name="theme-preference"
            [value]="option.id"
            [checked]="theme.preference() === option.id"
            (change)="theme.setPreference(option.id)"
          />
          <span class="pill-option__icon" aria-hidden="true">{{ option.icon }}</span>
          <span class="pill-option__label">{{ t().theme.options[option.id] }}</span>
        </label>
      }
    </fieldset>
  `,
  styleUrl: '../shared/pill-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
  protected readonly t = inject(LanguageService).t;

  protected readonly options: readonly ThemeOption[] = [
    { id: 'system', icon: '◐' },
    { id: 'dark', icon: '☾' },
    { id: 'light', icon: '☀' },
  ];
}
