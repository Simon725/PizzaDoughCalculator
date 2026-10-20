import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageService } from '../i18n/language.service';
import { Icon, IconName } from '../shared/icon';
import { ThemePreference, ThemeService } from './theme.service';

interface ThemeOption {
  id: ThemePreference;
  icon: IconName;
}

@Component({
  selector: 'app-theme-toggle',
  imports: [Icon],
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
          <app-icon class="pill-option__icon" [name]="option.icon" />
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
    { id: 'system', icon: 'system' },
    { id: 'dark', icon: 'moon' },
    { id: 'light', icon: 'sun' },
  ];
}
