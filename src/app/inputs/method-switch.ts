import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { DoughMethod } from '../dough/dough.model';

interface MethodOption {
  id: DoughMethod;
  label: string;
  description: string;
}

@Component({
  selector: 'app-method-switch',
  template: `
    <fieldset class="method-switch">
      <legend class="visually-hidden">Teigmethode</legend>
      @for (option of options; track option.id) {
        <label class="method-tile" [class.method-tile--active]="method() === option.id">
          <input
            class="visually-hidden"
            type="radio"
            name="dough-method"
            [value]="option.id"
            [checked]="method() === option.id"
            (change)="method.set(option.id)"
          />
          <span class="method-tile__title">{{ option.label }}</span>
          <span class="method-tile__text">{{ option.description }}</span>
        </label>
      }
    </fieldset>
  `,
  styleUrl: './method-switch.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MethodSwitch {
  readonly method = model.required<DoughMethod>();

  protected readonly options: readonly MethodOption[] = [
    { id: 'direct', label: 'Direkt', description: 'Alle Zutaten auf einmal – einfach und planbar.' },
    { id: 'poolish', label: 'Poolish', description: 'Flüssiger Vorteig für Aroma und offene Krume.' },
    { id: 'biga', label: 'Biga', description: 'Fester Vorteig für Struktur und kräftigen Geschmack.' },
  ];
}
