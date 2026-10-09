import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageService } from './language.service';
import { LANGUAGES, TRANSLATIONS } from './translations';

@Component({
  selector: 'app-language-toggle',
  template: `
    <fieldset class="pill-toggle">
      <legend class="visually-hidden">{{ language.t().app.languageLegend }}</legend>
      @for (code of languages; track code) {
        <label class="pill-option" [class.pill-option--active]="language.language() === code">
          <input
            class="visually-hidden"
            type="radio"
            name="language"
            [value]="code"
            [checked]="language.language() === code"
            (change)="language.setLanguage(code)"
          />
          <span class="pill-option__label" aria-hidden="true">{{ code.toUpperCase() }}</span>
          <span class="visually-hidden" [attr.lang]="code">{{ names[code] }}</span>
        </label>
      }
    </fieldset>
  `,
  styleUrl: '../shared/pill-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageToggle {
  protected readonly language = inject(LanguageService);
  protected readonly languages = LANGUAGES;
  protected readonly names = {
    de: TRANSLATIONS.de.languageName,
    en: TRANSLATIONS.en.languageName,
  };
}
