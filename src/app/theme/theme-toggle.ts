import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemePreference, ThemeService } from './theme.service';

interface ThemeOption {
  id: ThemePreference;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-theme-toggle',
  template: `
    <fieldset class="theme-toggle">
      <legend class="visually-hidden">Farbschema</legend>
      @for (option of options; track option.id) {
        <label class="theme-option" [class.theme-option--active]="theme.preference() === option.id">
          <input
            class="visually-hidden"
            type="radio"
            name="theme-preference"
            [value]="option.id"
            [checked]="theme.preference() === option.id"
            (change)="theme.setPreference(option.id)"
          />
          <span class="theme-option__icon" aria-hidden="true">{{ option.icon }}</span>
          <span class="theme-option__label">{{ option.label }}</span>
        </label>
      }
    </fieldset>
  `,
  styles: `
    :host {
      display: block;
    }

    .theme-toggle {
      display: flex;
      gap: 2px;
      margin: 0;
      padding: 3px;
      border: 1px solid var(--color-border);
      border-radius: 999px;
      background: var(--color-surface);
    }

    .theme-option {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      color: var(--color-text-muted);
      font-size: 0.85rem;
      cursor: pointer;
      transition:
        color 160ms ease,
        background 160ms ease;

      &:hover {
        color: var(--color-text);
      }

      &:has(input:focus-visible) {
        outline: 2px solid var(--color-flame);
        outline-offset: 1px;
      }
    }

    .theme-option--active {
      background: linear-gradient(160deg, rgba(255, 106, 43, 0.3), rgba(255, 200, 87, 0.12));
      color: var(--color-text);
    }

    .theme-option__icon {
      font-size: 0.9rem;
      line-height: 1;
    }

    @media (max-width: 420px) {
      .theme-option {
        padding: 6px 10px;
      }

      .theme-option__label {
        font-size: 0.8rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);

  protected readonly options: readonly ThemeOption[] = [
    { id: 'system', label: 'System', icon: '◐' },
    { id: 'dark', label: 'Dunkel', icon: '☾' },
    { id: 'light', label: 'Hell', icon: '☀' },
  ];
}
