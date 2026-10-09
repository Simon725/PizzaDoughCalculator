import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { DoughMethod } from '../dough/dough.model';
import { LanguageService } from '../i18n/language.service';

const METHODS: readonly DoughMethod[] = ['direct', 'poolish', 'biga'];

@Component({
  selector: 'app-method-switch',
  template: `
    <fieldset class="method-switch">
      <legend class="visually-hidden">{{ t().methods.legend }}</legend>
      @for (id of methods; track id) {
        <label class="method-tile" [class.method-tile--active]="method() === id">
          <input
            class="visually-hidden"
            type="radio"
            name="dough-method"
            [value]="id"
            [checked]="method() === id"
            (change)="method.set(id)"
          />
          <span class="method-tile__title">{{ t().methods.options[id].label }}</span>
          <span class="method-tile__text">{{ t().methods.options[id].description }}</span>
        </label>
      }
    </fieldset>
  `,
  styleUrl: './method-switch.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MethodSwitch {
  readonly method = model.required<DoughMethod>();

  protected readonly t = inject(LanguageService).t;
  protected readonly methods = METHODS;
}
