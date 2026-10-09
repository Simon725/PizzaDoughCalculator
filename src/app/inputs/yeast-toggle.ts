import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { YeastType } from '../dough/dough.model';
import { YEAST_TYPE_LABELS } from '../shared/labels';

@Component({
  selector: 'app-yeast-toggle',
  template: `
    <fieldset class="yeast-toggle">
      <legend class="yeast-toggle__legend">Hefe</legend>
      <span class="yeast-toggle__track">
        @for (option of options; track option.id) {
          <label class="yeast-toggle__option" [class.yeast-toggle__option--active]="yeastType() === option.id">
            <input
              class="visually-hidden"
              type="radio"
              name="yeast-type"
              [value]="option.id"
              [checked]="yeastType() === option.id"
              (change)="yeastType.set(option.id)"
            />
            {{ option.label }}
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

  protected readonly options: readonly { id: YeastType; label: string }[] = [
    { id: 'fresh', label: YEAST_TYPE_LABELS.fresh },
    { id: 'instant', label: YEAST_TYPE_LABELS.instant },
  ];
}
