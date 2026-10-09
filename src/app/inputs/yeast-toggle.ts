import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { YeastType } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';

const YEAST_TYPES: readonly YeastType[] = ['fresh', 'instant'];

@Component({
  selector: 'app-yeast-toggle',
  template: `
    <fieldset class="yeast-toggle">
      <legend class="yeast-toggle__legend">{{ t().fields.yeast }}</legend>
      <span class="yeast-toggle__track">
        @for (id of yeastTypes; track id) {
          <label class="yeast-toggle__option" [class.yeast-toggle__option--active]="yeastType() === id">
            <input
              class="visually-hidden"
              type="radio"
              name="yeast-type"
              [value]="id"
              [checked]="yeastType() === id"
              (change)="yeastType.set(id)"
            />
            {{ t().yeastTypes[id] }}
          </label>
        }
      </span>
    </fieldset>
  `,
  styleUrl: './yeast-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YeastToggle {
  readonly yeastType = model.required<YeastType>();

  protected readonly t = inject(LanguageService).t;
  protected readonly yeastTypes = YEAST_TYPES;
}
